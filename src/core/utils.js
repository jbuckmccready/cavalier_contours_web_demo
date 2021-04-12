/// Print number to Rust f64 string, e.g. 0 -> "0.0", 88.87654 -> "88.87654"
export function toRustf64Str(number) {
    return number.toFixed(
        Math.max(((number + "").split(".")[1] || "").length, 1)
    );
}

/// Copy str to clip board
export function copyToClipboard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

/// Print pline array and is closed to json string
export function plineArrayToJsonStr(array, isClosed) {
    let obj = {
        isClosed: isClosed,
        vertexes: []
    };
    for (let i = 0; i < array.length; i += 3) {
        obj.vertexes.push([array[i], array[i + 1], array[i + 2]]);
    }

    try {
        let f = (k,v) => {
            if (k !== "vertexes" && v instanceof Array) {
                return JSON.stringify(v);
            }
            return v;
        };
        return JSON.stringify(obj, f, 2)
            .replace(/"\[/g, '[')
            .replace(/]"/g,']')
            .replace(/,/g, ", ");

    } catch {
        return null;
    }
}

/// Parse json string into { array, isClosed }
export function jsonStrToPlineArray(jsonStr) {
    try {
        let obj = JSON.parse(jsonStr);
        let array = new Float64Array(obj.vertexes.length * 3);
        obj.vertexes.forEach((v, i) => {
            const offset = i * 3;
            array[offset] = v[0];
            array[offset + 1] = v[1];
            array[offset + 2] = v[2];
        });

        return { array: array, isClosed: obj.isClosed };
    } catch {
        return { array: new Float64Array(), isClosed: false };
    }
}

/// Create rust code string for declaring pline
export function createPlineRustCodeStr(pline) {
    let vertexData = pline.vertexData();
    let result = pline.isClosed ? "pline_closed![" : "pline_open![";
    for (let i = 0; i < vertexData.length; i += 3) {
        let values = [vertexData[i], vertexData[i + 1], vertexData[i + 2]];
        result += "(" + values.map(toRustf64Str).join(", ") + "),\n";
    }
    result = result.slice(0, -2) + "]";
    return result;
}

/// Create rust code string for constructing PlineProperties for pline
export function createPlineTestPropertiesRustCodeStr(pline) {
    let p = pline.testProperties();
    let f64Props = [p.area, p.pathLength, p.minX, p.minY, p.maxX, p.maxY];
    return (
        "PlineProperties::new(" +
        p.vertexCount.toString() +
        ", " +
        f64Props.map(toRustf64Str).join(", ") +
        ")"
    );
}

export function createPlinePropertiesSetRustCodeStr(plines) {
    return (
        "[" +
        plines.map(pline => createPlineTestPropertiesRustCodeStr(pline)).join(", ") +
        "]"
    );
}