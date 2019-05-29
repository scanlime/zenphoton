
build:
	@cd html && ./build.sh

serve: build
	@cd html && python -mSimpleHTTPServer

