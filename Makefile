.PHONY: all deploy test

all: deploy test

deploy: deploy-infra deploy-k0s deploy-rook

test: test-pgbench
