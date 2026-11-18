# Deployment and operations

[Project README](../README.md)

React frontend, Express API, MongoDB replica set, Docker Compose, Kubernetes overlays, and optional AWS infrastructure. Production readiness depends on configuring and validating the deployment environment; the presence of manifests alone is not a production certification.

## Local development

Node 24 and Docker Compose are required. Copy `.env.example` to `.env` and fill in a different random hexadecimal value for MONGO_PASSWORD and JWT_KEY. Generate each value with:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
docker compose up --build -d --wait
```

Open http://localhost:8080. If that port is occupied, set FRONTEND_PORT to a free port before running Compose. MongoDB and the API are internal to Compose. MongoDB has authentication, persistent storage, and a single-member replica set to support transactions. This local database is for development; production uses a managed, backed-up MongoDB-compatible replica set.

There are no automatic demo accounts. Bootstrap an administrator explicitly:

```sh
# Set ADMIN_EMAIL and ADMIN_PASSWORD securely in your shell first.
# The password must contain 12-72 bytes. Do not commit these values.
docker compose run --rm -e ADMIN_EMAIL -e ADMIN_PASSWORD server node userSeed.js
```

The bootstrap refuses to run if an active administrator already exists. Remove ADMIN_PASSWORD from your shell afterwards. The frontend uses an HttpOnly SameSite cookie; production cookies require HTTPS. Sessions expire after one hour. Logout and password changes invalidate existing sessions for that account.

To run without containers, copy app/server/.env.example to app/server/.env, provide a replica-set URI and secret, and run `npm ci` followed by `npm start` inside app/server. Run `npm ci && npm run dev` inside app/frontend; Vite proxies /api to port 5000. Set APP_ORIGIN=http://localhost:5173 for this mode.

## Existing installations and exposed credentials

Before deploying to an existing database:

1. Take and verify an encrypted backup.
2. Revoke the previously committed database and SMTP credentials at their issuers. Generate a new JWT_KEY for every environment; replacing it invalidates all old tokens. Removing a file from Git does not revoke its credentials or erase historical commits.
3. Reconcile duplicate email addresses, employee user references, or salary records with the same employee and pay date. Do not delete payroll records automatically.
4. Against the intended database, run `npm run migrate` from app/server, using the environment's new credentials. The migration normalizes email, creates indexes, and disables the two original demo accounts while preserving HR history. It stops on conflicting unique indexes.
5. Bootstrap a new administrator if none remains active. Existing valid non-demo accounts are retained.
6. Existing images remain on local disk. For production, copy referenced images into the private uploads bucket under their existing filenames before switching to S3. Verify access, then remove obsolete copies according to your retention policy.

The .env, node_modules, local Terraform plans, and employee images are no longer tracked. Historical secrets still require rotation and coordinated Git history cleanup if your repository policy requires it. Do not run a force-push history rewrite without coordinating other clones.

## Tests and release checks

```sh
npm --prefix app/server ci --ignore-scripts
npm --prefix app/server test
npm --prefix app/frontend ci --ignore-scripts
npm --prefix app/frontend run lint
npm --prefix app/frontend run build
npm --prefix app/server audit --omit=dev
npm --prefix app/frontend audit --omit=dev
./scripts/validate.sh
```

API regression tests cover authorization, ownership, input validation, cookies, revocation, uploads, department retention, and payroll arithmetic. The database integration suite additionally requires MONGODB_TEST_URL pointing to a disposable replica set with the database name /hr_test. It deletes that database. CI creates its own isolated replica set and runs this suite.

As of 18 November 2026, the full frontend development dependency audit still reports GHSA-fc5q-39xc-vjpf in picomatch and its dependent build tools. Upstream lists no patched version: https://github.com/advisories/GHSA-fc5q-39xc-vjpf. It is not included in the shipped Nginx image. Keep build globs controlled by trusted maintainers, use isolated CI, and do not expose the Vite development server publicly. Production dependency audits are enforced separately; no advisory is silently ignored. Dependabot checks packages, images, and Actions weekly.

CI uses pinned Actions, runs tests/lint/build/config validation, scans source for secrets, and scans images before pushing commit-specific tags. High and critical image findings block publication. Configure DOCKERHUB_USERNAME and DOCKERHUB_TOKEN in GitHub Secrets. Obtain the published sha256 digests from the workflow summary.

## Kubernetes deployment

Environment namespaces are hr-dev, hr-staging, and hr-prod. Names remain stable inside each namespace. Production and staging use external databases and private S3 uploads; the single-member MongoDB deployment is included only in dev.

Before deploying:

- Install a maintained Traefik ingress controller into ingress-system using the official Helm chart and k8s/ingress/values.yaml. The validated chart version is 42.4.1. The ingress class is traefik. For a separate HTTP-only dev cluster, also use k8s/ingress/dev-values.yaml. Changing controllers on an existing cluster requires a planned cutover; do not remove the old controller until the new ingress is verified.
- Install Metrics Server and verify resource metrics before relying on the frontend HPA.
- Enable NetworkPolicy enforcement in your CNI. The supplied ingress policies permit controller-to-frontend, frontend-to-API, monitoring-to-API, and dev API-to-database traffic.
- Provide the default CSI StorageClass for dev PVCs. For EKS, configure the appropriate EBS CSI add-on and its IAM permissions before using dev storage.
- Create the environment namespace and an hr-api-secret with MONGODB_URL and JWT_KEY using your secret manager or a protected local env file. Never put secret values into a committed manifest.
- For dev, create hr-database-secret with username and password. Its credentials must match the authenticated URI in hr-api-secret. Use host hr-database-service, authSource=admin, replicaSet=rs0, and database hr_db.
- For an existing MongoDB volume, back up and migrate into the new namespace deliberately. The data mount remains at the volume root. Enabling authentication on an old unauthenticated database requires creating authorized users during a planned maintenance procedure; initialization environment variables do not retrofit users into an existing database. Never delete a PVC to work around an authentication error.
- For staging/prod, replace example hostnames and UPLOAD_BUCKET in production-patch.yaml. Set AWS_REGION correctly. Create hr-tls in that namespace with a trusted certificate for the hostname, and configure DNS.
- The backend service account is hr-backend. The Terraform stack associates it with an S3 workload role for the selected environment. For another cluster, supply an equivalent workload identity; never use static AWS keys in the repository.
- For DocumentDB, use TLS, retryWrites=false, authSource=admin, replicaSet=rs0, and the AWS CA bundle. Mount the CA and set NODE_EXTRA_CA_CERTS or the connection's tlsCAFile option; never disable certificate verification. Create a database user restricted to hr_db rather than running the app as the master account.
- Configure log collection for structured API mutation events and ingress access logs, retention, and access controls. Rate limits currently use per-pod memory; put a shared edge/account limiter in front of multiple production replicas if global limits are required.

Select verified new images explicitly:

```sh
./scripts/promote.sh dev sha256:FRONTEND_DIGEST sha256:BACKEND_DIGEST
# Review and commit the generated environment-specific image changes.
./scripts/deploy.sh dev
```

Replace the illustrative digest values with the real 64-character hashes. Base manifests intentionally use RELEASE_REQUIRED so old insecure images cannot accidentally become the repaired release. The deploy script refuses unresolved release/environment placeholders and propagates rollout failures.

Argo CD's supplied Application tracks dev only. Enable it after configuring secrets and promoting the first repaired release. Create separate reviewed Applications for staging/prod with their corresponding overlay and namespace. Promotion updates only the selected environment. Roll back by running promote.sh with previously verified digests and committing that change; GitOps then reconciles the rollback. Check readiness and an authenticated smoke test afterwards.

## AWS infrastructure

See terraform/README.md. No helper automatically applies or destroys cloud infrastructure. Existing state must be backed up and migrated deliberately; review replacement and deletion actions before applying.

DocumentDB remains opt-in, preserving the current disabled configuration. If enabled, it uses private subnets, managed master credentials, encryption, 14-day backups, deletion protection, and a final snapshot. Production requests three instances across the subnet group. Keep using your external MongoDB service if you do not enable it.

## Monitoring and recovery

Install kube-prometheus-stack chart version 93.4.0 as release monitoring in namespace monitoring using k8s/monitoring/values.yaml. First create hr-grafana-admin with username/password keys. Then apply `kubectl apply -k k8s/monitoring`; ServiceMonitor and PrometheusRule CRDs must already exist.

The dashboards show request rate and latency. Alerts cover unavailable/missing backend targets and elevated server errors. Configure real SMTP sender/recipient values using the optional Alertmanager override and a monitoring/hr-alert-smtp secret with a password key. Send a test notification and verify it reaches the on-call recipient before relying on alerts. Do not expose Grafana or Prometheus publicly without authentication and TLS.

For self-managed MongoDB, schedule scripts/backup.sh with a protected connection environment, age recipient, and backup directory on backed-up storage. Backups are encrypted. scripts/restore-test.sh restores only into a dedicated database named hr_restore_test and requires an explicit confirmation variable. Run a restore drill and compare document counts and critical records before approving a release. For DocumentDB use managed snapshots/PITR and restore into an isolated cluster instead. S3 versioning protects uploads; restrict delete-version permissions and test restoration of referenced object versions.

The single-member dev database is not highly available. Establish production RPO/RTO targets, retention and restore procedures, capacity tests, notification delivery, certificate renewal, and a rollback drill for your actual AWS account. Kubernetes render checks do not prove these operational requirements.

Validated Helm render/install commands (render before installing in your cluster):

```sh
helm repo add traefik https://traefik.github.io/charts
helm template traefik traefik/traefik --version 42.4.1 -n ingress-system -f k8s/ingress/values.yaml
helm upgrade --install traefik traefik/traefik --version 42.4.1 -n ingress-system --create-namespace -f k8s/ingress/values.yaml
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm template monitoring prometheus-community/kube-prometheus-stack --version 93.4.0 -n monitoring -f k8s/monitoring/values.yaml
helm upgrade --install monitoring prometheus-community/kube-prometheus-stack --version 93.4.0 -n monitoring --create-namespace -f k8s/monitoring/values.yaml
```
