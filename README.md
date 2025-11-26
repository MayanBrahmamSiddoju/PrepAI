# PrepAI

## Jenkins CI/CD & Docker Hub Integration

### Jenkins Docker Hub Credentials
To enable Jenkins to push Docker images to Docker Hub:
1. In Jenkins, go to **Manage Jenkins > Credentials > System > Global credentials**.
2. Add a new credential:
   - Kind: `Username with password`
   - ID: `dockerhub-creds`
   - Username: `mayanbrahmam`
   - Password: `<your Docker Hub password or access token>`

### Kubernetes: Image Pull Secret
If your Docker Hub repository is private, create a Kubernetes image pull secret:

```powershell
kubectl create secret docker-registry regcred \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=mayanbrahmam \
  --docker-password=<your Docker Hub password or token> \
  --docker-email=<your email> \
  -n prepai
```

Then add to your Deployment YAML under `spec.template.spec`:

```yaml
imagePullSecrets:
  - name: regcred
```

### Jenkinsfile Pipeline
The pipeline will build and push images for backend and frontend to Docker Hub as `mayanbrahmam/prepai-backend` and `mayanbrahmam/prepai-frontend`.
