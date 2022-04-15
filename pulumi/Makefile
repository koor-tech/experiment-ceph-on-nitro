.PHONY: all deploy \
				check-ENV-ENVIRONMENT

PULUMI ?= pulumi
ENVIRONMENT ?= stock

check-ENV-ENVIRONMENT:
ifeq (,$(ENVIRONMENT))
	$(error "ENVIRONMENT not specified")
endif

all: deploy

deploy:
	$(PULUMI) apply
