<div align="center">
  <img src="./logo.png" alt="Site Logo" height="96"/>
</div>

# Yiren Wang Personal Website

**English** · [中文](README_cn.md)

Personal academic/engineering homepage for **Yiren (Aaron) Wang** (Computer Engineering @ UIUC), built with Next.js and a content-driven structure.

![Website Preview](screenshot-v2.png)

## Attribution

This project is a personal fork and customization based on the open-source project **PRISM** by [xyjoey](https://github.com/xyjoey/PRISM).  
Core architecture and many foundational ideas come from the original project.  
I deeply appreciate the original author and contributors for making PRISM open-source.

## What's Customized in This Version

- Personal profile/content for Yiren Wang
- UI/UX adjustments for portfolio presentation
- Dedicated photography gallery with fullscreen viewer
- Projects/CV focused navigation and page structure
- Theme options including an added **Illini** color theme
- Bilingual content support (`content/` + `content_zh/`)

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- TOML / Markdown / BibTeX content pipeline

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Content Editing

Main editable directories:

- `content/` (default language content)
- `content_zh/` (Chinese content)
- `public/` (images, resume PDF, photography assets)

Common files:

- `content/config.toml` - site info and navigation
- `content/about.toml` + `content/bio.md` - About page
- `content/projects.toml` - Projects
- `content/photography.toml` - Photography gallery
- `content/cv.md` - CV page

## Build

```bash
npm run build
```

## License

This repository remains under the MIT License. See [LICENSE](LICENSE).
