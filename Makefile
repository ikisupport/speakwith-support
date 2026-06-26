-include .env
export

PORT     ?= 4200

.PHONY: install-deps start-local-support-website

install-deps:
	@test -d node_modules/.bin/ng || npm ci

# Angular dev server — open http://localhost:$(PORT)
start-local-support-website: install-deps
	npm start -- --port $(PORT)
