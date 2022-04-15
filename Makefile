.PHONY: all test \
				deploy deploy-infra deploy-k8s deploy-rook \
				test test-k8s-pgbench \
				check-ENV-ENVIRONMENT \
				check-tool-kubectl check-tool-pulumi

DOCKER ?= docker
KUBECTL ?= kubectl
ENVSUBST ?= envsubst
K0SCTL ?=  k0sctl

ENVIRONMENT ?= stock # stock | nitro

PROJECT_NAME ?= con # Ceph On Nitro

K8S_NAMESPACE ?= con-$(ENVIRONMENT)

# Used for accessing machines after they've been provisioned
# (you shouldn't need to use this, but just in case!)
SSH_KEY_PATH ?= ~/.ssh/id_rsa

# Where the k8s cluster will be stored
K8S_CLUSTER_SECRETS_FOLDER_PATH = ./secrets/k8s/cluster
K8S_CLUSTER_ADMIN_CONFIG_PATH = ./secrets/k8s/cluster/admin.conf

# What postgres image are we going to use for pgbench and the DB itself?
POSTGRES_IMAGE ?= postgres:14.2-alpine

#####################
# Top level targets #
#####################

all: deploy test

deploy: deploy-infra deploy-k8s deploy-rook

test: test-k8s-pgbench

#########################
# Tooling / Environment #
#########################

check-ENV-ENVIRONMENT:
ifeq (,$(ENVIRONMENT))
	$(error "ENVIRONMENT not specified")
endif

check-tool-kubectl:
ifeq (,$(shell which $(KUBECTL)))
	$(error "ERROR: kubectl does not seem to be installed (https://kubernetes.io/docs/tasks/tools/)")
endif

check-tool-pulumi:
ifeq (,$(shell which $(PULUMI)))
	$(error "ERROR: pulumi does not seem to be installed (https://www.pulumi.com/docs/get-started/install/)")
endif

check-tool-k0sctl:
ifeq (,$(shell which $(K0SCTL)))
	$(error "ERROR: k0sctl does not seem to be installed (https://docs.k0sproject.io/v1.23.5+k0s.0/install/)")
endif

##################
# Infrastructure #
##################

NODE_0_IP_PATH ?= ./secrets/k8s/cluster/node.0.ip-address.secret
NODE_1_IP_PATH ?= ./secrets/k8s/cluster/node.1.ip-address.secret
NODE_2_IP_PATH ?= ./secrets/k8s/cluster/node.2.ip-address.secret

K0SCTL_YAML_TEMPLATE_PATH ?= k0s/k0sctl.yaml.pre
K0SCTL_YAML_PATH ?= k0s/generated/k0sctl.yaml

deploy-infra: deploy-pulumi

deploy-pulumi:
	$(MAKE) -c pulumi

deploy-k8s: NODE_0_IP=$(read $(NODE_0_IP_EXPECTED_PATH))
deploy-k8s: NODE_1_IP=$(read $(NODE_1_IP_EXPECTED_PATH))
deploy-k8s: NODE_2_IP=$(read $(NODE_2_IP_EXPECTED_PATH))
deploy-k8s:
# Install k0s, quick & dirty
	@echo -e "=> Generating k0sctl.yaml based on template @ [$(K0SCTL_YAML_TEMPLATE_PATH)]"
	cat $(K0SCTL_YAML_TEMPLATE_PATH) | $(ENVSUBST) > $(K0SCTL_YAML_PATH)
# Install k0s, quick & dirty
	@echo -e "=> Running k0sctl..."
	$(K0SCTL) -c $(K0SCTL_YAML_PATH)

deploy-rook:
	$(MAKE) -c k8s
