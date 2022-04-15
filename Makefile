.PHONY: all test \
				deploy deploy-infra deploy-k8s deploy-rook \
				test test-k8s-pgbench \
				check-ENV-ENVIRONMENT \
				check-tool-kubectl check-tool-pulumi \
				k0s-generated-folder generate-k0s-yaml

DOCKER ?= docker
KUBECTL ?= kubectl
ENVSUBST ?= envsubst
K0SCTL ?= k0sctl
PULUMI ?= pulumi

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
K0SCTL_GENERATED_DIR_PATH ?= k0s/generated
K0SCTL_YAML_PATH ?= $(K0SCTL_GENERATED_DIR_PATH)/k0sctl.yaml

deploy-infra: deploy-pulumi

deploy-pulumi:
	@echo -e "=> Deploying pulumi..."
	@$(MAKE) -C pulumi

k0s-generated-folder:
	mkdir -p $(K0SCTL_GENERATED_DIR_PATH)

## Generate the k0sctl YAML file
generate-k0s-yaml: NODE_0_IP=$(read $(NODE_0_IP_EXPECTED_PATH))
generate-k0s-yaml: NODE_1_IP=$(read $(NODE_1_IP_EXPECTED_PATH))
generate-k0s-yaml: NODE_2_IP=$(read $(NODE_2_IP_EXPECTED_PATH))
generate-k0s-yaml: k0s-generated-folder
	@echo -e "=> Generating k0sctl.yaml based on template @ [$(K0SCTL_YAML_TEMPLATE_PATH)]"
	export NODE_0_IP=$(NODE_0_IP); \
		&& export NODE_1_IP=$(NODE_1_IP); \
		&& export NODE_2_IP=$(NODE_2_IP); \
		&& cat $(K0SCTL_YAML_TEMPLATE_PATH) | $(ENVSUBST) > $(K0SCTL_YAML_PATH)

## Install k0s, quick & dirty
deploy-k8s: generate-k0s-yaml
	@echo -e "=> Running k0sctl..."
	$(K0SCTL) -c $(K0SCTL_YAML_PATH)

## Deploy Rook
deploy-rook:
	@echo -e "=> Deploying rook to the cluster..."
	$(MAKE) -C k8s
