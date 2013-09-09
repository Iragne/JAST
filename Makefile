REPORTER = spec

test-api:
	@./node_modules/.bin/mocha \
	--reporter $(REPORTER) \
	--ui bdd \
	tests/api/*.js

test-pubsub:
	@./node_modules/.bin/mocha \
	--reporter $(REPORTER) \
	--ui tdd \
	tests/pubsub/*.js

test-all: test-api
test: test-all

.PHONY: test-all