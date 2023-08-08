## Summary

Source code for web demo app for visualizing, testing, and documenting the
[cavalier_contours](https://github.com/jbuckmccready/cavalier_contours) Rust library.

Live interactive page hosted at [https://cavaliercontours.dev/](https://cavaliercontours.dev/).

The Rust [Poem Framework](https://github.com/poem-web/poem) is used for the backend. Vue.js + Rust
cavalier contours library compiled to wasm is used to create a single page application.

All the computational geometry work is done the client side via WASM - server backend is needed to
support identity sign in and persistent storage.

Hosted on Google Cloud Run, GitHub CI is setup to build and live deploy all changes pushed to the
`master` branch.

## How to build and run locally using Docker

Easiest way to play with the app locally is to use [Docker](https://www.docker.com/).

After installing Docker you can just run `docker compose up --build` at the root of the repo, server
will be live at `http://localhost:8000`.

## Tinkering/Learning Roadmap

- [x] Use Docker + cloud container service hosting (landed on Google Cloud Run).
- [x] Map nice domain name (https://cavaliercontours.dev/) with HTTPS to hosted service.
- [x] Setup GitHub CI to auto build + deploy live to cloud container service.
- [ ] Add identity sign in with GitHub account via OAuth,
      [docs here](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps).
- [ ] Add persistent storage for editing and saving polylines (associated with identity sign in).
