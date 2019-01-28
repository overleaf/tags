# This file was auto-generated, do not edit it directly.
# Instead run bin/update_build_scripts from
# https://github.com/sharelatex/sharelatex-dev-environment
# Version: 1.1.10

BUILD_NUMBER ?= local
BRANCH_NAME ?= $(shell git rev-parse --abbrev-ref HEAD)
PROJECT_NAME = tags
DOCKER_COMPOSE_FLAGS ?= -f docker-compose.yml
DOCKER_COMPOSE := BUILD_NUMBER=$(BUILD_NUMBER) \
	BRANCH_NAME=$(BRANCH_NAME) \
	PROJECT_NAME=$(PROJECT_NAME) \
	MOCHA_GREP=${MOCHA_GREP} \
	docker-compose ${DOCKER_COMPOSE_FLAGS}


clean:
	docker rmi ci/$(PROJECT_NAME):$(BRANCH_NAME)-$(BUILD_NUMBER)
	docker rmi gcr.io/overleaf-ops/$(PROJECT_NAME):$(BRANCH_NAME)-$(BUILD_NUMBER)
	rm -f app.js
	rm -rf app/js
	rm -rf test/unit/js
	rm -rf test/acceptance/js

test: test_unit test_acceptance

test_unit:
	@[ ! -d test/unit ] && echo "tags has no unit tests" || $(DOCKER_COMPOSE) run --rm test_unit

test_acceptance: test_clean test_acceptance_pre_run # clear the database before each acceptance test run
	@[ ! -d test/acceptance ] && echo "tags has no acceptance tests" || $(DOCKER_COMPOSE) run --rm test_acceptance

test_clean:
	$(DOCKER_COMPOSE) down -v -t 0

test_acceptance_pre_run:
	@[ ! -f test/acceptance/scripts/pre-run ] && echo "tags has no pre acceptance tests task" || $(DOCKER_COMPOSE) run --rm test_acceptance test/acceptance/scripts/pre-run

build:
	docker build --pull --tag ci/$(PROJECT_NAME):$(BRANCH_NAME)-$(BUILD_NUMBER) \
		--tag gcr.io/overleaf-ops/$(PROJECT_NAME):$(BRANCH_NAME)-$(BUILD_NUMBER) \
		.

tar:
	IMAGE=ci/$(PROJECT_NAME):$(BRANCH_NAME)-$(BUILD_NUMBER)
	docker run $(IMAGE) tar -czf /tmp/${BUILD_NUMBER}.tar.gz --exclude=build.tar.gz --exclude-vcs .
	CONTAINER_ID=$(shell docker ps -a | grep ${IMAGE} | awk '{print $1}' | head -n 1)
	docker cp ${CONTAINER_ID}:/tmp/${BUILD_NUMBER}.tar.gz ./${BUILD_NUMBER}.tar.gz

publish:
	docker push $(DOCKER_REPO)/$(PROJECT_NAME):$(BRANCH_NAME)-$(BUILD_NUMBER)

.PHONY: clean test test_unit test_acceptance test_clean build publish
