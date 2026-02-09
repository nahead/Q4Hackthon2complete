# Data Model: Phase IV - Local Kubernetes Deployment

**Feature**: Phase IV - Local Kubernetes Deployment
**Date**: 2026-02-05

## Overview
This document outlines the key data entities and their relationships relevant to the Kubernetes deployment of the Todo Chatbot application. Since this feature focuses on deployment rather than new data structures, the model primarily addresses configuration and deployment-related entities.

## Key Entities

### Backend Service Configuration
- **Name**: Backend Service Configuration
- **Description**: Configuration parameters for the backend service in Kubernetes
- **Fields**:
  - service_name: String (identifier for the backend service)
  - image_name: String (Docker image name for backend)
  - image_tag: String (version tag for the Docker image)
  - port: Integer (port number, typically 8080)
  - replica_count: Integer (number of pod replicas, 1-2)
  - cpu_request: String (CPU resource request, e.g., "100m")
  - cpu_limit: String (CPU resource limit, e.g., "200m")
  - memory_request: String (memory request, e.g., "128Mi")
  - memory_limit: String (memory limit, e.g., "256Mi")
  - health_check_path: String (health check endpoint, e.g., "/health")
  - environment_variables: Map<String, String> (configuration parameters)

### Frontend Service Configuration
- **Name**: Frontend Service Configuration
- **Description**: Configuration parameters for the frontend service in Kubernetes
- **Fields**:
  - service_name: String (identifier for the frontend service)
  - image_name: String (Docker image name for frontend)
  - image_tag: String (version tag for the Docker image)
  - port: Integer (port number, typically 3000)
  - replica_count: Integer (number of pod replicas, 1-2)
  - cpu_request: String (CPU resource request, e.g., "50m")
  - cpu_limit: String (CPU resource limit, e.g., "100m")
  - memory_request: String (memory request, e.g., "64Mi")
  - memory_limit: String (memory limit, e.g., "128Mi")
  - environment_variables: Map<String, String> (configuration parameters)

### Kubernetes Deployment Entity
- **Name**: Kubernetes Deployment
- **Description**: Represents a Kubernetes Deployment resource
- **Fields**:
  - name: String (name of the deployment)
  - namespace: String (Kubernetes namespace, default "default")
  - replicas: Integer (desired number of pod replicas)
  - selector: Map<String, String> (label selectors for pods)
  - template_labels: Map<String, String> (labels applied to pods)
  - container_image: String (container image reference)
  - container_port: Integer (port exposed by container)
  - resources_requests: Map<String, String> (resource requests)
  - resources_limits: Map<String, String> (resource limits)
  - env_configmaps: List<String> (referenced ConfigMap names)
  - env_secrets: List<String> (referenced Secret names)
  - liveness_probe: Probe (liveness health check configuration)
  - readiness_probe: Probe (readiness health check configuration)

### Kubernetes Service Entity
- **Name**: Kubernetes Service
- **Description**: Represents a Kubernetes Service resource
- **Fields**:
  - name: String (name of the service)
  - namespace: String (Kubernetes namespace)
  - service_type: String ("ClusterIP", "NodePort", "LoadBalancer", or "ExternalName")
  - port_mapping: List<PortMapping> (port mappings for the service)
  - selector: Map<String, String> (selector to match pods)
  - cluster_ip: String (assigned cluster IP, if applicable)

### Port Mapping Entity
- **Name**: Port Mapping
- **Description**: Defines port mapping for Kubernetes services
- **Fields**:
  - port: Integer (port exposed by the service)
  - target_port: Integer (port on the pod/container)
  - protocol: String ("TCP", "UDP", or "SCTP")

### Helm Chart Values
- **Name**: Helm Chart Values
- **Description**: Configuration values for Helm chart customization
- **Fields**:
  - replica_count: Integer (number of replicas to deploy)
  - image.repository: String (Docker image repository)
  - image.pullPolicy: String ("Always", "Never", "IfNotPresent")
  - image.tag: String (image tag override)
  - service.type: String (Kubernetes service type)
  - service.port: Integer (service port)
  - resources: Map<String, Object> (resource requests and limits)
  - nodeSelector: Map<String, String> (node selection constraints)
  - tolerations: List<Object> (toleration definitions)
  - affinity: Map<String, Object> (affinity definitions)
  - environment: Map<String, String> (environment variables)

### ConfigMap Entity
- **Name**: ConfigMap
- **Description**: Kubernetes resource for storing non-sensitive configuration data
- **Fields**:
  - name: String (name of the ConfigMap)
  - namespace: String (Kubernetes namespace)
  - data: Map<String, String> (key-value pairs of configuration data)
  - binary_data: Map<String, BinaryData> (binary data)

### Secret Entity
- **Name**: Secret
- **Description**: Kubernetes resource for storing sensitive data
- **Fields**:
  - name: String (name of the Secret)
  - namespace: String (Kubernetes namespace)
  - type: String (secret type, e.g., "Opaque", "kubernetes.io/tls")
  - data: Map<String, String> (key-value pairs of sensitive data, base64 encoded)
  - string_data: Map<String, String> (unencoded sensitive data)

## Relationships

### Backend Service Configuration → Kubernetes Deployment
- One Backend Service Configuration defines the parameters for one Kubernetes Deployment
- The configuration provides values for the deployment's container image, resources, and environment

### Frontend Service Configuration → Kubernetes Deployment
- One Frontend Service Configuration defines the parameters for one Kubernetes Deployment
- The configuration provides values for the deployment's container image, resources, and environment

### Kubernetes Deployment → Kubernetes Service
- One Kubernetes Deployment is typically associated with one or more Kubernetes Services
- Services provide network access to the pods managed by the deployment

### Kubernetes Deployment → ConfigMap/Secret
- Kubernetes Deployments reference ConfigMaps and Secrets for configuration data
- Multiple deployments may share the same ConfigMaps/Secrets

### Helm Chart Values → Kubernetes Deployment/Service
- Helm Chart Values provide configurable parameters for Kubernetes Deployments and Services
- Values serve as templates for generating actual Kubernetes resources

## State Transitions (for Deployments)

### Deployment States
1. **Created** - Deployment resource created in Kubernetes API
2. **Scaling** - Deployment controller adjusts replica count
3. **Updating** - Deployment is being updated with new image/configuration
4. **Active** - Deployment has the desired number of ready pods
5. **Failed** - Deployment has failed to create desired number of pods
6. **Terminating** - Deployment is being deleted

## Validation Rules

### From Requirements
- **FR-001**: Backend container must expose port 8080
- **FR-002**: Frontend container must expose port 3000
- **FR-003**: Backend deployment must support configurable replica count (1-2)
- **FR-004**: Frontend deployment must support configurable replica count (1-2)
- **FR-005**: Backend service must allow internal/external access
- **FR-006**: Frontend service must allow external access via port 3000
- **FR-008**: ConfigMap resources must be generated for environment variables

### Additional Constraints
- Resource requests must be less than or equal to resource limits
- Service ports must match container ports
- Image tags must follow valid Docker image tag format
- Replica counts must be positive integers
- Environment variable names must follow valid format (alphanumeric + underscore)