FROM debian:bookworm-slim

ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH \
    RUST_VERSION=1.93.1

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl build-essential pkg-config \
  && rm -rf /var/lib/apt/lists/* \
  && curl --proto '=https' --tlsv1.2 -LsSf https://sh.rustup.rs -o /tmp/rustup-init.sh \
  && sh /tmp/rustup-init.sh -y --profile minimal --default-toolchain ${RUST_VERSION} \
  && rm /tmp/rustup-init.sh \
  && rustup target add wasm32v1-none \
  && rustc --version \
  && cargo --version

WORKDIR /workspace

ENTRYPOINT ["sh", "scripts/build-soroban.sh"]