# 5odead.github.io — Jekyll source

The complete Jekyll site lives in **`jekyll/`**.

## Deploy

Copy the **contents** of `jekyll/` into the root of your `5odead/5odead.github.io` repo and push. GitHub Pages will build it natively (no Actions needed).

```bash
cp -r jekyll/. /path/to/5odead.github.io/
cd /path/to/5odead.github.io
git add . && git commit -m "publish" && git push
```

## Local preview

```bash
cd jekyll
bundle install
bundle exec jekyll serve
```

Then visit http://127.0.0.1:4000.

## Why the subdirectory?

This Lovable workspace runs a TanStack/Vite preview, which would otherwise try to bundle the Jekyll `.css`/`.scss`/`.html` files and fail. Keeping Jekyll under `jekyll/` isolates it from the Vite build.
