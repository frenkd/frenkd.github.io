# Frenk Dragar - Personal Website

This is the source code for my personal website, built with Jekyll.

## Setup Instructions

### Prerequisites

- Ruby (version 2.6.0 or higher)
- RubyGems
- Bundler
- Jekyll

### Local Development

1. Clone this repository:
   ```
   git clone https://github.com/frenkd/frenkd.github.io.git
   cd frenkd.github.io
   ```

2. Install dependencies:
   ```
   bundle install
   ```

3. Run the development server:
   ```
   bundle exec jekyll serve
   ```

4. Open your browser and visit: `http://localhost:4000`

### Working with x86_64 Ruby on Apple Silicon

If you're using an Apple Silicon Mac and encounter compatibility issues, use Rosetta:

```bash
arch -arch x86_64 bundle install
arch -arch x86_64 bundle exec jekyll serve
```

Alternatively, use the included Makefile:

```bash
make install  # Install dependencies
make serve    # Run the development server
```

## Managing Content

### Projects

Add new projects by creating Markdown files in the `_projects` directory with the following front matter:

```yaml
---
title: Project Name
role: Your Role
status: current  # or past
order: 1  # for ordering current projects
start_date: 2023-01-01  # for past projects
end_date: 2023-12-31    # for past projects
description: Brief description of the project
tags:
  - Tag1
  - Tag2
---
```

### Publications

Add new publications in the `_publications` directory:

```yaml
---
title: "Publication Title"
date: 2024-01-01
category: finance  # or other category
publication: Publication Name
description: "Brief description"
external_url: https://example.com/publication
---
```

### Podcast Episodes

Add new episodes in the `_episodes` directory:

```yaml
---
title: "Episode Title"
date: 2024-01-01
description: "Brief description"
image: /path/to/image.jpg
duration: "45:00"
episode_number: 1
spotify_url: https://spotify.com/...
apple_podcasts_url: https://apple.com/...
---
```

### Appearances

Add new appearances in the `_appearances` directory:

```yaml
---
title: "Appearance Name"
date: 2024-01-01
description: "Brief description"
location: "Location"
url: "https://example.com/event"
---
```

## Customization

- Edit `_config.yml` to change site-wide settings
- Modify files in `_layouts` to change the site structure
- Update styles in `assets/css/main.css`

## Substack Integration

The site integrates with Substack for blog content. Update the Substack URL in `_config.yml`:

```yaml
substack_url: "https://yourname.substack.com"
``` 