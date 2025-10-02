.PHONY: help install dev build test clean docker-build docker-push docker-run docker-dev compose-up compose-down k8s-local k8s-staging k8s-delete tilt-up tilt-down logs status restart

# Variables
APP_NAME := canopy-frontend
VERSION ?= $(shell git rev-parse --short HEAD 2>/dev/null || echo "dev")
REGISTRY ?= docker.io
NAMESPACE_LOCAL ?= canopy-local
NAMESPACE_STAGING ?= canopy-staging
IMAGE := $(REGISTRY)/$(APP_NAME):$(VERSION)
IMAGE_LATEST := $(REGISTRY)/$(APP_NAME):latest
KUSTOMIZE_LOCAL := deploy/k8s/overlays/local
KUSTOMIZE_STAGING := deploy/k8s/overlays/staging

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
PURPLE := \033[0;35m
CYAN := \033[0;36m
NC := \033[0m # No Color

help: ## Display this help message
	@echo ""
	@echo "$(CYAN)Canopy Frontend - Deployment Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Development:$(NC)"
	@grep -E '^(install|dev|build|test|clean):.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Docker:$(NC)"
	@grep -E '^(docker-|compose-).*:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Kubernetes:$(NC)"
	@grep -E '^k8s-.*:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Tilt:$(NC)"
	@grep -E '^tilt-.*:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Utilities:$(NC)"
	@grep -E '^(logs|status|restart):.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BLUE)Examples:$(NC)"
	@echo "  $(CYAN)make dev$(NC)               # Start development server"
	@echo "  $(CYAN)make tilt-up$(NC)          # Start Tilt development environment"
	@echo "  $(CYAN)make docker-build$(NC)     # Build production Docker image"
	@echo "  $(CYAN)make k8s-local$(NC)        # Deploy to local Kubernetes"
	@echo ""

# =============================================================================
# Development Commands
# =============================================================================

install: ## Install dependencies
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	npm install

dev: ## Run development server
	@echo "$(YELLOW)Starting development server...$(NC)"
	npm run dev

build: ## Build Next.js application for production
	@echo "$(YELLOW)Building application...$(NC)"
	npm run build

test: ## Run tests
	@echo "$(YELLOW)Running tests...$(NC)"
	npm run lint

clean: ## Clean build artifacts and dependencies
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	rm -rf .next
	rm -rf node_modules
	rm -rf dist
	@echo "$(GREEN)Clean complete$(NC)"

# =============================================================================
# Docker Commands
# =============================================================================

docker-build: ## Build production Docker image
	@echo "$(YELLOW)Building production Docker image: $(IMAGE)$(NC)"
	docker build -t $(IMAGE) -t $(IMAGE_LATEST) .
	@echo "$(GREEN)Docker build complete$(NC)"

docker-dev: ## Build development Docker image
	@echo "$(YELLOW)Building development Docker image...$(NC)"
	docker build -f Dockerfile.dev -t $(APP_NAME):dev .
	@echo "$(GREEN)Development Docker build complete$(NC)"

docker-run: docker-build ## Run production Docker container locally
	@echo "$(YELLOW)Running Docker container on port 3000...$(NC)"
	@echo "$(BLUE)Access at: http://localhost:3000$(NC)"
	docker run -p 3000:3000 --rm --name $(APP_NAME) $(IMAGE)

docker-run-dev: docker-dev ## Run development Docker container with hot reload
	@echo "$(YELLOW)Running development Docker container...$(NC)"
	@echo "$(BLUE)Access at: http://localhost:3000$(NC)"
	docker run -p 3000:3000 -v $(PWD):/app -v /app/node_modules --rm --name $(APP_NAME)-dev $(APP_NAME):dev

docker-push: docker-build ## Build and push Docker image to registry
	@echo "$(YELLOW)Pushing Docker image to $(REGISTRY)...$(NC)"
	docker push $(IMAGE)
	docker push $(IMAGE_LATEST)
	@echo "$(GREEN)Docker push complete$(NC)"

compose-up: ## Start services with Docker Compose
	@echo "$(YELLOW)Starting Docker Compose services...$(NC)"
	@echo "$(BLUE)Access at: http://localhost:3000$(NC)"
	docker-compose up

compose-down: ## Stop Docker Compose services
	@echo "$(YELLOW)Stopping Docker Compose services...$(NC)"
	docker-compose down
	@echo "$(GREEN)Docker Compose stopped$(NC)"

compose-build: ## Build and start services with Docker Compose
	@echo "$(YELLOW)Building and starting Docker Compose services...$(NC)"
	docker-compose up --build

# =============================================================================
# Kubernetes Commands
# =============================================================================

k8s-local: ## Deploy to local Kubernetes using Kustomize
	@echo "$(YELLOW)Deploying to local Kubernetes ($(NAMESPACE_LOCAL))...$(NC)"
	kubectl apply -k $(KUSTOMIZE_LOCAL) --create-namespace
	@echo "$(GREEN)Local deployment complete$(NC)"
	@echo "$(BLUE)Check status: make status$(NC)"

k8s-staging: ## Deploy to staging Kubernetes using Kustomize
	@echo "$(YELLOW)Deploying to staging Kubernetes ($(NAMESPACE_STAGING))...$(NC)"
	kubectl apply -k $(KUSTOMIZE_STAGING) --create-namespace
	@echo "$(GREEN)Staging deployment complete$(NC)"

k8s-delete: ## Delete Kubernetes resources
	@echo "$(YELLOW)Deleting Kubernetes resources...$(NC)"
	@read -p "Delete LOCAL (l) or STAGING (s) or BOTH (b)? [l/s/b]: " env; \
	case $$env in \
		l|L|local) kubectl delete -k $(KUSTOMIZE_LOCAL) ;; \
		s|S|staging) kubectl delete -k $(KUSTOMIZE_STAGING) ;; \
		b|B|both) kubectl delete -k $(KUSTOMIZE_LOCAL); kubectl delete -k $(KUSTOMIZE_STAGING) ;; \
		*) echo "$(RED)Invalid option$(NC)"; exit 1 ;; \
	esac
	@echo "$(GREEN)Kubernetes resources deleted$(NC)"

k8s-local-build: docker-build k8s-local ## Build Docker image and deploy to local K8s

# =============================================================================
# Tilt Commands
# =============================================================================

tilt-up: ## Start Tilt development environment
	@echo "$(YELLOW)Starting Tilt development environment...$(NC)"
	@echo "$(BLUE)Tilt UI: http://localhost:10350$(NC)"
	@echo "$(BLUE)Frontend: http://localhost:3000$(NC)"
	@echo "$(PURPLE)Press Ctrl+C to stop$(NC)"
	tilt up

tilt-down: ## Stop Tilt development environment
	@echo "$(YELLOW)Stopping Tilt...$(NC)"
	tilt down
	@echo "$(GREEN)Tilt stopped$(NC)"

tilt-logs: ## View Tilt logs
	@echo "$(YELLOW)Viewing Tilt logs...$(NC)"
	tilt logs

# =============================================================================
# Utility Commands
# =============================================================================

logs: ## Tail logs from Kubernetes deployment
	@echo "$(YELLOW)Viewing logs...$(NC)"
	@read -p "View LOCAL (l) or STAGING (s) logs? [l/s]: " env; \
	case $$env in \
		l|L|local) kubectl logs -f -l app=$(APP_NAME) -n $(NAMESPACE_LOCAL) ;; \
		s|S|staging) kubectl logs -f -l app=$(APP_NAME) -n $(NAMESPACE_STAGING) ;; \
		*) echo "$(RED)Invalid option$(NC)"; exit 1 ;; \
	esac

status: ## Check Kubernetes deployment status
	@echo "$(YELLOW)Checking deployment status...$(NC)"
	@echo ""
	@echo "$(BLUE)Local ($(NAMESPACE_LOCAL)):$(NC)"
	@kubectl get all -l app=$(APP_NAME) -n $(NAMESPACE_LOCAL) 2>/dev/null || echo "  No resources found"
	@echo ""
	@echo "$(BLUE)Staging ($(NAMESPACE_STAGING)):$(NC)"
	@kubectl get all -l app=$(APP_NAME) -n $(NAMESPACE_STAGING) 2>/dev/null || echo "  No resources found"

restart: ## Restart Kubernetes deployment
	@echo "$(YELLOW)Restarting deployment...$(NC)"
	@read -p "Restart LOCAL (l) or STAGING (s)? [l/s]: " env; \
	case $$env in \
		l|L|local) kubectl rollout restart deployment/local-$(APP_NAME) -n $(NAMESPACE_LOCAL) ;; \
		s|S|staging) kubectl rollout restart deployment/staging-$(APP_NAME) -n $(NAMESPACE_STAGING) ;; \
		*) echo "$(RED)Invalid option$(NC)"; exit 1 ;; \
	esac
	@echo "$(GREEN)Restart initiated$(NC)"

port-forward: ## Port forward to local Kubernetes service
	@echo "$(YELLOW)Port forwarding from local Kubernetes...$(NC)"
	@echo "$(BLUE)Access at: http://localhost:8080$(NC)"
	@echo "$(PURPLE)Press Ctrl+C to stop$(NC)"
	kubectl port-forward svc/local-$(APP_NAME) 8080:80 -n $(NAMESPACE_LOCAL)

# =============================================================================
# Combined Workflows
# =============================================================================

deploy-local: k8s-local-build ## Build and deploy to local Kubernetes

setup: install ## Initial project setup
	@echo "$(GREEN)Project setup complete!$(NC)"
	@echo ""
	@echo "$(BLUE)Next steps:$(NC)"
	@echo "  $(CYAN)make dev$(NC)        - Start development server"
	@echo "  $(CYAN)make tilt-up$(NC)    - Start Tilt development environment"
	@echo "  $(CYAN)make help$(NC)       - See all available commands"

# =============================================================================
# Development Utilities
# =============================================================================

docker-clean: ## Clean Docker images and containers
	@echo "$(YELLOW)Cleaning Docker resources...$(NC)"
	docker container prune -f
	docker image prune -f
	docker system df
	@echo "$(GREEN)Docker cleanup complete$(NC)"

kind-load: docker-build ## Load Docker image into KIND cluster
	@echo "$(YELLOW)Loading image into KIND cluster...$(NC)"
	kind load docker-image $(IMAGE) --name dev 2>/dev/null || kind load docker-image $(IMAGE)
	@echo "$(GREEN)Image loaded into KIND$(NC)"

validate: ## Validate Kubernetes manifests
	@echo "$(YELLOW)Validating Kubernetes manifests...$(NC)"
	@echo "$(BLUE)Local overlay:$(NC)"
	kubectl kustomize $(KUSTOMIZE_LOCAL) > /dev/null && echo "  Valid"
	@echo "$(BLUE)Staging overlay:$(NC)"
	kubectl kustomize $(KUSTOMIZE_STAGING) > /dev/null && echo "  Valid"
	@echo "$(GREEN)All manifests valid$(NC)"
