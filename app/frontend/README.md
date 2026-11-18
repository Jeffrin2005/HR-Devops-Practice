# HR frontend

[Project](../../README.md) · [Setup](../../docs/LOCAL-DEVELOPMENT.md)

React 19/Vite UI for administrator and employee workflows: profiles, departments, salary, leave, attendance administration, and password settings.

```sh
npm ci --ignore-scripts
npm run dev
npm run lint
npm run build
```

Vite proxies /api to http://127.0.0.1:5000. Run the API with APP_ORIGIN=http://localhost:5173 and an accessible database URI.

Authentication uses same-origin HttpOnly cookies. Route guards handle navigation; the API independently enforces permissions. The Dockerfile builds static assets and runs unprivileged Nginx on port 8080. BACKEND_HOST selects the API upstream. Nginx sets browser security headers and blocks public health/metrics paths.
