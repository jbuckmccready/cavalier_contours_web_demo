# syntax=docker/dockerfile:1


# Stage for building backend
ARG RUST_VERSION=1.71.0
ARG APP_NAME=cavalier_contours_server
FROM rust:${RUST_VERSION}-slim-bullseye AS build_backend
ARG APP_NAME
WORKDIR /app

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

# Stage for building frontend (Rust needed for building WASM)
FROM rust:${RUST_VERSION}-slim-bullseye AS build_frontend
WORKDIR /app

# Install curl
RUN apt-get update && \
    apt-get install -yq --no-install-recommends \
    curl

# Install node and wasm-pack
RUN <<EOF
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g wasm-pack
EOF

# Get dependencies
COPY ["frontend/package.json", "frontend/package-lock.json*", "./"]
RUN npm install

# Build wasm
COPY ["frontend/cavalier_contours_web_ffi/", "./cavalier_contours_web_ffi"]
RUN npm run wasm

# Vite build
COPY ["frontend/", "./"]
RUN npm run build && cp -r ./dist /bin/index


# Final stage for minimal runtime
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

# Copy files from build stages
COPY --from=build_backend /bin/server /bin/
COPY --from=build_frontend /bin/index /bin/index

# What the container should run when it is started.
ENTRYPOINT ["/bin/server"]
