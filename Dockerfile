FROM caddy:2.11.9-alpine@sha256:003a97808e781aa9f7e75cc2f43d34d461099031faf5e20faefb9f61126836f0

RUN apk add --no-cache --upgrade 'brotli-libs>=1.2.1-r0'

COPY Caddyfile /etc/caddy/Caddyfile
COPY dist /var/www

# Non-root (Trivy DS-0002); 150 = Skiperator's runAsUser. Root fs is read-only on SKIP,
# so Caddy's autosave/data dirs go to Skiperator's /tmp mount.
ENV XDG_CONFIG_HOME=/tmp/caddy/config XDG_DATA_HOME=/tmp/caddy/data
USER 150:150

EXPOSE 3000
