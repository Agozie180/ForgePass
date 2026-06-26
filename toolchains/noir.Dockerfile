FROM debian:bookworm-slim

ARG NARGO_VERSION=v1.0.0-beta.9
ADD https://github.com/noir-lang/noir/releases/download/${NARGO_VERSION}/nargo-x86_64-unknown-linux-gnu.tar.gz /tmp/nargo.tar.gz
RUN tar -xzf /tmp/nargo.tar.gz -C /usr/local/bin \
    && rm /tmp/nargo.tar.gz \
    && nargo --version

WORKDIR /workspace
ENTRYPOINT ["nargo"]
