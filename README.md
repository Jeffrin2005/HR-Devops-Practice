# Enterprise Multi-Tier Microservices Platform

This repository contains a **Production-Grade DevSecOps & Enterprise Platform**. It connects every single pillar of modern DevOps: Infrastructure as Code, Security Scanning (SAST/SCA/IaC/Image), CI/CD, GitOps, Observability, and Chaos Engineering.

## 🏗️ Project Architecture & Directory Layout

- **`app/`**: Application Source Code (React Frontend & Node.js Backend)
- **`ci/`**: Continuous Integration (Jenkinsfile & automation scripts)
- **`k8s/`**: GitOps Manifests (Base resources and dev/staging/prod overlays for ArgoCD)
- **`terraform/`**: Infrastructure as Code (AWS EKS, VPC, RDS provisioning)
- **`ansible/`**: Configuration Management (OS bootstrapping & automation)
- **`monitoring/`**: Observability (Prometheus configurations and Grafana Dashboards)
- **`scripts/`**: Bash utilities for local development and clean-up
- **`chaos/`**: Chaos Engineering (Network latency and pod-kill experiments)

## 🚀 Deployment Flow (GitOps)
1. Developers push code to `app/`.
2. Jenkins triggers CI pipeline (Testing -> SonarQube -> Trivy Scan -> Cosign Signing -> DockerHub).
3. Jenkins updates the image tag in `k8s/base/`.
4. ArgoCD detects the change and progressively rolls out the new version using Canary Deployments.
5. Prometheus & Grafana monitor cluster health, while Kyverno enforces zero-trust security policies.
