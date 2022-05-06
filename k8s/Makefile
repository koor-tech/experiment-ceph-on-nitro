.PHONY: all rook cluster \
				check-ENV-ENVIRONMENT \
				generated-folder generate \
				pgbench pgbench-uninstall \
				rook ns rook-crd rook-common rook-operator \
				rook-uninstall rook-operator-uninstall rook-common-uninstall rook-crd-uninstall \
				dashboard-port-forward get-dashboard-secret \
				toolbox toolbox-uninstall toolbox-bash

all: rook cluster

ENVIRONMENT ?= stock

KUBECONFIG ?= $(shell realpath ../secrets/k8s/cluster/$(ENVIRONMENT)/admin.kubeconfig)
KUBECTL ?= KUBECONFIG=$(KUBECONFIG) kubectl --request-timeout=30s

KUSTOMIZE_OPTS ?= --load-restrictor=LoadRestrictionsNone
KUSTOMIZE ?= kustomize $(KUSTOMIZE_OPTS)

KUSTOMIZE_DIR ?= ./overlays/$(ENVIRONMENT)
GENERATED_DIR ?= $(KUSTOMIZE_DIR)/generated

check-ENV-ENVIRONMENT:
ifeq (,$(ENVIRONMENT))
	$(error "ENVIRONMENT not specified")
endif

###########
# Tooling #
###########

generated-folder: check-ENV-ENVIRONMENT
	mkdir -p $(GENERATED_DIR)

generate: generated-folder
	$(KUSTOMIZE) build $(KUSTOMIZE_DIR) -o $(GENERATED_DIR)

########
# Rook #
########

rook: ns rook-crd rook-common rook-operator
rook-uninstall: rook-operator-uninstall rook-common-uninstall rook-crd-uninstall

ns: generate
	@$(KUBECTL) apply -f $(GENERATED_DIR)/v1_namespace_rook-ceph.yaml

rook-crd: generate
	@echo "=> Installing CRDs for rook..."
# NOTE: these resources are the result of generating from crds.yaml
# CRDs
	@$(KUBECTL) apply -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephblockpoolradosnamespaces.ceph.rook.io.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephblockpools.ceph.rook.io.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephbucketnotifications.ceph.rook.io.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephbuckettopics.ceph.rook.io.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephclients.ceph.rook.io.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephclusters.ceph.rook.io.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephfilesystemmirrors.ceph.rook.io.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephfilesystems.ceph.rook.io.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephfilesystemsubvolumegroups.ceph.rook.io.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephnfses.ceph.rook.io.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephobjectrealms.ceph.rook.io.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephobjectstores.ceph.rook.io.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephobjectstoreusers.ceph.rook.io.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephobjectzonegroups.ceph.rook.io.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephobjectzones.ceph.rook.io.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephrbdmirrors.ceph.rook.io.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_objectbucketclaims.objectbucket.io.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_objectbuckets.objectbucket.io.yaml

rook-crd-uninstall: generate
	@echo "=> Installing CRDs for rook..."
# NOTE: these resources are the result of generating from crds.yaml
# CRDs
	@$(KUBECTL) delete -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephblockpoolradosnamespaces.ceph.rook.io.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephblockpools.ceph.rook.io.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephbucketnotifications.ceph.rook.io.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephbuckettopics.ceph.rook.io.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephclients.ceph.rook.io.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephclusters.ceph.rook.io.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephfilesystemmirrors.ceph.rook.io.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephfilesystems.ceph.rook.io.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephfilesystemsubvolumegroups.ceph.rook.io.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephnfses.ceph.rook.io.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephobjectrealms.ceph.rook.io.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephobjectstores.ceph.rook.io.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephobjectstoreusers.ceph.rook.io.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephobjectzonegroups.ceph.rook.io.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephobjectzones.ceph.rook.io.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_cephrbdmirrors.ceph.rook.io.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_objectbucketclaims.objectbucket.io.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/apiextensions.k8s.io_v1_customresourcedefinition_objectbuckets.objectbucket.io.yaml || true


rook-common: generate
	@echo "=> Installing common resources for rook..."

# PSP
	@$(KUBECTL) apply -f $(GENERATED_DIR)/policy_v1beta1_podsecuritypolicy_00-rook-privileged.yaml

# Service accounts
	@$(KUBECTL) apply -f $(GENERATED_DIR)/v1_serviceaccount_rook-ceph-cmd-reporter.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/v1_serviceaccount_rook-ceph-mgr.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/v1_serviceaccount_rook-ceph-osd.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/v1_serviceaccount_rook-ceph-purge-osd.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/v1_serviceaccount_rook-ceph-rgw.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/v1_serviceaccount_rook-ceph-system.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/v1_serviceaccount_rook-csi-cephfs-plugin-sa.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/v1_serviceaccount_rook-csi-cephfs-provisioner-sa.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/v1_serviceaccount_rook-csi-rbd-plugin-sa.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/v1_serviceaccount_rook-csi-rbd-provisioner-sa.yaml

# RBAC - cluster roles & bindings
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_cephfs-csi-nodeplugin.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_cephfs-external-provisioner-runner.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_psp:rook.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_rbd-csi-nodeplugin.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_rbd-external-provisioner-runner.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_rook-ceph-cluster-mgmt.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_rook-ceph-global.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_rook-ceph-mgr-cluster.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_rook-ceph-mgr-system.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_rook-ceph-object-bucket.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_rook-ceph-osd.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_rook-ceph-system.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_cephfs-csi-nodeplugin.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_cephfs-csi-provisioner-role.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rbd-csi-nodeplugin.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rbd-csi-provisioner-role.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rook-ceph-global.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rook-ceph-mgr-cluster.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rook-ceph-object-bucket.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rook-ceph-osd.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rook-ceph-system-psp.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rook-ceph-system.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rook-csi-cephfs-plugin-sa-psp.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rook-csi-cephfs-provisioner-sa-psp.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rook-csi-rbd-plugin-sa-psp.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rook-csi-rbd-provisioner-sa-psp.yaml

# RBAC - roles and bindings
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_role_cephfs-external-provisioner-cfg.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_role_rbd-csi-nodeplugin.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_role_rbd-external-provisioner-cfg.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_role_rook-ceph-cmd-reporter.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_role_rook-ceph-mgr.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_role_rook-ceph-osd.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_role_rook-ceph-purge-osd.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_role_rook-ceph-rgw.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_role_rook-ceph-system.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_cephfs-csi-provisioner-role-cfg.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rbd-csi-nodeplugin-role-cfg.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rbd-csi-provisioner-role-cfg.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-cluster-mgmt.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-cmd-reporter-psp.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-cmd-reporter.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-default-psp.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-mgr-psp.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-mgr-system.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-mgr.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-osd-psp.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-osd.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-purge-osd.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-rgw.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-system.yaml

# Ceph block pool
	@$(KUBECTL) apply -f $(GENERATED_DIR)/ceph.rook.io_v1_cephblockpool_replicapool.yaml

# Storage classes
	@$(KUBECTL) apply -f $(GENERATED_DIR)/storage.k8s.io_v1_storageclass_rook-ceph-block.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/storage.k8s.io_v1_storageclass_rook-cephfs.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/storage.k8s.io_v1_storageclass_rook-nfs.yaml

rook-common-uninstall: generate
	@echo "=> Installing common resources for rook..."

# PSP
	@$(KUBECTL) delete -f $(GENERATED_DIR)/policy_v1beta1_podsecuritypolicy_00-rook-privileged.yaml || true

# Service accounts
	@$(KUBECTL) delete -f $(GENERATED_DIR)/v1_serviceaccount_rook-ceph-cmd-reporter.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/v1_serviceaccount_rook-ceph-mgr.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/v1_serviceaccount_rook-ceph-osd.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/v1_serviceaccount_rook-ceph-purge-osd.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/v1_serviceaccount_rook-ceph-rgw.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/v1_serviceaccount_rook-ceph-system.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/v1_serviceaccount_rook-csi-cephfs-plugin-sa.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/v1_serviceaccount_rook-csi-cephfs-provisioner-sa.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/v1_serviceaccount_rook-csi-rbd-plugin-sa.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/v1_serviceaccount_rook-csi-rbd-provisioner-sa.yaml || true

# RBAC - cluster roles & bindings
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_cephfs-csi-nodeplugin.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_cephfs-external-provisioner-runner.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_psp:rook.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_rbd-csi-nodeplugin.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_rbd-external-provisioner-runner.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_rook-ceph-cluster-mgmt.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_rook-ceph-global.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_rook-ceph-mgr-cluster.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_rook-ceph-mgr-system.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_rook-ceph-object-bucket.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_rook-ceph-osd.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrole_rook-ceph-system.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_cephfs-csi-nodeplugin.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_cephfs-csi-provisioner-role.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rbd-csi-nodeplugin.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rbd-csi-provisioner-role.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rook-ceph-global.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rook-ceph-mgr-cluster.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rook-ceph-object-bucket.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rook-ceph-osd.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rook-ceph-system-psp.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rook-ceph-system.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rook-csi-cephfs-plugin-sa-psp.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rook-csi-cephfs-provisioner-sa-psp.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rook-csi-rbd-plugin-sa-psp.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_clusterrolebinding_rook-csi-rbd-provisioner-sa-psp.yaml || true

# RBAC - roles and bindings
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_role_cephfs-external-provisioner-cfg.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_role_rbd-csi-nodeplugin.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_role_rbd-external-provisioner-cfg.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_role_rook-ceph-cmd-reporter.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_role_rook-ceph-mgr.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_role_rook-ceph-osd.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_role_rook-ceph-purge-osd.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_role_rook-ceph-rgw.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_role_rook-ceph-system.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_cephfs-csi-provisioner-role-cfg.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rbd-csi-nodeplugin-role-cfg.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rbd-csi-provisioner-role-cfg.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-cluster-mgmt.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-cmd-reporter-psp.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-cmd-reporter.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-default-psp.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-mgr-psp.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-mgr-system.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-mgr.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-osd-psp.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-osd.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-purge-osd.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-rgw.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/rbac.authorization.k8s.io_v1_rolebinding_rook-ceph-system.yaml || true

# Storage classes
	@$(KUBECTL) delete -f $(GENERATED_DIR)/storage.k8s.io_v1_storageclass_rook-ceph-block.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/storage.k8s.io_v1_storageclass_rook-cephfs.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/storage.k8s.io_v1_storageclass_rook-nfs.yaml || true

# Ceph block pool
	@$(KUBECTL) delete -f $(GENERATED_DIR)/ceph.rook.io_v1_cephblockpool_replicapool.yaml || true

rook-operator: generate
	@echo "=> Installing rook operator..."
	@$(KUBECTL) apply -f $(GENERATED_DIR)/v1_configmap_rook-ceph-operator-config.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/apps_v1_deployment_rook-ceph-operator.yaml

rook-operator-uninstall: generate
	@echo "=> Installing rook operator..."
	@$(KUBECTL) delete -f $(GENERATED_DIR)/v1_configmap_rook-ceph-operator-config.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/apps_v1_deployment_rook-ceph-operator.yaml || true

cluster: generate
	@echo "=> Installing rook cluster..."
	@$(KUBECTL) apply -f $(GENERATED_DIR)/ceph.rook.io_v1_cephcluster_rook-ceph.yaml
	@echo "=> Waiting 10 min for rook cluster init..."
	@sleep 600

cluster-uninstall: generate
	@echo "=> Uninstalling rook cluster..."
	@$(KUBECTL) delete -f $(GENERATED_DIR)/ceph.rook.io_v1_cephcluster_rook-ceph.yaml || true

#############
# Utilities #
#############

# username is 'admin'
get-dashboard-secret:
	$(KUBECTL) -n rook-ceph get secret rook-ceph-dashboard-password -o jsonpath="{['data']['password']}" | base64 --decode && echo

dashboard-port-forward: get-dashboard-secret
	$(KUBECTL) port-forward svc/rook-ceph-mgr-dashboard ':8443' -n rook-ceph

toolbox:
	$(KUBECTL) apply -f toolbox.deployment.yaml

toolbox-uninstall:
	$(KUBECTL) delete -f toolbox.deployment.yaml || true

toolbox-bash:
	kubectl -n rook-ceph exec -it deploy/rook-ceph-tools -- /bin/bash

###########
# pgbench #
###########

TEST_NAMESPACE ?= rook-ceph
TEST_JOB_NAME ?= pgbench

pgbench: generate
	@echo "=> Installing pgbench testbed..."
	@$(KUBECTL) apply -f $(GENERATED_DIR)/v1_configmap_pg.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/v1_persistentvolumeclaim_pg.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/apps_v1_deployment_postgres.yaml
	@$(KUBECTL) apply -f $(GENERATED_DIR)/v1_service_postgres.yaml
	@echo "=> Starting pgbench job..."
	@$(KUBECTL) apply -f $(GENERATED_DIR)/batch_v1_job_pgbench.yaml
	@echo "=> Waiting for pgbench job to start..."
	@bash -c 'until $(KUBECTL) get job $(TEST_JOB_NAME) -n $(TEST_NAMESPACE); do echo "Waiting for $(TEST_JOB_NAME) job..."; sleep 10; done;'
	@echo "=> Waiting for pgbench job to complete..."
	@$(KUBECTL) wait --for=condition=complete --timeout=30m job/pgbench
	@echo "=> Printing logs from job..."
	@$(KUBECTL) logs job/pgbench

pgbench-uninstall: generate
	@echo "=> Uninstalling pgbench testbed..."
	@$(KUBECTL) delete -f $(GENERATED_DIR)/batch_v1_job_pgbench.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/v1_service_postgres.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/apps_v1_deployment_postgres.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/v1_configmap_pg.yaml || true
	@$(KUBECTL) delete -f $(GENERATED_DIR)/v1_persistentvolumeclaim_pg.yaml || true
