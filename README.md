## Summary
Web demo app for visualizing, testing, and documenting the
[cavalier_contours](https://github.com/jbuckmccready/cavalier_contours) Rust library.

Interactive hosted page can be viewed [here](https://jbuckmccready.github.io/cavalier_contours_web_demo_page/).


## How to build and run locally
Required Tools
* [npm](https://www.npmjs.com/) (installed with [nodejs](https://nodejs.org/en/))
* [Rust](https://www.rust-lang.org/) (can install using [rustup](https://rustup.rs/))
* [wasm-pack](https://github.com/rustwasm/wasm-pack) (installer [here](https://rustwasm.github.io/wasm-pack/installer/))
* [Vue.js](https://vuejs.org/) `vue-cli-service` (installed with `npm install -g @vue/cli`, install instructions page [here](https://cli.vuejs.org/guide/installation.html) - I had problems on windows and had to also run `npm install -g @vue/cli-service` to get it working)

1. Clone this repository (`git clone https://github.com/jbuckmccready/cavalier_contours`)
2. Ensure `npm` and `wasm-pack` are both installed and found in your environment.
3. From the root directory `npm install` to download all npm package dependencies.
4. From the root directory `npm run serve` to build and serve the web app.
