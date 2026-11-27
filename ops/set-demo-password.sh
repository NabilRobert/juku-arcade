#!/usr/bin/env bash
# Sets or changes the password on the hosted juku-arcade demo (D76).
#
# Installed on the server as /usr/local/sbin/juku-demo-password and run by
# the owner only: `sudo juku-demo-password`. It asks for the new password
# twice without echoing it and hashes it with bcrypt inside the Caddy
# container. Only the hash is written, to a root-only file that the demo's
# Caddy block imports. Then it checks the whole Caddy config and reloads
# Caddy. If the check or the reload fails, the old file goes back, so the
# demo keeps its old password rather than ending up with none.
#
# The password itself never touches the disk, the command line or the logs.
# The server's own paths and the container name live in
# /etc/default/juku-demo-password (see ops/caddy-demo.md), not in this public file.
set -euo pipefail

CONFIG_FILE="${JUKU_DEMO_CONFIG:-/etc/default/juku-demo-password}"
DEMO_USERNAME="demo"
MIN_PASSWORD_LENGTH=8
# bcrypt ignores every byte after the 72nd, so a longer password would only
# look stronger than it is.
MAX_PASSWORD_BYTES=72

fail() {
	echo "juku-demo-password: $1" >&2
	exit 1
}

load_config() {
	[[ -r "$CONFIG_FILE" ]] || fail "$CONFIG_FILE is missing: create it as shown in ops/caddy-demo.md."
	# shellcheck source=/dev/null
	source "$CONFIG_FILE"
	[[ -n "${CADDY_CONTAINER:-}" ]] || fail "CADDY_CONTAINER is not set in $CONFIG_FILE."
	[[ -n "${SECRET_FILE:-}" ]] || fail "SECRET_FILE (the path on this server) is not set in $CONFIG_FILE."
	[[ -n "${CADDYFILE_IN_CONTAINER:-}" ]] || fail "CADDYFILE_IN_CONTAINER is not set in $CONFIG_FILE."
}

check_can_run() {
	[[ "$EUID" -eq 0 ]] || fail "run it with sudo: sudo juku-demo-password"
	local is_running
	is_running="$(docker inspect --format '{{.State.Running}}' "$CADDY_CONTAINER" 2>/dev/null || true)"
	[[ "$is_running" == "true" ]] || fail "the Caddy container '$CADDY_CONTAINER' isn't running: start it, or fix CADDY_CONTAINER in $CONFIG_FILE."
}

# Prints the password on stdout, for the caller to capture.
ask_password() {
	local first second
	read -r -s -p "New demo password: " first
	echo >&2
	read -r -s -p "Same password again: " second
	echo >&2
	[[ "$first" == "$second" ]] || fail "the two passwords don't match. Nothing changed."
	[[ ${#first} -ge $MIN_PASSWORD_LENGTH ]] || fail "use at least $MIN_PASSWORD_LENGTH characters. Nothing changed."
	local byte_count
	byte_count="$(LC_ALL=C; echo "${#first}")"
	[[ $byte_count -le $MAX_PASSWORD_BYTES ]] || fail "use at most $MAX_PASSWORD_BYTES bytes (bcrypt ignores the rest). Nothing changed."
	printf '%s' "$first"
}

hash_password() {
	# The password goes in on stdin, so it never shows in the process list.
	printf '%s\n' "$1" | docker exec -i "$CADDY_CONTAINER" caddy hash-password
}

caddy_command() {
	docker exec "$CADDY_CONTAINER" caddy "$1" --config "$CADDYFILE_IN_CONTAINER" --adapter caddyfile
}

restore_previous() {
	if [[ -f "$SECRET_FILE.previous" ]]; then
		mv -f "$SECRET_FILE.previous" "$SECRET_FILE"
	else
		rm -f "$SECRET_FILE"
	fi
}

install_hash() {
	local password_hash="$1" new_file
	new_file="$(mktemp "$SECRET_FILE.new.XXXXXX")"
	printf '%s %s\n' "$DEMO_USERNAME" "$password_hash" >"$new_file"
	chown root:root "$new_file"
	chmod 600 "$new_file"
	if [[ -f "$SECRET_FILE" ]]; then
		cp -p "$SECRET_FILE" "$SECRET_FILE.previous"
	fi
	mv -f "$new_file" "$SECRET_FILE"
}

apply_or_roll_back() {
	if ! caddy_command validate >/dev/null; then
		restore_previous
		fail "Caddy rejected the config, so the old password is back. Check the demo's block (ops/caddy-demo.md)."
	fi
	if ! caddy_command reload; then
		restore_previous
		caddy_command reload || true
		fail "Caddy couldn't reload, so the old password is back."
	fi
	rm -f "$SECRET_FILE.previous"
}

main() {
	umask 077
	load_config
	check_can_run
	local password password_hash
	password="$(ask_password)"
	password_hash="$(hash_password "$password")"
	unset password
	[[ "$password_hash" == \$2* ]] || fail "Caddy didn't return a bcrypt hash. Nothing changed."
	install_hash "$password_hash"
	apply_or_roll_back
	echo "Done: the demo now asks for username '$DEMO_USERNAME' and the new password."
	echo "Update the password shown on the portfolio too."
}

main "$@"
