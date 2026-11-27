# Hosting the demo behind a password (D76)

The online demo runs on the owner's server, behind the Caddy that already
serves the other sites. Caddy asks every visitor for a username and
password before it sends any file. The portfolio shows both, so anyone who
finds the portfolio can play, and nobody gets in without them.

| Piece                | Where                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------- |
| The Caddy block      | [`ops/demo.Caddyfile`](demo.Caddyfile)                                                |
| The password command | [`ops/set-demo-password.sh`](set-demo-password.sh), installed as `juku-demo-password` |
| The bundle           | `npm run demo:bundle` writes `juku-arcade-demo.tar.gz`                                |

The server's address, folders and container name stay out of this public
repo. Below they're written as `<placeholders>`.

## Why it holds

- **Caddy checks the password on the server,** for every request: the page,
  the JS, the decks, the sounds. Without it Caddy answers 401 and sends
  nothing else. Going to the server's IP instead of the domain still meets
  the same check.
- **The password is never stored.** Caddy keeps only a bcrypt hash, in a
  file only root can read. The password isn't in this repo, the bundle, CI
  or any log.
- **Cloudflare can't leak a copy.** Every response says
  `Cache-Control: private`. With `public`, Cloudflare would cache a file
  fetched with the password and hand it to anyone. Never add a Cloudflare
  Cache Rule that caches everything for this host: it would override
  `private`.
- **The code itself is public** (the owner's choice, 2026-11-27). The lock
  covers the hosted demo, not the source.

## Setting it up (once)

Caddy 2.8 or newer (`basic_auth`; older versions call it `basicauth`).

1. **Folders on the server.**
   - Create a web root for the demo, and a secrets folder owned by
     `root:root` with mode `700`.
   - Mount both into the Caddy container read-only.
   - Mount the secrets _folder_, not the file. The command replaces the
     file, and a single-file mount would keep showing the old one.
2. **The command's settings.** Create `/etc/default/juku-demo-password`,
   owned by `root:root` with mode `600`:
   ```bash
   CADDY_CONTAINER=<caddy-container-name>
   SECRET_FILE=<secrets-folder-on-the-server>/juku-arcade-demo.caddy
   CADDYFILE_IN_CONTAINER=/etc/caddy/Caddyfile
   ```
3. **Install the command:**
   ```bash
   sudo install -o root -g root -m 755 set-demo-password.sh /usr/local/sbin/juku-demo-password
   ```
4. **Set the first password** (the owner, before step 5). The block imports
   the secret file, so Caddy refuses the block until that file exists:
   ```bash
   sudo juku-demo-password
   ```
5. **Add the block.**
   - Copy `ops/demo.Caddyfile` into the server's Caddyfile and replace:
     - `<demo-domain>`: the demo's address, for example `arcade.<portfolio domain>`;
     - `<web-root>`: the web root's path inside the container;
     - `<secret-file>`: the secret file's path inside the container.
   - Back up the Caddyfile first, then run `caddy validate` and
     `caddy reload` inside the container (reload, not restart).
6. **DNS:** a proxied Cloudflare record for `<demo-domain>`.

## Changing the password (the owner only)

```bash
sudo juku-demo-password
```

- **What it does:**
  - It asks twice, without showing what you type.
  - It refuses anything under 8 characters or over 72 bytes (bcrypt ignores
    the rest).
  - It writes the new hash, checks the config, and reloads Caddy.
- **If the check or the reload fails,** the old password comes back and the
  demo stays up.
- **After a change,** browsers ask again, and the portfolio needs the new
  password.

## Updating the demo

1. On the Mac: `npm run demo:bundle`.
   - It builds with the sample week of play on (`VITE_SAMPLE_PLAY=1`), so a
     visitor sees a filled-in streak calendar, labelled "sample data".
   - It leaves out `public/local/`, which is private.
2. Copy `juku-arcade-demo.tar.gz` to the server.
3. Extract it into a fresh folder, then swap that in for the web root, the
   same way as the portfolio site. Caddy needs no reload.

## Checking it

```bash
curl -sI https://<demo-domain>/                       # 401, with WWW-Authenticate
curl -sI -u demo https://<demo-domain>/               # asks for the password; then 200, with the CSP
curl -sI https://<demo-domain>/decks/n5.json          # 401: the decks are locked too
curl -sI -u demo https://<demo-domain>/assets/<file>  # Cache-Control: private, …
```

To try the block on the Mac first, run it in a throwaway `caddy:2`
container with the three placeholders pointing at local folders. That's how
it was tested before the first deploy.
