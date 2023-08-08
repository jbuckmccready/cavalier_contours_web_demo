# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

################################################################################
# Create a stage for building the application.

ARG RUST_VERSION=1.71.0
ARG APP_NAME=cavalier_contours_server
FROM rust:${RUST_VERSION}-slim-bullseye AS build_backend
ARG APP_NAME

# Build the application.
# Leverage a cache mount to /usr/local/cargo/registry/
# for downloaded dependencies and a cache mount to /app/target/ for 
# compiled dependencies which will speed up subsequent builds.
# Leverage a bind mount to the src directory to avoid having to copy the
# source code into the container. Once built, copy the executable to an
# output directory before the cache mounted /app/target is unmounted.
RUN --mount=type=bind,source=backend/src,target=src \
    --mount=type=bind,source=backend/Cargo.toml,target=Cargo.toml \
    --mount=type=bind,source=backend/Cargo.lock,target=Cargo.lock \
    --mount=type=cache,target=/app/target/ \
    --mount=type=cache,target=/usr/local/cargo/registry/ \
    <<EOF
set -e
cargo build --locked --release
cp ./target/release/$APP_NAME /bin/server
EOF

FROM rust:${RUST_VERSION}-slim-bullseye AS build_frontend
WORKDIR /app

RUN apt-get update && \
    apt-get install -yq --no-install-recommends \
    curl

RUN <<EOF
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g wasm-pack
EOF

COPY ["frontend/", "./"]

RUN <<EOF
npm install
npm run wasm
npm run build
cp -r ./dist /bin/index
EOF

################################################################################
# Create a new stage for running the application that contains the minimal
# runtime dependencies for the application. This often uses a different base
# image from the build stage where the necessary files are copied from the build
# stage.
#
# The example below uses the debian bullseye image as the foundation for running the app.
# By specifying the "bullseye-slim" tag, it will also use whatever happens to be the
# most recent version of that tag when you build your Dockerfile. If
# reproducability is important, consider using a digest
# (e.g., debian@sha256:ac707220fbd7b67fc19b112cee8170b41a9e97f703f588b2cdbbcdcecdd8af57).
FROM debian:bullseye-slim AS final

# Create a non-privileged user that the app will run under.
# See https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#user
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser
USER appuser

# Copy the executable from the "build" stage.
COPY --from=build_backend /bin/server /bin/
COPY --from=build_frontend /bin/index /bin/index

# What the container should run when it is started.
ENTRYPOINT ["/bin/server"]
