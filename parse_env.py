#!/usr/bin/env python3
"""
Script to parse .env file and generate Kubernetes Secret and ConfigMap manifests
"""
import os
import re
import sys
from pathlib import Path

def parse_env_file(env_path):
    """Parse .env file and return key-value pairs"""
    env_vars = {}

    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            # Skip empty lines and comments
            if not line or line.startswith('#'):
                continue

            # Parse KEY=VALUE format
            match = re.match(r'^([^=]+)=(.*)$', line)
            if match:
                key, value = match.groups()
                # Remove quotes if present
                value = value.strip().strip('"\'')
                env_vars[key.strip()] = value

    return env_vars

def classify_variables(env_vars):
    """Classify environment variables into sensitive and non-sensitive"""
    sensitive_patterns = [
        'SECRET', 'KEY', 'PASSWORD', 'TOKEN', 'AUTH', 'API_KEY',
        'DATABASE_URL', 'DB_URL', 'CONN_STRING', 'GEMINI', 'JWT',
        'CLIENT_SECRET', 'ACCESS_TOKEN', 'REFRESH_TOKEN', 'PRIVATE'
    ]

    sensitive = {}
    non_sensitive = {}

    for key, value in env_vars.items():
        is_sensitive = False
        for pattern in sensitive_patterns:
            if pattern.upper() in key.upper():
                is_sensitive = True
                break

        if is_sensitive:
            sensitive[key] = value
        else:
            non_sensitive[key] = value

    return sensitive, non_sensitive

def generate_secret_yaml(secret_vars, namespace="default"):
    """Generate Kubernetes Secret manifest"""
    if not secret_vars:
        return None

    secret_data = {}
    for key, value in secret_vars.items():
        # Encode to base64 for secret
        import base64
        encoded_value = base64.b64encode(value.encode()).decode()
        secret_data[key] = encoded_value

    secret_yaml = f"""apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
  namespace: {namespace}
type: Opaque
data:
"""
    for key, encoded_value in secret_data.items():
        secret_yaml += f"  {key}: {encoded_value}\n"

    return secret_yaml

def generate_configmap_yaml(config_vars, namespace="default"):
    """Generate Kubernetes ConfigMap manifest"""
    if not config_vars:
        return None

    configmap_yaml = f"""apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
  namespace: {namespace}
data:
"""
    for key, value in config_vars.items():
        # Handle multi-line values
        if '\n' in value:
            configmap_yaml += f"  {key}: |\n"
            for line in value.split('\n'):
                configmap_yaml += f"    {line}\n"
        else:
            configmap_yaml += f"  {key}: \"{value}\"\n"

    return configmap_yaml

def main():
    if len(sys.argv) != 2:
        print("Usage: python parse_env.py <env_file_path>")
        sys.exit(1)

    env_path = sys.argv[1]

    if not os.path.exists(env_path):
        print(f"Error: {env_path} does not exist")
        sys.exit(1)

    # Parse environment variables
    env_vars = parse_env_file(env_path)
    print(f"Found {len(env_vars)} environment variables:")
    for key in env_vars.keys():
        print(f"  - {key}")

    # Classify variables
    sensitive, non_sensitive = classify_variables(env_vars)

    print(f"\nClassified {len(sensitive)} as sensitive and {len(non_sensitive)} as non-sensitive")

    # Generate Secret manifest
    secret_content = generate_secret_yaml(sensitive)
    if secret_content:
        print("\nGenerated Secret manifest:")
        print(secret_content)

        # Write to file
        with open("helm/backend/templates/secrets.yaml", "w") as f:
            f.write(secret_content)
        print("Saved to helm/backend/templates/secrets.yaml")

    # Generate ConfigMap manifest
    configmap_content = generate_configmap_yaml(non_sensitive)
    if configmap_content:
        print("\nGenerated ConfigMap manifest:")
        print(configmap_content)

        # Write to file
        with open("helm/backend/templates/configmap.yaml", "w") as f:
            f.write(configmap_content)
        print("Saved to helm/backend/templates/configmap.yaml")

if __name__ == "__main__":
    main()