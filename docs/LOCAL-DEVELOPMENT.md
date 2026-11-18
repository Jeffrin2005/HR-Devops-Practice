# Local development

[Project README](../README.md)

Run from the repository root unless another directory is specified.

## Start containers

Copy [.env.example](../.env.example) to an ignored .env file without overwriting existing values. Supply MONGO_USERNAME, random hexadecimal MONGO_PASSWORD, and an independent JWT_KEY of at least 32 bytes.

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
docker compose up --build -d --wait
docker compose ps
```

Open [localhost:8080](http://localhost:8080). For another port in PowerShell:

```powershell
$env:FRONTEND_PORT = "18080"
docker compose up --build -d --wait
```

In Bash, use `export FRONTEND_PORT=18080`. The API and database have no published host ports.

## First administrator

Bootstrap is explicit and refuses if an active administrator already exists. Use a 12–72-byte password.

### Windows PowerShell

```powershell
$credential = Get-Credential -Message "Enter administrator email and strong password"
$env:ADMIN_EMAIL = $credential.UserName
$env:ADMIN_PASSWORD = $credential.GetNetworkCredential().Password
try {
    docker compose run --rm -e ADMIN_EMAIL -e ADMIN_PASSWORD server node userSeed.js
} finally {
    Remove-Item Env:ADMIN_EMAIL, Env:ADMIN_PASSWORD -ErrorAction SilentlyContinue
}
```

### Bash

```sh
read -r -p "Administrator email: " ADMIN_EMAIL
read -r -s -p "Administrator password: " ADMIN_PASSWORD
printf '\n'
export ADMIN_EMAIL ADMIN_PASSWORD
docker compose run --rm -e ADMIN_EMAIL -e ADMIN_PASSWORD server node userSeed.js
unset ADMIN_EMAIL ADMIN_PASSWORD
```

Sign in, create a department, then create employee accounts. Old demo credentials are blocked.

## Source development

For the API, copy [app/server/.env.example](../app/server/.env.example) to app/server/.env. Supply an accessible authenticated MongoDB replica-set URI, JWT key, and APP_ORIGIN=http://localhost:5173.

```sh
cd app/server
npm ci --ignore-scripts
npm run dev
```

In another terminal:

```sh
cd app/frontend
npm ci --ignore-scripts
npm run dev
```

Vite proxies /api to http://127.0.0.1:5000. The Compose database is internal; a standalone API process needs a separately accessible database URI.

## Checks and troubleshooting

```sh
npm --prefix app/server test
npm --prefix app/frontend run lint
npm --prefix app/frontend run build
docker compose logs --tail=80 server
docker compose logs --tail=80 database
docker compose down
```

Database integration tests additionally require MONGODB_TEST_URL pointing to an isolated replica set with database name /hr_test. The suite deletes that database.

Regular Compose down retains named volumes; --volumes deletes their data. Initialization environment variables do not retrofit authentication into existing MongoDB data. Follow a planned migration rather than deleting an old PVC/volume to fix login errors.
