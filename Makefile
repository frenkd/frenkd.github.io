.PHONY: serve build clean install

# Default target
serve:
	arch -arch x86_64 bundle exec jekyll serve

# Build the site
build:
	arch -arch x86_64 bundle exec jekyll build

# Clean up generated files
clean:
	rm -rf _site .jekyll-cache .sass-cache

# Install dependencies
install:
	bundle install

# Help command
help:
	@echo "Available commands:"
	@echo "  make serve    - Run Jekyll server (default)"
	@echo "  make build    - Build the site"
	@echo "  make clean    - Clean up generated files"
	@echo "  make install  - Install dependencies" 