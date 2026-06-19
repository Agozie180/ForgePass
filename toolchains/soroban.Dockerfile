FROM rust:1.93.1-slim-bookworm

RUN rustup target add wasm32v1-none
WORKDIR /workspace

ENTRYPOINT ["sh", "scripts/build-soroban.sh"]
