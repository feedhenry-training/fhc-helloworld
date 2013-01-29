APPGUID?="PLEASE_DEFINE"

all: clean deps test

test: 
	@env APPGUID=$(APPGUID) node fhctest.js

deps:
	npm install . 

clean: 
	rm -rf node_modules

.PHONY: test clean deps