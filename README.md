## Summary

Web demo app for visualizing, testing, and documenting the
[cavalier_contours](https://github.com/jbuckmccready/cavalier_contours) Rust library.

Interactive hosted page can be viewed [here](https://jbuckmccready.github.io/cavalier_contours_web_demo_page/).

## How to build and run locally

Required Tools

- [npm](https://www.npmjs.com/) (installed with [nodejs](https://nodejs.org/en/))
- [Rust](https://www.rust-lang.org/) (can install using [rustup](https://rustup.rs/), required for cavalier contours library)
- [wasm-pack](https://github.com/rustwasm/wasm-pack) (installer [here](https://rustwasm.github.io/wasm-pack/installer/), required to compile Rust to wasm)

1. Clone this repository (`git clone https://github.com/jbuckmccready/cavalier_contours_web_demo`)
2. Ensure `npm` and `wasm-pack` are both installed and found in your environment.
3. From the root directory `npm install` to download all npm package dependencies.
4. From the root directory `npm run wasm` to compile the Rust to wasm.
5. From the root directory `npm run dev` to locally serve the page. `npm run build` to build for release and `npm run preview` to preview release build.
