# Kubernetes Deployment Guide for PrepAI

## Prerequisites

1. **Kubernetes Cluster** (choose one):
   - **Docker Desktop K8s**: Enable in Docker Desktop settings (easiest for local dev)
   - **Minikube**: `minikube start`
   - **Cloud**: AWS EKS, Azure AKS, Google GKE

2. **kubectl** installed: [Download here](https://kubernetes.io/docs/tasks/tools/)

3. **Docker images built**: 
   ```powershell
   cd 'C:\Users\siddo\OneDrive\Desktop\PrepAI\PrepAI'
   docker build -t prepai-backend ./backend
   docker build -t prepai-frontend ./frontend/interview-prep-ai
   ```

4. **Ingress Controller** (for routing):
   - Docker Desktop K8s: Already included
   - Minikube: `minikube addons enable ingress`

## Quick Start

### 1. Deploy All Resources

```powershell
cd 'C:\Users\siddo\OneDrive\Desktop\PrepAI\PrepAI\k8s'

# Create namespace and deploy all manifests in order
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f pvc-mongo.yaml
kubectl apply -f mongo-statefulset.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
```

Or deploy all at once:
```powershell
kubectl apply -f .
```

### 2. Verify Deployment

```powershell
# Check pods
kubectl get pods -n prepai
kubectl get pods -n prepai --watch  # Live updates

# Check services
kubectl get svc -n prepai

# Check deployments
kubectl get deployment -n prepai

# Describe resources for troubleshooting
kubectl describe pod <pod-name> -n prepai
kubectl describe svc backend -n prepai
```

### 3. Access Your App

**Option A: Port Forwarding** (easiest for local testing)
```powershell
# Frontend on localhost:3001
kubectl port-forward -n prepai svc/frontend 3001:80

# Backend on localhost:8000 (in another terminal)
kubectl port-forward -n prepai svc/backend 8000:8000
```

**Option B: Ingress** (if ingress controller is running)
```powershell
# Get ingress IP/hostname
kubectl get ingress -n prepai

# Then access:
# http://localhost (if ingress DNS is localhost)
# Frontend: http://localhost/
# API: http://localhost/api/...
```

## File Structure

```
k8s/
├── namespace.yaml           # Creates 'prepai' namespace
├── configmap.yaml           # Non-secret config (MongoDB URI, PORT)
├── secret.yaml              # Secrets (JWT_SECRET, API keys)
├── pvc-mongo.yaml           # Persistent volume claim for MongoDB
├── mongo-statefulset.yaml   # MongoDB StatefulSet + Service
├── backend-deployment.yaml  # Backend Deployment (2 replicas) + Service
├── frontend-deployment.yaml # Frontend Deployment (2 replicas) + Service
├── ingress.yaml             # Ingress routing rules
└── hpa.yaml                 # Horizontal Pod Autoscaler (auto-scaling)
```

## Key Features

### Auto-Scaling
- **Backend**: Scales 2-5 replicas based on CPU (70%) & memory (80%)
- **Frontend**: Scales 2-4 replicas based on CPU (75%)

### Health Checks
- **Liveness Probe**: Restarts pod if it stops responding
- **Readiness Probe**: Removes pod from service if unhealthy

### Self-Healing
- Pod crashes → K8s restarts it automatically
- Node goes down → Pods migrate to healthy nodes

### Rolling Updates
- Update image, pods gradually replace old ones (zero downtime)
- Example: `kubectl set image deployment/backend backend=prepai-backend:v2 -n prepai`

## Common Commands

```powershell
# View logs
kubectl logs -f deployment/backend -n prepai    # Follow logs
kubectl logs pod-name -n prepai                 # Single pod

# Execute commands in pod
kubectl exec -it pod-name -n prepai -- /bin/sh

# Scale manually
kubectl scale deployment backend --replicas=5 -n prepai

# Delete deployment
kubectl delete deployment backend -n prepai

# Delete entire namespace (deletes all resources)
kubectl delete namespace prepai

# Get resource details (YAML)
kubectl get deployment backend -o yaml -n prepai
```

## Update Image

When you build a new Docker image:

```powershell
# Build new image
docker build -t prepai-backend:v2 ./backend

# Update K8s deployment
kubectl set image deployment/backend backend=prepai-backend:v2 -n prepai

# Check rollout status
kubectl rollout status deployment/backend -n prepai

# Rollback if needed
kubectl rollout undo deployment/backend -n prepai
```

## Troubleshooting

**Pods stuck in "Pending"**
```powershell
kubectl describe pod pod-name -n prepai
# Check for insufficient resources or image pull errors
```

**Ingress not working**
```powershell
kubectl get ingress -n prepai
kubectl describe ingress prepai-ingress -n prepai
# Verify ingress controller is running: kubectl get svc -n ingress-nginx
```

**Backend can't reach MongoDB**
```powershell
# Test DNS resolution in backend pod
kubectl exec -it deployment/backend -n prepai -- nslookup mongo
# Should resolve to mongo service IP
```

## Security Notes (Production)

1. **Secrets**: Replace placeholder `JWT_SECRET` and add real values
2. **Image Registry**: Push to Docker Hub/Azure Container Registry instead of local
3. **RBAC**: Add role-based access control
4. **Network Policies**: Restrict pod-to-pod communication
5. **TLS/SSL**: Configure ingress with certificates

## Next Steps

- Monitor with Prometheus + Grafana
- Add CI/CD pipeline (GitHub Actions, GitLab CI)
- Use Helm for templating (optional, easier management)
- Deploy to cloud (AWS EKS, Azure AKS, Google GKE)
