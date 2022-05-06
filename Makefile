.PHONY: all \
				setup \
				secrets secret-folders secrets-generated clean-secrets-generated \
				deploy deploy-infra \
				destroy destroy-infra \
				deploy-pulumi destroy-pulumi \
				deploy-rook \
				test test-k8s-pgbench test-k8s-pgbench-reset \
				check-ENV-ENVIRONMENT \
				check-tool-kubectl check-tool-pulumi \
				k0s-generated-folder generate-k0s-yaml \
				ssh-add-keys ssh-ctrl0 ssh-worker0 ssh-worker1 ssh-worker2 \
				kubie

DOCKER ?= docker
KUBIE ?= kubie
KUBECTL ?= kubectl
KUSTOMIZE ?= kustomize
ENVSUBST ?= envsubst
K0SCTL ?= k0sctl
PULUMI ?= pulumi
SSH ?= ssh
SSH_KEYSCAN ?= ssh-keyscan
SSH_KEYGEN ?= ssh-keygen

# stock | nitro
ENVIRONMENT ?= stock

# Ceph On Nitro
PROJECT_NAME ?= con

K8S_NAMESPACE ?= con-$(ENVIRONMENT)

# Used for accessing machines after they've been provisioned
# (you shouldn't need to use this, but just in case!)
SSH_PUB_KEY_PATH ?= ~/.ssh/id_rsa.pub
SSH_PUB_KEY_ABS_PATH ?= $(realpath $(SSH_PUB_KEY_PATH))

CONTROLLER_USERDATA_PATH ?= $(realpath ./config/aws/ec2-controller-userdata.bash)
WORKER_USERDATA_PATH ?= $(realpath ./config/aws/ec2-worker-userdata.bash)

CLUSTER_OUTPUT_BASE_DIR_PATH ?= $(realpath ./secrets/k8s/cluster/)

# Where the k8s cluster will be stored
K8S_CLUSTER_SECRETS_FOLDER_PATH = ./secrets/k8s/cluster
K8S_CLUSTER_ADMIN_CONFIG_PATH = ./secrets/k8s/cluster/admin.conf

# What postgres image are we going to use for pgbench and the DB itself?
POSTGRES_IMAGE ?= postgres:14.2-alpine

all: setup deploy test

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

check-tool-kustomize:
ifeq (,$(shell which $(KUSTOMIZE)))
	$(error "ERROR: kustomize does not seem to be installed (https://kubernetes.io/docs/tasks/tools/)")
endif

check-tool-pulumi:
ifeq (,$(shell which $(PULUMI)))
	$(error "ERROR: pulumi does not seem to be installed (https://www.pulumi.com/docs/get-started/install/)")
endif

check-tool-k0sctl:
ifeq (,$(shell which $(K0SCTL)))
	$(error "ERROR: k0sctl does not seem to be installed (https://docs.k0sproject.io/v1.23.5+k0s.0/install/)")
endif

#####################
# Top level targets #
#####################

setup: check-tool-kubectl check-tool-pulumi check-tool-k0sctl check-tool-kustomize secrets

deploy: deploy-infra deploy-k0s deploy-rook
destroy: destroy-infra

test: test-k8s-pgbench

###########
# Secrets #
###########

PULUMI_SECRET_DIR ?= ./secrets/pulumi/$(ENVIRONMENT)
PULUMI_STATE_DIR ?= ./secrets/pulumi/state
PULUMI_ENCRYPTION_SECRET_PATH ?= $(PULUMI_SECRET_DIR)/encryption.secret

AWS_SECRET_DIR ?= ./secrets/aws/$(ENVIRONMENT)

CLUSTER_SECRET_DIR ?= ./secrets/k8s/cluster/$(ENVIRONMENT)

## List of secrets that can be randomly generated
RANDOMIZED_SECRET_PATHS ?= $(PULUMI_ENCRYPTION_SECRET_PATH)

secrets: secret-folders secrets-generated

secret-folders: check-ENV-ENVIRONMENT
# Cross environment secrets
	@mkdir -p $(PULUMI_SECRET_DIR)
	@mkdir -p $(PULUMI_STATE_DIR)
	@mkdir -p $(AWS_SECRET_DIR)
	@mkdir -p $(CLUSTER_SECRET_DIR)

secret-gen-random-alpha:
	@cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1 | tr -d \\n

secrets-generated: secret-folders
	@echo -e "[info] Generating known random-ok secrets..."
	@for SECRET_PATH in $(RANDOMIZED_SECRET_PATHS) ; do \
			[ -f $$SECRET_PATH ] && echo -e "[info] file @ [$$SECRET_PATH] already exists" && continue; \
			echo -e "[info] Generating random secret @ [$$SECRET_PATH]..."; \
			$(MAKE) -s --no-print-directory secret-gen-random-alpha > $$SECRET_PATH; \
	done

clean-secrets-generated:
	@echo -e "[info] Removing generated random-ok secrets..."
	@for SECRET_PATH in $(RANDOMIZED_SECRET_PATHS) ; do \
			[ ! -f $$SECRET_PATH ] && echo -e "[info] file @ [$$SECRET_PATH] does not exist" && continue; \
			echo -e "[info] removing random secret @ [$$SECRET_PATH]..."; \
			rm -rf $$SECRET_PATH; \
	done

##################
# Infrastructure #
##################

deploy-infra: deploy-pulumi ssh-add-keys
destroy-infra: destroy-pulumi

deploy-pulumi:
	@echo -e "=> Deploying infrastructure w/ pulumi..."
	@$(MAKE) -C pulumi FORCE=yes ENVIRONMENT=$(ENVIRONMENT)

destroy-pulumi:
	@echo -e "=> Deploying infrastructure w/ pulumi..."
	@$(MAKE) -C pulumi destroy FORCE=yes

##############
# Kubernetes #
##############

## Install k0s, quick & dirty
deploy-k0s:
	@echo -e "=> Deploying k0s..."
	$(MAKE) -C k0s

deploy-rook:
	@echo -e "=> Deploying cluster (rook)..."
	$(MAKE) -C k8s

test-k8s-pgbench:
	@echo -e "=> Running k8s pgbench tests..."
	$(MAKE) -C k8s pgbench

test-k8s-pgbench-reset:
	@echo -e "=> Resetting k8s pgbench tests..."
	$(MAKE) -C k8s pgbench-uninstall


###########
# Liveops #
###########

INSTANCE_USER ?= ubuntu

CTRL_0_PUBLIC_IP_PATH ?= $(CLUSTER_SECRET_DIR)/ctrl-0-public-ipv4Address
CTRL_0_PUBLIC_IP=$(file < $(CTRL_0_PUBLIC_IP_PATH))

WORKER_0_PUBLIC_IP_PATH ?= $(CLUSTER_SECRET_DIR)/worker-0-public-ipv4Address
WORKER_0_PUBLIC_IP=$(file < $(WORKER_0_PUBLIC_IP_PATH))

WORKER_1_PUBLIC_IP_PATH ?= $(CLUSTER_SECRET_DIR)/worker-1-public-ipv4Address
WORKER_1_PUBLIC_IP=$(file < $(WORKER_1_PUBLIC_IP_PATH))

WORKER_2_PUBLIC_IP_PATH ?= $(CLUSTER_SECRET_DIR)/worker-2-public-ipv4Address
WORKER_2_PUBLIC_IP=$(file < $(WORKER_2_PUBLIC_IP_PATH))

KUBECONFIG_PATH ?= $(CLUSTER_SECRET_DIR)/admin.kubeconfig

ssh-add-keys:
	@echo -e "=> Removing & re-adding ssh keys for all nodes to known_hosts..."
	@echo -e "=> Waiting for port 22 to be open on ctrl0 $(CTRL_0_PUBLIC_IP)"
	@sh -c 'until nc -vz ${CTRL_0_PUBLIC_IP} 22; do echo "Waiting for ctrl0..."; sleep 3; done;'
	$(SSH_KEYGEN) -R $(CTRL_0_PUBLIC_IP) || true
	$(SSH_KEYSCAN) -H $(CTRL_0_PUBLIC_IP) >> ~/.ssh/known_hosts

	@echo -e "=> Waiting for port 22 to be open on worker0 $(WORKER_0_PUBLIC_IP)"
	@sh -c 'until nc -vz ${WORKER_0_PUBLIC_IP} 22; do echo "Waiting for worker0..."; sleep 3; done;'
	$(SSH_KEYGEN) -R $(WORKER_0_PUBLIC_IP) || true
	$(SSH_KEYSCAN) -H $(WORKER_0_PUBLIC_IP) >> ~/.ssh/known_hosts

	@echo -e "=> Waiting for port 22 to be open on worker1 $(WORKER_1_PUBLIC_IP)"
	@sh -c 'until nc -vz ${WORKER_1_PUBLIC_IP} 22; do echo "Waiting for worker1..."; sleep 3; done;'
	$(SSH_KEYGEN) -R $(WORKER_1_PUBLIC_IP) || true
	$(SSH_KEYSCAN) -H $(WORKER_1_PUBLIC_IP) >> ~/.ssh/known_hosts

	@echo -e "=> Waiting for port 22 to be open on worker2 $(WORKER_2_PUBLIC_IP)"
	@sh -c 'until nc -vz ${WORKER_2_PUBLIC_IP} 22; do echo "Waiting for worker2..."; sleep 3; done;'
	$(SSH_KEYGEN) -R $(WORKER_2_PUBLIC_IP) || true
	$(SSH_KEYSCAN) -H $(WORKER_2_PUBLIC_IP) >> ~/.ssh/known_hosts

ssh-remove-keys:
	@echo -e "=> Adding ssh keys for all nodes to known_hosts..."
	$(SSH_KEYSCAN) -H $(CTRL_0_PUBLIC_IP) >> ~/.ssh/known_hosts
	$(SSH_KEYSCAN) -H $(WORKER_0_PUBLIC_IP) >> ~/.ssh/known_hosts
	$(SSH_KEYSCAN) -H $(WORKER_1_PUBLIC_IP) >> ~/.ssh/known_hosts
	$(SSH_KEYSCAN) -H $(WORKER_2_PUBLIC_IP) >> ~/.ssh/known_hosts

ssh-ctrl0:
	$(SSH) $(INSTANCE_USER)@$(CTRL_0_PUBLIC_IP)

ssh-worker0:
	$(SSH) $(INSTANCE_USER)@$(WORKER_0_PUBLIC_IP)

ssh-worker1:
	$(SSH) $(INSTANCE_USER)@$(WORKER_1_PUBLIC_IP)

ssh-worker2:
	$(SSH) $(INSTANCE_USER)@$(WORKER_2_PUBLIC_IP)

## Enter kubie shell environment
kubie:
ifeq (,$(PRE_KUBIE_WORKING_DIR))
	$(KUBIE) ctx -f $(KUBECONFIG_PATH)
else
	cd $(PRE_KUBIE_WORKING_DIR) && $(KUBIE) ctx -f $(KUBECONFIG_PATH)
endif
