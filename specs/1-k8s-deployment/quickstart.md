# Quickstart Guide: Phase IV - Local Kubernetes Deployment

**Feature**: Phase IV - Local Kubernetes Deployment
**Date**: 2026-02-05

## Prerequisites

Before starting the deployment, ensure your system has the following:

- Docker Desktop 4.53+ with Kubernetes enabled (OR Minikube installed)
- Helm CLI v3.x
- kubectl
- kubectl-ai plugin (optional but recommended)
- Gordon AI (Docker AI) available (optional but recommended)

## Quick Deployment Steps

### Step 1: Verify Environment
```bash
# Check Docker installation
docker --version

# Verify Kubernetes cluster access
kubectl cluster-info

# Check Helm availability
helm version
```

### Step 2: Containerize Applications
```bash
# Navigate to backend directory
cd [BACKEND_PATH]

# Generate Dockerfile using Gordon AI or Claude Code
# (Assuming Dockerfile is already created per plan)

# Build backend image
docker build -t todo-backend:latest .

# Navigate to frontend directory
cd [FRONTEND_PATH]

# Build frontend image
docker build -t todo-frontend:latest .
```

### Step 3: Deploy with Helm Charts
```bash
# Deploy backend
helm install todo-backend ./helm/backend

# Deploy frontend
helm install todo-frontend ./helm/frontend
```

### Step 4: Verify Deployment
```bash
# Check all pods
kubectl get pods

# Check all services
kubectl get svc

# Verify applications are running
kubectl get deployments
```

### Step 5: Access Applications
```bash
# Get service details
kubectl get svc todo-frontend

# Access frontend (replace NODE_PORT with actual port from above command)
http://localhost:[NODE_PORT]

# Access backend health check
kubectl port-forward service/todo-backend 8080:8080
curl http://localhost:8080/health
```

## AI-Assisted Commands

Once deployed, use these AI-assisted commands for operations:

```bash
# Scale frontend to 2 replicas
kubectl ai "scale frontend deployment to 2 replicas"

# Scale backend to 2 replicas
kubectl ai "scale backend deployment to 2 replicas"

# Check for failing pods
kubectl ai "check for failing pods"

# Troubleshoot issues
kubectl ai "troubleshoot failing pods"
```

## Troubleshooting

### Common Issues

1. **Pods stuck in Pending state**
   - Check if Kubernetes cluster has sufficient resources
   - Verify resource requests in Helm charts match available resources

2. **Services not accessible**
   - Check service type (should be NodePort for frontend)
   - Verify port mappings are correct (frontend: 3000, backend: 8080)

3. **Backend health check failing**
   - Verify database connectivity if required
   - Check logs: `kubectl logs deployment/todo-backend`

## Next Steps

After successful deployment:

1. Test application functionality through the UI
2. Verify backend API endpoints
3. Test scaling operations using AI commands
4. Monitor resource usage with `kubectl top pods`
5. Review and customize Helm chart values for your environment