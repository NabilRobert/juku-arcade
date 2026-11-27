# Hosting the demo behind a password (D76)

The online demo runs on the owner's server in its own small Caddy
container. That Caddy asks every visitor for a username and password before
it sends any file. The server's front Caddy, which serves the other sites,
only forwards the demo's address to it. The portfolio shows the username and
password, so anyone who finds the portfolio can play, and nobody gets in
without them.

| Piece                           | Where                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| The container                   | [`ops/compose.yaml`](compose.yaml)                                                    |
| Its Caddy config, with the lock | [`ops/demo.Caddyfile`](demo.Caddyfile)                                                |
| The password command            | [`ops/set-demo-password.sh`](set-demo-password.sh), installed as `juku-demo-password` |
| The bundle                      | `npm run demo:bundle` writes `juku-arcade-demo.tar.gz`                                |

The server's address and its front Caddy's details stay out of this public
repo. Below they're written as `<placeholders>`.

## Why it holds

- **Caddy checks the password on the server,** for every request: the page,
  the JS, the decks, the sounds. Without it Caddy answers 401 and sends
  nothing else. Requests that skip Cloudflare and go straight to the server
  still get forwarded to the same check.
- **It fails closed.** Before the first password is set, the lock has no
  accounts and refuses everyone.
- **The password is never stored.** Caddy keeps only a bcrypt hash, in a
  folder only root can read. The password isn't in this repo, the bundle, CI
  or any log.
- **Cloudflare can't leak a copy.** Every response says
  `Cache-Control: private`. With `public`, Cloudflare would cache a file
  fetched with the password and hand it to anyone. Never add a Cloudflare
  Cache Rule that caches everything for this host: it would override
  `private`.
- **The container is locked down** like the portfolio's:
  - its root filesystem is read-only, and so are its mounts;
  - every capability is dropped except one the Caddy binary needs to start
    (see the comment in `compose.yaml`);
  - `no-new-privileges` is set, and memory and CPU are capped.
- **The code itself is public** (the owner's choice, 2026-11-27). The lock
  covers the hosted demo, not the source.

## Layout on the server

```text
<demo-folder>/
  compose.yaml          ops/compose.yaml
  .env                  ARCADE_DEMO_PUBLISH=<address:port the front Caddy reaches>
  caddy/Caddyfile       ops/demo.Caddyfile, unchanged
  www/<release>/        one unpacked bundle per release
  www/current           a relative link to the release being served
/etc/juku-arcade-demo/  root:root, mode 700: the hash file
/etc/default/juku-demo-password   the command's settings
/usr/local/sbin/juku-demo-password
```

Every mount is a folder, not a single file. The password command and most
editors replace a file rather than change it in place, and a single-file
mount would keep showing the old one.

## Setting it up (once)

1. **Folders.** Create `<demo-folder>/caddy` and `<demo-folder>/www`, both
   owned by the normal user. Then create the hash folder:
   ```bash
   sudo install -d -o root -g root -m 700 /etc/juku-arcade-demo
   ```
2. **The command and its settings.**
   - Install the command:
     ```bash
     sudo install -o root -g root -m 755 set-demo-password.sh /usr/local/sbin/juku-demo-password
     ```
   - Create `/etc/default/juku-demo-password`, owned by `root:root` with
     mode `600`:
     ```bash
     CADDY_CONTAINER=arcade-demo
     SECRET_FILE=/etc/juku-arcade-demo/juku-arcade-demo.caddy
     CADDYFILE_IN_CONTAINER=/etc/caddy/Caddyfile
     ```
3. **The first release.** Unpack the bundle into `www/<release>`, then point
   `current` at it (see "Updating the demo" below).
4. **Start the container.** Put `compose.yaml`, `.env` and
   `caddy/Caddyfile` in place, then run `docker compose up -d`. No other
   site is touched. Until step 5, every request gets 401.
5. **Set the first password** (the owner):
   ```bash
   sudo juku-demo-password
   ```
6. **The front Caddy.** Add this block to its Caddyfile, then validate and
   reload (not restart):
   ```text
   <demo-domain> {
   	reverse_proxy <address:port from .env>
   }
   ```
   Don't add header rules that drop `Authorization`: the demo's Caddy needs
   it.
7. **DNS:** a proxied Cloudflare record for `<demo-domain>`.

## Changing the password (the owner only)

```bash
sudo juku-demo-password
```

- **What it does:**
  - It asks twice, without showing what you type.
  - It refuses anything under 8 characters or over 72 bytes (bcrypt ignores
    the rest).
  - It writes the new hash, checks the demo's config, and reloads only the
    demo's Caddy.
- **If the check or the reload fails,** the old password comes back and the
  demo stays up.
- **After a change,** browsers ask again, and the portfolio needs the new
  password.

## Updating the demo

1. On the Mac: `npm run demo:bundle`.
   - It builds with the sample week of play on (`VITE_SAMPLE_PLAY=1`), so a
     visitor sees a filled-in streak calendar, labelled "sample data".
   - It leaves out `public/local/` and its table picture
     (`VITE_TABLE_IMAGE`), which are private, so the table shows the moving
     swirl.
2. Copy `juku-arcade-demo.tar.gz` to the server.
3. Unpack it into a new release folder, then switch `current` to it in one
   step:
   ```bash
   mkdir www/<release> && tar -xzf juku-arcade-demo.tar.gz -C www/<release>
   ln -sfn <release> www/current.new && mv -T www/current.new www/current
   ```
   No reload is needed. To roll back, point `current` at the previous
   release the same way.

## Checking it

```bash
curl -sI https://<demo-domain>/                       # 401, with WWW-Authenticate
curl -sI -u demo https://<demo-domain>/               # asks for the password; then 200, with the CSP
curl -sI https://<demo-domain>/decks/n5.json          # 401: the decks are locked too
curl -sI -u demo https://<demo-domain>/assets/<file>  # Cache-Control: private, …
```

To try it on the Mac first, run `compose.yaml` with a compose override that
points `/secrets` at a local folder. That's how this layout was tested,
from the first start, with no password yet, to a password change and a
restart.
