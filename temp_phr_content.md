# Prompt History Record: Fixed K8s Frontend Port Configuration

## Summary
Fixed the Todo Frontend deployment by correcting the service configuration to map port 3000 to targetPort 3000 instead of the incorrect targetPort 80.

## Details
Resolved a port mismatch in the Kubernetes service configuration where the frontend service was incorrectly pointing to targetPort 80 instead of 3000. Updated Helm chart templates and patched the live service to fix the port forwarding issue that was causing "Connection refused" errors.

## Files Modified
- helm/frontend/templates/service.yaml
- helm/frontend/values.yaml

## Outcome
Successfully fixed port configuration allowing proper access to the Todo frontend application via port forwarding and NodePort service.