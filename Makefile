TARGET?="PLEASE_DEFINE_TARGET"
USER?="PLEASE_DEFINE_USER"
PASSWORD?="PLEASE_DEFINE_PASSWORD"
APPGUID?="PLEASE_DEFINE_APPGUID"

all: clean deps test

test: deps
	@env APPGUID=$(APPGUID) TARGET=$(TARGET) USER=$(USER) PASSWORD=$(PASSWORD) node fhctest.js

deps:
	npm install . 

clean: 
	rm -rf node_modules

.PHONY: test clean deps