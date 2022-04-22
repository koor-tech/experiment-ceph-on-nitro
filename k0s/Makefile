.PHONY: all generated-folder generate \
				ensure-tool-k0s \
				cluster

all: cluster


K0SCTL ?= k0sctl
ENVSUBST ?= envsubst

SECRETS_DIR ?= ../secrets
CLUSTER_SECRET_DIR ?= $(SECRETS_DIR)/k8s/cluster/$(ENVIRONMENT)

CTRL_0_IP_PATH ?= $(CLUSTER_SECRET_DIR)/ctrl-0-ipv4Address
CTRL_0_IP=$(shell cat $(CTRL_0_IP_PATH))

WORKER_0_IP_PATH ?= $(CLUSTER_SECRET_DIR)/worker-0-ipv4Address
WORKER_0_IP=$(shell cat $(WORKER_0_IP_PATH))

WORKER_1_IP_PATH ?= $(CLUSTER_SECRET_DIR)/worker-1-ipv4Address
WORKER_1_IP=$(shell cat $(WORKER_1_IP_PATH))

WORKER_2_IP_PATH ?= $(CLUSTER_SECRET_DIR)/worker-2-ipv4Address
WORKER_2_IP=$(shell cat $(WORKER_2_IP_PATH))

GENERATED_FOLDER_PATH ?= generated

K0SCTL_YAML_TEMPLATE_PATH ?= k0sctl.yaml.pre
K0SCTL_GENERATED_DIR_PATH ?= generated
K0SCTL_YAML_PATH ?= $(K0SCTL_GENERATED_DIR_PATH)/k0sctl.yaml

generated-folder:
	mkdir -p $(GENERATED_FOLDER_PATH)

## Generate the k0sctl YAML file
generate: generated-folder
	@echo -e "=> Generating k0sctl.yaml based on template @ [$(K0SCTL_YAML_TEMPLATE_PATH)]"
	export CTRL_0_IP=$(CTRL_0_IP) \
		&& export WORKER_0_IP=$(WORKER_0_IP) \
		&& export WORKER_1_IP=$(WORKER_1_IP) \
		&& export WORKER_2_IP=$(WORKER_2_IP) \
		&& cat $(K0SCTL_YAML_TEMPLATE_PATH) | $(ENVSUBST) > $(K0SCTL_YAML_PATH)

ensure-tool-k0sctl:
ifeq (,$(shell which $(K0SCTL)))
	$(error "k0sctl binary seems to be missing -- please install k0sctl (https://docs.k0sproject.io/head/k0sctl-install/)")
endif

cluster: ensure-tool-k0sctl generate
	$(K0SCTL) apply -c $(K0SCTL_YAML_PATH)
