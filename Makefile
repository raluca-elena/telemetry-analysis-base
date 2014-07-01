REGISTRY ?= registry.taskcluster.net
INDEX ?= $(USER)

TARGET = $(REGISTRY)/$(INDEX)

all: base-image publish

base-image:
	docker build -t $(TARGET) .
publish:
	docker push $(TARGET)
