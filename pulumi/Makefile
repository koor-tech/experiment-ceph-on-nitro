.PHONY: all install build deploy refresh \
				build-watch \
				check-ENV-ENVIRONMENT

PULUMI ?= pulumi
NODE ?= node
NPX ?= npx
YARN ?= yarn
TSC ?= $(NPX) tsc
PULUMI ?= pulumi

ENVIRONMENT ?= stock

FORCE ?= no

all: setup install build deploy

###########
# Tooling #
###########

check-ENV-ENVIRONMENT:
ifeq (,$(ENVIRONMENT))
	$(error "ENVIRONMENT not specified")
endif

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

refresh:
	@echo -e "==> Refreshing stack..."
	$(PULUMI) refresh --stack=$(ENVIRONMENT)
