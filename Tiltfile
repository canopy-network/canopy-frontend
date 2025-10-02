# Tiltfile for Canopy Frontend Local Development
# Provides hot reloading, automatic rebuilds, and monitoring

# Configuration
load('ext://restart_process', 'docker_build_with_restart')
load('ext://helm_remote', 'helm_remote')

# Set up local development environment
allow_k8s_contexts('kind-dev')

# Build configuration
DOCKERFILE = './deploy/docker/Dockerfile.dev'
IMAGE_NAME = 'canopy-frontend-dev'

# Build Docker image with live reload
docker_build(
    IMAGE_NAME,
    context='.',
    dockerfile=DOCKERFILE,
    # Only rebuild when these files change
    only=[
        './app/',
        './components/',
        './lib/',
        './types/',
        './public/',
        './styles/',
        './package.json',
        './package-lock.json',
        './next.config.mjs',
        './tailwind.config.ts',
        './tsconfig.json',
        './postcss.config.mjs',
        './components.json'
    ],
    # Live update for faster development
    live_update=[
        # Restart when package.json changes - must be first
        fall_back_on(['./package.json']),
        
        # Sync source code changes
        sync('./app/', '/app/app/'),
        sync('./components/', '/app/components/'),
        sync('./lib/', '/app/lib/'),
        sync('./types/', '/app/types/'),
        sync('./public/', '/app/public/'),
        sync('./styles/', '/app/styles/'),
        sync('./next.config.mjs', '/app/next.config.mjs'),
        sync('./tailwind.config.ts', '/app/tailwind.config.ts'),
        sync('./tsconfig.json', '/app/tsconfig.json'),
        sync('./postcss.config.mjs', '/app/postcss.config.mjs'),
        sync('./components.json', '/app/components.json'),
    ]
)

# Use the existing local overlay
k8s_yaml(kustomize('./deploy/k8s/overlays/local'))

# Update image in the deployment to use our dev image
k8s_image_json_path('local-canopy-frontend', '{.spec.template.spec.containers[0].image}', IMAGE_NAME)

# Port forward to access the application
k8s_resource(
    'local-canopy-frontend',
    port_forwards=['3000:3000'],
    labels=['frontend']
)

# Local resource for npm commands
local_resource(
    'npm-install',
    cmd='npm install',
    deps=['package.json', 'package-lock.json'],
    labels=['setup']
)

# Local resource for linting (optional)
local_resource(
    'lint',
    cmd='npm run lint',
    deps=[
        './app/',
        './components/',
        './lib/',
        './types/',
    ],
    auto_init=False,
    trigger_mode=TRIGGER_MODE_MANUAL,
    labels=['dev-tools']
)

# Display startup message
print("""
Canopy Frontend Development Environment

Services:
- Frontend: http://localhost:3000
- Tilt UI: http://localhost:10350

Commands:
- tilt up    : Start development environment
- tilt down  : Stop all services
- tilt logs  : View logs
""")
