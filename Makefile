-include .env
export

# 4201 matches the speakwith-web pane in the `support-websites` tmux
# environment. Both support sites sit off Angular's default 4200 so a hand-run
# `ng serve` never collides with a pane.
PORT     ?= 4201

.PHONY: install-deps start-local-support-website

install-deps:
	@test -d node_modules/.bin/ng || npm ci

# Angular dev server — open http://localhost:$(PORT)
start-local-support-website: install-deps
	npm start -- --port $(PORT)
