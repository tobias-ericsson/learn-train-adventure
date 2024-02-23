binary-name = energy-estimator
image-tag-name = powdrsoft/$(binary-name)
os = $(shell uname)
arch = $(shell uname -m)

help:
	@grep '^[^#[:space:]].*:' Makefile | sed 's/:.*//g'

clean:
	rm -f energy-estimator/$(binary-name)*
	@#need '|| true' to continue even if this command fails (because docker is not installed/started)
	docker rmi -f $(image-tag-name) 2> /dev/null || true 

run:
	python3 -m http.server 8000 --directory app

build:
	go build -o $(binary-name) ./energy-estimator

docker-build:
	docker buildx build --target builder --load -t $(image-tag-name) .

	@# The following lines extracts a runnable binary from the docker container.

	@docker rm -f $(binary-name) 2> /dev/null
	@docker create --name $(binary-name) $(image-tag-name)

	@if [ "$(os)" = "Darwin" ]; then\
		docker cp $(binary-name):$(binary-name)-darwin-$(arch) $(binary-name);\
	else\
		docker cp $(binary-name):$(binary-name) $(binary-name);\
	fi

	docker buildx build --target final --load -t $(image-tag-name) .
	docker images powdrsoft/energy-estimator

install:
	go install ./energy-estimator

test:
	go test -v ./energy-estimator

integration-test:
	integration-tests/test1.sh golang
	integration-tests/test2.sh golang
	integration-tests/test3.sh golang

binary-test:
	integration-tests/test1.sh binary
	integration-tests/test2.sh binary
	integration-tests/test3.sh binary

docker-test:
	integration-tests/test1.sh docker
	integration-tests/test2.sh docker
	integration-tests/test3.sh docker	

golang-all: clean test integration-test build binary-test

docker-all: clean docker-build docker-test

all: golang-all docker-all

.PHONY: clean run build docker-build install test integration-test binary-test docker-test golang-all docker-all all
