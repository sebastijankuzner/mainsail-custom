FROM node:22-alpine

WORKDIR /home/node

ADD entrypoint.sh /entrypoint.sh

ARG mainsail_channel=evm

ENV PNPM_HOME=/home/node/.pnpm/bin
ENV PATH="${PATH}:${PNPM_HOME}"

RUN apk add --no-cache --virtual .build-deps make gcc g++ python3 py3-setuptools git \
    && apk add --no-cache bash sudo git openntpd jemalloc \
    && echo "servers pool.ntp.org" > /etc/ntpd.conf \
    && echo "servers time.google.com" >> /etc/ntpd.conf \
    && npm install -g npm@latest \
    && su node -c "npm install --prefix=/home/node/.pnpm -g pnpm" \
    && su node -c "pnpm add -g @mainsail/api@${mainsail_channel} --allow-build=nsfw" \
    && su node -c "export PNPM_HOME=/home/node/.pnpm/bin" \
    && su node -c "pnpm store prune" \
    && su node -c "rm -rf ~/.cache/node-gyp" \
    && apk del .build-deps \
    && echo 'node ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

USER node
ENTRYPOINT ["bash", "-c", "/entrypoint.sh \"$@\"", "--"]
