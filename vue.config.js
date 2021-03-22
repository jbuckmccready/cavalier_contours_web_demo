const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const path = require("path");

module.exports = {
    // setting publicPath to empty string required so index.html is generated with relative path
    // links to assets
    publicPath: '',
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
