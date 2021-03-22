const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const path = require("path");

module.exports = {
    configureWebpack: {
        plugins: [
            // rust wasm bindgen https://github.com/rustwasm/wasm-bindgen
            new WasmPackPlugin({
                crateDirectory: path.resolve(__dirname, "./wasm/cavalier_contours_web_ffi"),
            }),
        ],
        resolve: {
            extensions: ['.js', '.vue', '.json'],
            alias: {
                '@': path.resolve('src'),
            }
        },
    }
};
