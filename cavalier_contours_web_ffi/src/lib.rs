mod utils;

use cavalier_contours::{
    core::math::Vector2,
    polyline::{
        internal::{
            pline_intersects::all_self_intersects_as_basic,
            pline_offset::{self, create_untrimmed_raw_offset_segs},
        },
        seg_arc_radius_and_center, PlineCreation, PlineOffsetOptions, PlineSource, PlineSourceMut,
    },
    shape_algorithms::Shape,
    static_aabb2d_index::Control,
};
use js_sys::{Float64Array, Uint32Array};
use wasm_bindgen::prelude::*;

mod cavc {
    pub use cavalier_contours::core::math::*;
    pub use cavalier_contours::polyline::*;
    pub use cavalier_contours::static_aabb2d_index::*;
}

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[allow(unused)]
macro_rules! console_log {
    // Note that this is using the `log` function imported above during
    // `bare_bones`
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen(start)]
pub fn on_load() {
    utils::set_panic_hook();
}

#[wasm_bindgen(js_name = "plineParallelOffset")]
pub fn pline_parallel_offset(pline: JsValue, offset: f64, handle_self_intersects: bool) -> JsValue {
    let pl: cavc::Polyline<f64> = serde_wasm_bindgen::from_value(pline).unwrap();
    let options = PlineOffsetOptions {
        handle_self_intersects,
        ..Default::default()
    };
    let result = pl.parallel_offset_opt(offset, &options);
    serde_wasm_bindgen::to_value(&result).unwrap()
}

#[wasm_bindgen(js_name = "plineArcsToApproxLines")]
pub fn pline_arcs_to_approx_lines(pline: JsValue, error_distance: f64) -> JsValue {
    let pl: cavc::Polyline<f64> = serde_wasm_bindgen::from_value(pline).unwrap();
    let result = pl.arcs_to_approx_lines(error_distance).unwrap();
    serde_wasm_bindgen::to_value(&result).unwrap()
}

#[wasm_bindgen(js_name = "multiPlineParallelOffset")]
pub fn mutli_pline_parallel_offset(plines: JsValue, offset: f64) -> JsValue {
    let pl: Vec<cavc::Polyline<f64>> = serde_wasm_bindgen::from_value(plines).unwrap();
    let shape = Shape::from_plines(pl);
    let result = shape.parallel_offset(offset).unwrap();
    serde_wasm_bindgen::to_value(&result).unwrap()
}

#[wasm_bindgen]
pub struct StaticAABB2DIndex(cavc::StaticAABB2DIndex<f64>);

#[wasm_bindgen]
impl StaticAABB2DIndex {
    #[wasm_bindgen(constructor)]
    pub fn new(aabb_data: &[f64], node_size: usize) -> StaticAABB2DIndex {
        let mut builder =
            cavc::StaticAABB2DIndexBuilder::new_with_node_size(aabb_data.len() / 4, node_size);
        for d in aabb_data.chunks(4) {
            match d {
                &[min_x, min_y, max_x, max_y] => {
                    builder.add(min_x, min_y, max_x, max_y);
                },
                _ => panic!("data for index expected to be array of f64 as packed aabb boxes [min_x, min_y, max_x, max_y, min_x, ...], so must be divisible by 4")
            };
        }

        StaticAABB2DIndex(builder.build().unwrap())
    }

    pub fn query(&self, min_x: f64, min_y: f64, max_x: f64, max_y: f64) -> Box<[usize]> {
        self.0.query(min_x, min_y, max_x, max_y).into_boxed_slice()
    }

    #[wasm_bindgen(js_name = "levelBounds")]
    pub fn level_bounds(&self) -> Uint32Array {
        let level_bounds = self.0.level_bounds();
        let result = Uint32Array::new_with_length(level_bounds.len() as u32);
        for i in 0..level_bounds.len() {
            result.set_index(i as u32, 4 * level_bounds[i] as u32);
        }

        result
    }

    #[wasm_bindgen(js_name = "allBoxes")]
    pub fn all_boxes(&self) -> Float64Array {
        let all_boxes = self.0.all_boxes();
        let result = Float64Array::new_with_length(4 * all_boxes.len() as u32);
        for (i, aabb) in all_boxes.iter().enumerate() {
            let idx = 4 * i as u32;
            result.set_index(idx, aabb.min_x);
            result.set_index(idx + 1, aabb.min_y);
            result.set_index(idx + 2, aabb.max_x);
            result.set_index(idx + 3, aabb.max_y);
        }

        result
    }

    pub fn neighbors(&self, x: f64, y: f64, max_results: u32, max_distance: f64) -> Box<[usize]> {
        let mut count = 0;
        let mut result = Vec::new();
        let d = max_distance * max_distance;
        let mut visitor = |i, dist| {
            if dist < d {
                result.push(i);
                count += 1;
                if count < max_results {
                    Control::Continue
                } else {
                    Control::Break(())
                }
            } else {
                Control::Break(())
            }
        };

        self.0.visit_neighbors(x, y, &mut visitor);

        result.into_boxed_slice()
    }
}

#[wasm_bindgen]
pub struct Polyline(cavc::Polyline<f64>);

#[wasm_bindgen]
impl Polyline {
    #[wasm_bindgen(constructor)]
    pub fn new(vertex_data: &[f64], is_closed: bool) -> Polyline {
        let mut chunks = vertex_data.chunks_exact(3);
        assert!(
            chunks.remainder().is_empty(),
            "vertex_data expected to be divisible by 3 ([x, y, bulge] triplets)"
        );

        let mut result = cavc::Polyline::with_capacity(chunks.len(), is_closed);
        while let Some(&[x, y, bulge]) = chunks.next() {
            result.add(x, y, bulge);
        }

        Polyline(result)
    }

    pub fn add(&mut self, x: f64, y: f64, bulge: f64) {
        self.0.add(x, y, bulge);
    }

    pub fn clear(&mut self) {
        self.0.clear()
    }

    #[wasm_bindgen(getter = length)]
    pub fn length(&self) -> usize {
        self.0.vertex_count()
    }

    #[wasm_bindgen(js_name = "cycleVertexes")]
    pub fn cycle_vertexes(&mut self, count: usize) {
        assert!(self.0.is_closed());
        let iter = self
            .0
            .iter_vertexes()
            .cycle()
            .skip(count)
            .take(self.0.vertex_count());

        self.0 = cavc::Polyline::from_iter(iter, true);
    }

    #[wasm_bindgen(js_name = "vertexData")]
    pub fn vertex_data(&self) -> Box<[f64]> {
        pline_vertexes_to_data(&self.0).into_boxed_slice()
    }

    #[wasm_bindgen(getter = isClosed)]
    pub fn is_closed(&self) -> bool {
        self.0.is_closed()
    }

    #[wasm_bindgen(setter = isClosed)]
    pub fn set_is_closed(&mut self, is_closed: bool) {
        self.0.set_is_closed(is_closed);
    }

    pub fn area(&self) -> f64 {
        self.0.area()
    }

    #[wasm_bindgen(js_name = "pathLength")]
    pub fn path_length(&self) -> f64 {
        self.0.path_length()
    }

    pub fn scale(&mut self, scale_factor: f64) {
        self.0.scale_mut(scale_factor);
    }

    pub fn translate(&mut self, x_offset: f64, y_offset: f64) {
        self.0.translate_mut(x_offset, y_offset);
    }

    #[wasm_bindgen(js_name = "windingNumber")]
    pub fn winding_number(&self, x: f64, y: f64) -> i32 {
        self.0.winding_number(cavc::Vector2::new(x, y))
    }

    pub fn boolean(&self, other: &Polyline, operation: i32) -> JsValue {
        let op = match operation {
            0 => cavc::BooleanOp::Or,
            1 => cavc::BooleanOp::And,
            2 => cavc::BooleanOp::Not,
            3 => cavc::BooleanOp::Xor,
            _ => panic!("boolean op expected to be 0, 1, 2, or 3"),
        };
        let boolean_result = self.0.boolean(&other.0, op);
        let pos_plines = js_sys::Array::new();
        for pp in boolean_result.pos_plines {
            pos_plines.push(&JsValue::from(Polyline(pp.pline)));
        }

        let neg_plines = js_sys::Array::new();
        for np in boolean_result.neg_plines {
            neg_plines.push(&JsValue::from(Polyline(np.pline)));
        }

        let result = js_sys::Object::new();

        js_sys::Reflect::set(&result, &"posPlines".into(), &pos_plines).unwrap();
        js_sys::Reflect::set(&result, &"negPlines".into(), &neg_plines).unwrap();

        result.into()
    }

    #[wasm_bindgen(js_name = "closestPoint")]
    pub fn closest_point(&self, x: f64, y: f64) -> JsValue {
        let closest_point = self
            .0
            .closest_point(cavc::Vector2::new(x, y), 1e-5)
            .unwrap();

        let result = js_sys::Object::new();
        let start_index = closest_point.seg_start_index as u32;
        js_sys::Reflect::set(&result, &"startIndex".into(), &start_index.into()).unwrap();
        js_sys::Reflect::set(&result, &"x".into(), &closest_point.seg_point.x.into()).unwrap();
        js_sys::Reflect::set(&result, &"y".into(), &closest_point.seg_point.y.into()).unwrap();
        js_sys::Reflect::set(&result, &"distance".into(), &closest_point.distance.into()).unwrap();

        result.into()
    }

    #[wasm_bindgen(js_name = "createApproxSpatialIndex")]
    pub fn create_approx_aabb_index(&self) -> StaticAABB2DIndex {
        StaticAABB2DIndex(self.0.create_approx_aabb_index().unwrap())
    }

    #[wasm_bindgen(js_name = "createSpatialIndex")]
    pub fn create_aabb_index(&self) -> StaticAABB2DIndex {
        StaticAABB2DIndex(self.0.create_aabb_index().unwrap())
    }

    pub fn extents(&self) -> Box<[f64]> {
        let result = self.0.extents().unwrap();
        Box::new([result.min_x, result.min_y, result.max_x, result.max_y])
    }

    #[wasm_bindgen(js_name = "invertDirection")]
    pub fn invert_direction(&mut self) {
        self.0.invert_direction_mut();
    }

    #[wasm_bindgen(js_name = "parallelOffset")]
    pub fn parallel_offset(&self, offset: f64, handle_self_intersects: bool) -> js_sys::Array {
        let options = PlineOffsetOptions {
            handle_self_intersects,
            ..Default::default()
        };
        let offset_results = self.0.parallel_offset_opt(offset, &options);

        let result = js_sys::Array::new();
        for r in offset_results {
            result.push(&JsValue::from(Polyline(r)));
        }

        result
    }

    #[wasm_bindgen(js_name = "rawOffset")]
    pub fn raw_offset(&self, offset: f64) -> Polyline {
        let offset_result = pline_offset::create_raw_offset_polyline(&self.0, offset, 1e-5);

        Polyline(offset_result)
    }

    #[wasm_bindgen(js_name = "rawOffsetSegs")]
    pub fn raw_offset_segs(&self, offset: f64) -> js_sys::Array {
        let offset_segs = create_untrimmed_raw_offset_segs(&self.0, offset);
        let result = js_sys::Array::new();

        for seg in offset_segs {
            let seg_obj = js_sys::Object::new();
            js_sys::Reflect::set(
                &seg_obj,
                &"startPoint".into(),
                &vector2_into_jsvalue(seg.v1.pos()),
            )
            .unwrap();
            js_sys::Reflect::set(
                &seg_obj,
                &"endPoint".into(),
                &vector2_into_jsvalue(seg.v2.pos()),
            )
            .unwrap();
            js_sys::Reflect::set(&seg_obj, &"collapsedArc".into(), &seg.collapsed_arc.into())
                .unwrap();
            if seg.v1.bulge_is_zero() {
                js_sys::Reflect::set(&seg_obj, &"isArc".into(), &false.into()).unwrap();
            } else {
                js_sys::Reflect::set(&seg_obj, &"isArc".into(), &true.into()).unwrap();
                let (radius, center) = seg_arc_radius_and_center(seg.v1, seg.v2);
                js_sys::Reflect::set(&seg_obj, &"arcRadius".into(), &radius.into()).unwrap();
                js_sys::Reflect::set(&seg_obj, &"arcCenter".into(), &vector2_into_jsvalue(center))
                    .unwrap();
                js_sys::Reflect::set(&seg_obj, &"isCCW".into(), &(seg.v1.bulge > 0.0).into())
                    .unwrap();
            }

            result.push(&seg_obj.into());
        }

        result
    }

    #[wasm_bindgen(js_name = "selfIntersects")]
    pub fn self_intersects(&self) -> js_sys::Array {
        let result = js_sys::Array::new();
        if self.0.is_empty() {
            return result;
        }
        let aabb_index = self.0.create_approx_aabb_index().unwrap();
        let intrs = all_self_intersects_as_basic(&self.0, &aabb_index, true, 1e-5);
        for intr in intrs {
            result.push(&vector2_into_jsvalue(intr.point));
        }
        result
    }

    #[wasm_bindgen(js_name = "arcsToApproxLines")]
    pub fn arcs_to_approx_lines(&self, error_distance: f64) -> Polyline {
        Polyline(self.0.arcs_to_approx_lines(error_distance).unwrap())
    }

    #[wasm_bindgen(js_name = "arcsToApproxLinesData")]
    pub fn arcs_to_approx_lines_data(&self, error_distance: f64) -> Box<[f64]> {
        let pline_result = self.0.arcs_to_approx_lines(error_distance).unwrap();
        let mut data = Vec::with_capacity(2 * pline_result.vertex_count());
        for v in pline_result.iter_vertexes() {
            data.push(v.x);
            data.push(v.y);
        }
        data.into_boxed_slice()
    }

    #[wasm_bindgen(js_name = "testProperties")]
    pub fn test_properties(&self) -> JsValue {
        let result = js_sys::Object::new();

        // remove redundant vertexes for consistent vertex count
        let pline = self.0.remove_redundant(1e-4);
        let pline = pline.as_ref().unwrap_or(&self.0);
        let vertex_count = pline.vertex_count() as u32;
        let extents = pline.extents().unwrap();
        js_sys::Reflect::set(&result, &"vertexCount".into(), &vertex_count.into()).unwrap();
        js_sys::Reflect::set(&result, &"area".into(), &pline.area().into()).unwrap();
        js_sys::Reflect::set(&result, &"pathLength".into(), &pline.path_length().into()).unwrap();
        js_sys::Reflect::set(&result, &"minX".into(), &extents.min_x.into()).unwrap();
        js_sys::Reflect::set(&result, &"minY".into(), &extents.min_y.into()).unwrap();
        js_sys::Reflect::set(&result, &"maxX".into(), &extents.max_x.into()).unwrap();
        js_sys::Reflect::set(&result, &"maxY".into(), &extents.max_y.into()).unwrap();

        result.into()
    }

    #[wasm_bindgen(js_name = "logToConsole")]
    pub fn log_to_console(&self) {
        log(&format!("{:?}", self.0));
    }
}

fn pline_vertexes_to_data(pline: &cavc::Polyline<f64>) -> Vec<f64> {
    let mut data = Vec::with_capacity(3 * pline.vertex_count());
    for v in pline.iter_vertexes() {
        data.push(v.x);
        data.push(v.y);
        data.push(v.bulge);
    }
    data
}

fn vector2_into_jsvalue(v: Vector2) -> JsValue {
    let result = js_sys::Object::new();
    js_sys::Reflect::set(&result, &"x".into(), &v.x.into()).unwrap();
    js_sys::Reflect::set(&result, &"y".into(), &v.y.into()).unwrap();
    result.into()
}
