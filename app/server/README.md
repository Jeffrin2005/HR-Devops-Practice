# HR API

[Project](../../README.md) · [Setup](../../docs/LOCAL-DEVELOPMENT.md)

Node.js 24 / Express 5 API with Mongoose, Zod, bcrypt, signed cookie sessions, image processing, and Prometheus metrics.

## Commands

```sh
npm ci --ignore-scripts
npm run dev
npm test
npm run migrate
npm run bootstrap-admin
```

Migration/bootstrap operate on the configured database. Back up existing data first. Containers omit the npm CLI: use node scripts/migrate.js or node userSeed.js inside them.

## Access rules

| Prefix | Access |
| --- | --- |
| /api/auth/login | Public, validated, rate-limited |
| /api/auth/verify and /logout | Authenticated |
| /api/employee | Administrator management; individual reads also permit the owner |
| /api/department | Administrator |
| /api/salary | Administrator writes; own salary history also allowed |
| /api/leave | Own submission/history; administrator lists/details/decisions |
| /api/attendance | Administrator |
| /api/setting/change-password | Current user only |
| /api/dashboard/summary | Administrator |
| /api/uploads/:filename | Administrator or image owner |

Internal endpoints: /health/live, /health/ready, /metrics. The frontend blocks public access to these paths.

Employee writes use transactions; a replica-set-capable database is required. Images have size/type/pixel limits and are re-encoded. Production requires private S3 storage and workload IAM.

Without MONGODB_TEST_URL, the database integration suite is skipped. To include it, supply an isolated replica set with database name /hr_test; the suite deletes that database. Collection routes retain their existing unpaginated behavior.
