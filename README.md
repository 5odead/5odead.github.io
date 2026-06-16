# 5odead.github.io

Personal blog for CTF writeups, exploit walkthroughs, and security research — web, pwn, reversing, and more.

**Live site:** [5odead.github.io](https://5odead.github.io)

---

## Stack

- [Jekyll](https://jekyllrb.com/) — static site generator
- [GitHub Pages](https://pages.github.com/) — hosting
- [Giscus](https://giscus.app/) — comments via GitHub Discussions
- Custom CSS — no frameworks, no bloat

## Structure

```
_includes/     # header, footer, comments, hero
_layouts/      # default, post, home
_posts/        # writeups in markdown
assets/
  css/         # style.css
  js/          # copy-code.js
pages/         # about, search, 404
```

## Writing a post

Create a file in `_posts/` following the naming convention:

```
_posts/YYYY-MM-DD-title-here.md
```

Front matter:

```yaml
---
layout: post
title: "Post Title"
date: YYYY-MM-DD
description: "One line summary shown on the home page."
tags: [web, ctf, linux]
---
```

Then write the post body in Markdown below the front matter.

## Running locally

```bash
bundle install
bundle exec jekyll serve
```

Site will be available at `http://localhost:4000`.

## License

Posts © 5odead. All rights reserved.
