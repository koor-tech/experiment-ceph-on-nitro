.PHONY: all rook cluster \
				check-ENV-ENVIRONMENT \
				generated-folder generate

all: rook cluster

ENVIRONMENT ?= stock

KUBECONFIG ?= ../secrets/k8s/cluster/admin.conf
KUBECTL ?= KUBECONFIG=$(KUBECONFIG) kubectl

KUSTOMIZE_OPTS ?= --load-restrictor=LoadRestrictionsNone
KUSTOMIZE ?= $(KUBECTL) -k $(KUSTOMIZE_OPTS)
KUSTOMIZE_DIR ?= ./generated/$(ENVIRONMENT)

check-ENV-ENVIRONMENT:
ifeq (,$(ENVIRONMENT))
	$(error "ENVIRONMENT not specified")
endif

###########
# Tooling #
###########

generated-folder: check-ENV-ENVIRONTMENT
	mkdir -p $(GENERATED_DIR)

generate: generated-folder
	$(KUSTOMIZE) build $(KUSTOMIZE_DIR) -o $(GENERATED_DIR)

########
# Rook #
########

rook:
	@echo "=> Installing CRDs for rook..."
	$(KUBECTL) apply -f crds.yaml
	@echo "=> Installing common resources for rook..."
	$(KUBECTL) apply -f common.yaml
	@echo "=> Installing rook operator..."
	$(KUBECTL) apply -f operator.yaml

cluster: generate
	@echo "=> Installing rook cluster..."
	$(KUBECTL) apply -f cluster.yaml
