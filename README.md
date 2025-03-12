# Portfolio Website

A modern, minimal portfolio website built with Jekyll and TailwindCSS, designed to be hosted on GitHub Pages.

## Features

- Fully static and fast
- Responsive design with TailwindCSS
- Markdown-based content management
- Sections for Projects, Publications, and Appearances
- Blog support with optional Substack integration
- SEO-friendly with meta tags and OpenGraph support
- GitHub Pages ready with automated deployment

## Directory Structure

```
.
├── _appearances/    # Appearance posts
├── _layouts/       # Layout templates
├── _posts/         # Blog posts
├── _projects/      # Project posts
├── _publications/  # Publication posts
├── assets/         # Static assets
│   ├── images/     # Images and graphics
│   └── css/        # Custom CSS (if needed)
├── _config.yml     # Jekyll configuration
├── Gemfile        # Ruby dependencies
└── *.html         # Main pages
```

## Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/frenkd/portfolio.git
   cd portfolio
   ```

2. Install dependencies:
   ```bash
   bundle install
   ```

3. Update `_config.yml`:
   - Set your site's title and description
   - Update the URL and baseURL
   - Customize other settings as needed

4. Start the development server:
   ```bash
   bundle exec jekyll serve
   ```

5. Visit `http://localhost:4000` to see your site.

## Adding Content

### Projects

Create a new file in `_projects/` with the following format:

```markdown
---
layout: project
title: Project Name
description: Brief description
image: /assets/images/projects/image.jpg
technologies:
  - Tech1
  - Tech2
github: https://github.com/...
demo: https://demo.example.com
date: YYYY-MM-DD
---

Project content in Markdown...
```

### Publications

Create a new file in `_publications/` with:

```markdown
---
layout: publication
title: Publication Title
description: Brief description
authors:
  - Author 1
  - Author 2
publication: Journal Name
doi: DOI number
date: YYYY-MM-DD
---

Publication content in Markdown...
```

### Appearances

Create a new file in `_appearances/` with:

```markdown
---
layout: appearance
title: Appearance Title
description: Brief description
type: talk/podcast/interview
event: Event Name
location: Location
date: YYYY-MM-DD
video_url: https://...
slides_url: https://...
---

Appearance content in Markdown...
```

## Deployment

This site is configured to automatically deploy to GitHub Pages when you push to the main branch. To set it up:

1. Go to your repository settings
2. Navigate to "Pages"
3. Set the source to "GitHub Actions"
4. Push to the main branch to trigger deployment

## Custom Domain

To use a custom domain:

1. Add your domain in the repository settings under "Pages"
2. Create a `CNAME` file in the root directory with your domain
3. Update your DNS settings according to GitHub's documentation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE). 