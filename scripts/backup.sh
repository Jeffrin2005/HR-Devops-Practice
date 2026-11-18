#!/usr/bin/env bash
set -euo pipefail
: "${MONGODB_URL:?Set the source replica-set URI including its database name}"
: "${BACKUP_RECIPIENT:?Set the age public recipient}"
: "${BACKUP_DIRECTORY:?Set the protected backup destination}"
command -v mongodump >/dev/null
command -v age >/dev/null
umask 077
configuration=$(mktemp)
partial=""
cleanup() { rm -f "$configuration"; [ -z "$partial" ] || rm -f "$partial"; }
trap cleanup EXIT
node -e 'const u=new URL(process.env.MONGODB_URL); if(!/^\/[A-Za-z0-9_-]+$/.test(u.pathname))process.exit(1); console.log(JSON.stringify({uri:process.env.MONGODB_URL}))' > "$configuration"
mkdir -p "$BACKUP_DIRECTORY"
backup="$BACKUP_DIRECTORY/hr-$(date -u +%Y%m%dT%H%M%SZ).archive.gz.age"
partial="$backup.partial"
mongodump --config="$configuration" --archive --gzip | age -r "$BACKUP_RECIPIENT" > "$partial"
mv "$partial" "$backup"
partial=""
echo "Encrypted backup created: $backup"
