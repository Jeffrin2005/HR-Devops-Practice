#!/usr/bin/env bash
set -euo pipefail
: "${RESTORE_MONGODB_URL:?Set an isolated target URI with database hr_restore_test}"
: "${BACKUP_DATABASE:?Set the source database name stored in the archive}"
: "${BACKUP_FILE:?Set the encrypted backup file}"
: "${AGE_IDENTITY:?Set the protected age identity file}"
[ "${CONFIRM_RESTORE_TEST:-}" = hr_restore_test ] || { echo "Set CONFIRM_RESTORE_TEST=hr_restore_test" >&2; exit 1; }
[[ "$BACKUP_DATABASE" =~ ^[A-Za-z0-9_-]+$ ]] || exit 1
command -v mongorestore >/dev/null
command -v age >/dev/null
umask 077
configuration=$(mktemp)
trap 'rm -f "$configuration"' EXIT
node -e 'const u=new URL(process.env.RESTORE_MONGODB_URL); if(u.pathname!=="/hr_restore_test")process.exit(1); console.log(JSON.stringify({uri:process.env.RESTORE_MONGODB_URL}))' > "$configuration"
age -d -i "$AGE_IDENTITY" "$BACKUP_FILE" | mongorestore --config="$configuration" --archive --gzip --drop --nsInclude="$BACKUP_DATABASE.*" --nsFrom="$BACKUP_DATABASE.*" --nsTo='hr_restore_test.*'
echo "Restored into hr_restore_test. Verify counts and critical records before approving recovery."
