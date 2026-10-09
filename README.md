# 🚀 Enterprise HR Management Platform (Cloud-Native)

Welcome to the HR Employee Management System! This repository demonstrates a complete, production-grade **Enterprise DevOps Architecture** built from the ground up. It takes a modern MERN stack application and deploys it using strict GitOps principles, Infrastructure as Code, and Cloud-Native best practices on AWS.

## 🏗️ Architecture Overview

*   **Frontend:** React.js (Nginx Reverse Proxy)
*   **Backend:** Node.js / Express
*   **Database:** MongoDB (AWS DocumentDB)
*   **Infrastructure:** AWS EKS (Kubernetes), VPC, NAT Gateways
*   **IaC (Infrastructure as Code):** Custom Modular Terraform
*   **CI/CD (GitOps):** GitHub Actions + Argo CD
*   **Configuration Management:** Ansible
*   **Observability:** Prometheus & Grafana
*   **Resilience Testing:** Litmus Chaos Engineering

---

## 📂 Repository Structure (The Gold Standard)

This repository strictly follows the Enterprise standard folder structure for separating concerns:

*   `app/` - The raw developer application code (Frontend & Backend).
*   `terraform/` - Strict, Custom Local Modules (`vpc/`, `eks/`, `iam/`, `rds/`) to build the AWS infrastructure securely without relying on public registries.
*   `k8s/` - Kubernetes deployment manifests utilizing **Kustomize** to manage environment overlays (`dev`, `staging`, `prod`) with zero code duplication.
*   `.github/` - The Continuous Integration (CI) pipeline that automatically builds and pushes Docker images to DockerHub.
*   `ansible/` - Dynamic inventories and playbooks to configure Bastion hosts and bootstrap the EKS cluster.
*   `monitoring/` - Automated Grafana dashboards to track Frontend/Backend CPU and RAM usage.
*   `chaos/` - Litmus Chaos experiments to randomly kill Pods and prove cluster auto-healing capabilities.

---

## ⚙️ The GitOps Pipeline

This project uses a modern **GitOps** deployment model, abandoning legacy push-based deployments.

1.  **Code Commit:** A developer pushes code to the `main` branch.
2.  **Continuous Integration:** GitHub Actions automatically builds the new Docker image, pushes it to DockerHub, and updates the image tags in the `k8s/base` folder.
3.  **Continuous Deployment:** **Argo CD**, running securely inside the AWS EKS cluster, detects the change in this GitHub repository and automatically pulls the new state into the live cluster. *GitHub never has access to the AWS credentials.*

---

## 🚀 Getting Started

### 1. Build the Infrastructure
```bash
cd terraform/
terraform init
terraform apply
```

### 2. Configure the Cluster
```bash
cd ansible/
ansible-playbook -i inventory/production.ini playbooks/setup-eks.yml
```

### 3. Deploy the Application
Deploy via Argo CD by pointing it to the specific environment overlay you wish to use:
*   `k8s/overlays/dev/` (1 Replica - Testing)
*   `k8s/overlays/staging/` (2 Replicas - QA)
*   `k8s/overlays/prod/` (3 Replicas - High Availability)

---
*Built with ❤️ and best practices.*
