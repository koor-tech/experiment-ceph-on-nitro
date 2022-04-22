.PHONY: all generated-folder generate \
				ensure-tool-k0s \
				cluster

all: cluster

GENERATED_FOLDER_PATH ?= generated

K0SCTL ?= k0sctl

K0S_YAML_PRE_PATH ?= k0sctl.yaml.pre
K0S_YAML_PATH ?= $(GENERATED_FOLDER_PATH)/k0sctl.yaml

generated-folder:
	mkdir -p $(GENERATED_FOLDER_PATH)

generate: generated-folder
	$(ENVSUBST) < k0sctl.yaml.pre > $(K0S_YAML_PATH)

ensure-tool-k0sctl:
ifeq (,$(shell which $(K0SCTL)))
	$(error "k0sctl binary seems to be missing -- please install k0sctl (https://docs.k0sproject.io/head/k0sctl-install/)")
endif

cluster: ensure-tool-k0sctl generate
	$(K0SCTL) apply -c $(K0S_YAML_PATH)
