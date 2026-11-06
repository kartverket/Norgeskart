FROM caddy:2.11.7-alpine@sha256:24ec7b05bc532c7bb57f727030c5056e257ff7138b4b50460306819ff79362bd

RUN apk add --no-cache --upgrade 'brotli-libs>=1.2.1-r0'

COPY Caddyfile /etc/caddy/Caddyfile
COPY dist /var/www

EXPOSE 3000
