#!/usr/bin/env python3
"""
Script to parse frontend .env file and generate Kubernetes Secret manifest for Next.js frontend
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

def classify_frontend_variables(env_vars):
    """Classify frontend environment variables into public and private (secret)"""
    public_vars = {}
    private_vars = {}

    for key, value in env_vars.items():
        if key.startswith('NEXT_PUBLIC_'):
            public_vars[key] = value
        else:
            # Treat other variables as sensitive
            private_vars[key] = value

    return public_vars, private_vars

def generate_secret_yaml(secret_vars, namespace="default"):
    """Generate Kubernetes Secret manifest for frontend"""
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
  name: frontend-secrets
  namespace: {namespace}
type: Opaque
data:
"""
    for key, encoded_value in secret_data.items():
        secret_yaml += f"  {key}: {encoded_value}\n"

    return secret_yaml

def generate_configmap_yaml(config_vars, namespace="default"):
    """Generate Kubernetes ConfigMap manifest for public variables"""
    if not config_vars:
        return None

    configmap_yaml = f"""apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
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
        print("Usage: python parse_frontend_env.py <env_file_path>")
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
    public_vars, private_vars = classify_frontend_variables(env_vars)

    print(f"\nClassified {len(public_vars)} as public (NEXT_PUBLIC_*) and {len(private_vars)} as private (secrets)")

    # Generate Secret manifest for private variables
    if private_vars:
        secret_content = generate_secret_yaml(private_vars)
        print("\nGenerated Secret manifest for private variables:")
        print(secret_content)

        # Write to file
        os.makedirs("helm/frontend/templates", exist_ok=True)
        with open("helm/frontend/templates/secrets.yaml", "w") as f:
            f.write(secret_content)
        print("Saved secrets to helm/frontend/templates/secrets.yaml")

    # Generate ConfigMap manifest for public variables
    if public_vars:
        configmap_content = generate_configmap_yaml(public_vars)
        print("\nGenerated ConfigMap manifest for public variables:")
        print(configmap_content)

        # Write to file (create if doesn't exist)
        if os.path.exists("helm/frontend/templates/configmap.yaml"):
            print("ConfigMap already exists, skipping...")
        else:
            os.makedirs("helm/frontend/templates", exist_ok=True)
            with open("helm/frontend/templates/configmap.yaml", "w") as f:
                f.write(configmap_content)
            print("Saved public config to helm/frontend/templates/configmap.yaml")

    print(f"\nPublic variables (will be available at build time and runtime):")
    for key, value in public_vars.items():
        print(f"  - {key}: {value}")

    print(f"\nPrivate variables (stored as secrets):")
    for key, value in private_vars.items():
        print(f"  - {key}: [HIDDEN FOR SECURITY]")

if __name__ == "__main__":
    main()