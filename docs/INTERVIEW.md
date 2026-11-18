# Interview guide

[Project README](../README.md)

## A short explanation

“I built an HR application with administrator and employee workflows. React is served by Nginx, which proxies requests to an Express API backed by MongoDB. I containerized the application and defined Kubernetes overlays for dev, staging, and production. GitHub Actions validates the application and infrastructure, scans for vulnerabilities and secrets, and publishes images. Environment promotion is reviewed in Git; Argo CD reconciles the selected overlay. Terraform defines the AWS networking, EKS, IAM, S3, and optional DocumentDB resources.”

Describe the work you personally performed and deployments you actually ran. The latest repairs were verified locally; deploying them to AWS remains a separate step.

## Two flows to learn

**Request:** browser → Traefik → Nginx/frontend → backend Service → Express authorization → database.

**Delivery:** GitHub → validation → image build → Trivy → Docker Hub → reviewed overlay digest → Argo CD → Kubernetes.

Local Compose skips the Traefik hop. Terraform provisions infrastructure separately.

## Practise these questions

| Question | Explain |
| --- | --- |
| Why Docker? | Consistent packaging; separate frontend/API images; Compose dependencies |
| Why Kubernetes? | Reconciliation, service discovery, probes, rollout, resource limits |
| Why GitOps? | Reviewed desired state, controller reconciliation, digest-based rollback |
| Why Kustomize? | Shared base plus environment namespaces/configuration/replicas/images |
| Authentication vs authorization? | Identify a user versus decide which operation/record they may access |
| Why a replica set? | Employee writes use multi-document transactions |
| How are secrets protected? | Ignored local inputs, deployment secrets, workload IAM, issuer-side rotation |
| What does the HPA scale? | Frontend pods by CPU; requires Metrics Server; not worker-node autoscaling |
| How does monitoring work? | ServiceMonitor → Prometheus → Grafana; rules → Alertmanager → SMTP |
| How do you recover? | Previous verified image digest; tested database backup/restore; separate migration plan |
| What is optional? | DocumentDB and Litmus need explicit setup; supplied Argo Application is dev-only |

## Improvements you can explain

Server-side role/ownership checks, revocable cookie sessions, transactional employee writes, precise salary arithmetic, department archiving, persistent development data, production S3 uploads, real tests, and blocking security scans.

Local evidence on 18 November 2026: 22 tests passed; frontend lint/build passed; built images had zero high/critical findings; configuration checks passed; synthetic MongoDB backup/restore passed.

Use actual experience. Do not invent uptime, scale, performance results, or cloud deployment evidence.
