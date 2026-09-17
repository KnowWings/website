# KnowWings Website

Official website repository for **KnowWings**.

KnowWings provides decision intelligence for R&D and innovation teams. We help organizations investigate emerging technologies, identify and validate suppliers and partners, access specialist expertise, and turn fragmented evidence into actionable intelligence.

## Website

🌐 https://knowwings.com

## Repository Structure

This repository contains the static website files and assets required to run the KnowWings website.

/
├── .github/             # GitHub Actions workflows
├── _next/               # Website CSS and JavaScript assets
├── index.html           # Homepage
├── about/               # About page
├── capabilities/        # What we do
├── how-we-work/         # How we work
├── industries/          # Who we help
├── contact/             # Contact page
├── 404.html             # Error page
├── robots.txt           # Search engine instructions
├── sitemap.xml          # Website sitemap
└── README.md

## Deployment

The website is connected to this GitHub repository and deployed through Cloudflare.

### Deployment Workflow

Local Website Files
        ↓
GitHub Repository
        ↓
Cloudflare
        ↓
knowwings.com

## Updating the Website

To update the website:

1. Make changes to the website files locally.
2. Open GitHub Desktop.
3. Review the changes.
4. Commit the changes to the `main` branch.
5. Push the changes to GitHub.
6. Cloudflare will deploy the latest version.

## Important

The `_next` folder contains important CSS and JavaScript assets required for the website's design and functionality.

**Do not delete, rename or modify this folder unless you understand the impact or are rebuilding the website.**

## About KnowWings

**Decision intelligence for R&D and innovation teams.**

KnowWings helps organizations:

- Investigate emerging technologies
- Identify strategic opportunities
- Find and evaluate suppliers and partners
- Access specialist expertise
- Validate technical and commercial claims
- Monitor critical technology landscapes

---

© 2026 KnowWings. All rights reserved.

## Build and publishing

Run `npm run build` to prepare `dist/`. Cloudflare publishes the site from GitHub. `npm run deploy` remains available for an authorized manual Cloudflare deployment. Netlify and Vercel preview configuration and the duplicate GitHub Pages workflow have been removed.
