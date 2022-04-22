.PHONY: all generated-folder generate \
				ensure-tool-k0s \
				cluster kubeconfig \
				kubie

all: cluster kubeconfig

KUBIE ?= kubie
K0SCTL ?= k0sctl
ENVSUBST ?= envsubst

SECRETS_DIR ?= ../secrets
CLUSTER_SECRET_DIR ?= $(SECRETS_DIR)/k8s/cluster/$(ENVIRONMENT)

CTRL_0_PUBLIC_IP_PATH ?= $(CLUSTER_SECRET_DIR)/ctrl-0-public-ipv4Address
CTRL_0_PUBLIC_IP=$(shell cat $(CTRL_0_PUBLIC_IP_PATH))

CTRL_0_PRIVATE_IP_PATH ?= $(CLUSTER_SECRET_DIR)/ctrl-0-private-ipv4Address
CTRL_0_PRIVATE_IP=$(shell cat $(CTRL_0_PRIVATE_IP_PATH))

WORKER_0_PUBLIC_IP_PATH ?= $(CLUSTER_SECRET_DIR)/worker-0-public-ipv4Address
WORKER_0_PUBLIC_IP=$(shell cat $(WORKER_0_PUBLIC_IP_PATH))

WORKER_1_PUBLIC_IP_PATH ?= $(CLUSTER_SECRET_DIR)/worker-1-public-ipv4Address
WORKER_1_PUBLIC_IP=$(shell cat $(WORKER_1_PUBLIC_IP_PATH))

WORKER_2_PUBLIC_IP_PATH ?= $(CLUSTER_SECRET_DIR)/worker-2-public-ipv4Address
WORKER_2_PUBLIC_IP=$(shell cat $(WORKER_2_PUBLIC_IP_PATH))

GENERATED_FOLDER_PATH ?= generated

K0SCTL_YAML_TEMPLATE_PATH ?= k0sctl.yaml.pre
K0SCTL_GENERATED_DIR_PATH ?= generated
K0SCTL_YAML_PATH ?= $(K0SCTL_GENERATED_DIR_PATH)/k0sctl.yaml

KUBECONFIG_PATH ?= $(SECRETS_DIR)/k8s/cluster/admin.kubeconfig

## Create the generated folder
generated-folder:
	mkdir -p $(GENERATED_FOLDER_PATH)

## Generate the k0sctl YAML file
generate: generated-folder
	@echo -e "=> Generating k0sctl.yaml based on template @ [$(K0SCTL_YAML_TEMPLATE_PATH)]"
	export CTRL_0_PUBLIC_IP=$(CTRL_0_PUBLIC_IP) \
		&& export CTRL_0_PRIVATE_IP=$(CTRL_0_PRIVATE_IP) \
		&& export WORKER_0_PUBLIC_IP=$(WORKER_0_PUBLIC_IP) \
		&& export WORKER_1_PUBLIC_IP=$(WORKER_1_PUBLIC_IP) \
		&& export WORKER_2_PUBLIC_IP=$(WORKER_2_PUBLIC_IP) \
		&& cat $(K0SCTL_YAML_TEMPLATE_PATH) | $(ENVSUBST) > $(K0SCTL_YAML_PATH)

## Ensure k0sctl is installed
ensure-tool-k0sctl:
ifeq (,$(shell which $(K0SCTL)))
	$(error "k0sctl binary seems to be missing -- please install k0sctl (https://docs.k0sproject.io/head/k0sctl-install/)")
endif

## Create the cluster with k0sctl
cluster: ensure-tool-k0sctl generate
	$(K0SCTL) apply -c $(K0SCTL_YAML_PATH)

## Output the kubeconfig
kubeconfig: ensure-tool-k0sctl generate
	$(K0SCTL) kubeconfig > $(KUBECONFIG_PATH)

## Enter kubie shell environment
kubie:
ifeq (,$(PRE_KUBIE_WORKING_DIR))
	$(KUBIE) ctx -f $(KUBECONFIG_PATH)
else
	cd $(PRE_KUBIE_WORKING_DIR) && $(KUBIE) ctx -f $(KUBECONFIG_PATH)
endif
