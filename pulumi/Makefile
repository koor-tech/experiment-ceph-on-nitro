.PHONY: all install build \
				deploy \
				destroy refresh \
				build-watch \
				check-ENV-ENVIRONMENT

PULUMI ?= pulumi
NODE ?= node
NPX ?= npx
YARN ?= yarn
TSC ?= $(NPX) tsc
PULUMI ?= pulumi

# nitro | stock
# NOTE: this is normally influenced by parent make
ENVIRONMENT ?= stock

FORCE ?= no

CONTROLLER_USERDATA_PATH ?= $(realpath ../config/aws/ec2-controller-userdata.bash)
WORKER_USERDATA_PATH ?= $(realpath ../config/aws/ec2-worker-userdata.bash)

CLUSTER_OUTPUT_BASE_DIR_PATH ?= $(realpath ../secrets/k8s/cluster)

all: setup install build deploy

###########
# Tooling #
###########

check-ENV-ENVIRONMENT:
ifeq (,$(ENVIRONMENT))
	$(error "ENVIRONMENT not specified")
endif

check-PULUMI_CONFIG_PASSPHRASE:
ifeq (,$(PULUMI_CONFIG_PASSPHRASE))
	$(error "PULUMI_CONFIG_PASSPHRASE not specified! Do you have your .env set up properly (with direnv)?")
endif

## Generate secret for pulumi if not already present
PULUMI_SECRET_DIR ?= secrets/pulumi
PULUMI_AWS_ACCESS_KEY_ID_PATH ?= $(PULUMI_SECRET_DIR)/aws-access-key-id.secret
PULUMI_AWS_SECRET_ACCESS_KEY_PATH ?= $(PULUMI_SECRET_DIR)/aws-secret-access-key.secret

#####################
# Top level targets #
#####################

PULUMI_STATE_DIR ?= ../secrets/pulumi/state

setup:
	mkdir -p $(PULUMI_STATE_DIR)

install:
	@echo -e "==> Installing pulumi & dependencies..."
	$(YARN) install

lint:
	@echo -e "==> Linting..."
	$(YARN) lint

build:
	@echo -e "==> Building..."
	$(YARN) build

build-watch:
	@echo -e "==> Running build & watch process for pulumi..."
	$(YARN) build-watch

deploy:
ifeq ("yes","$(FORCE)")
	@echo -e "==> Running pulumi up (force)..."
	$(PULUMI) up --stack=$(ENVIRONMENT) --skip-preview --refresh --yes
else
	@echo -e "==> Running pulumi up..."
	$(PULUMI) up --stack=$(ENVIRONMENT) --refresh
endif

destroy:
ifeq ("yes","$(FORCE)")
	@echo -e "==> Removing deployment (force)..."
	$(PULUMI) destroy --stack=$(ENVIRONMENT) --skip-preview --refresh --yes
else
	@echo -e "==> Removing deployment..."
	$(PULUMI) destroy --stack=$(ENVIRONMENT) --refresh
endif

refresh:
	@echo -e "==> Refreshing stack..."
	$(PULUMI) refresh --stack=$(ENVIRONMENT)
