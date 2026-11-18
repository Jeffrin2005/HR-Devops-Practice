#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
environment=${1:?Usage: promote.sh dev|staging|prod frontend_digest backend_digest}
frontend=${2:?Supply frontend sha256 digest}
backend=${3:?Supply backend sha256 digest}
case "$environment" in dev|staging|prod) ;; *) exit 1;; esac
for digest in "$frontend" "$backend"; do
  [[ "$digest" =~ ^sha256:[a-f0-9]{64}$ ]] || { echo "Use verified immutable sha256 digests" >&2; exit 1; }
done
python3 - "$environment" "$frontend" "$backend" <<'PY'
from pathlib import Path
import sys
environment, frontend, backend = sys.argv[1:]
p = Path('k8s/overlays') / environment / 'kustomization.yaml'
content = p.read_text().split('\nimages:\n', 1)[0].rstrip()
content += '\nimages:\n  - name: jeffrinjojo/hr-frontend\n    digest: '+frontend+'\n  - name: jeffrinjojo/hr-backend\n    digest: '+backend+'\n'
p.write_text(content)
PY
kubectl kustomize "k8s/overlays/$environment" >/dev/null
git diff -- "k8s/overlays/$environment/kustomization.yaml"
echo "Review and commit this environment-specific GitOps change. Reuse a previous digest to roll back."
