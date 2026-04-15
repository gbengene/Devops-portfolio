# DevOps Portfolio

> Personal portfolio site with full CI/CD pipeline, containerised deployment, and live uptime monitoring.

## Tech Stack
| Layer      | Tool                   |
|------------|------------------------|
| Frontend   | Next.js 14 (App Router)|
| Backend    | Node.js / Express      |
| Containers | Docker + Compose       |
| Proxy      | Nginx                  |
| CI/CD      | GitHub Actions         |
| Hosting    | AWS EC2 + CloudFront   |
| TLS        | Let's Encrypt          |

## Quick start (local)
```bash
cp .env.example .env      # fill in your values
docker compose up --build
```
Open http://localhost — Nginx routes / to Next.js and /api to Express.

## CI/CD
Push to `main` triggers the GitHub Actions pipeline:
1. **Test** — lint + unit tests
2. **Build & push** — Docker images to Docker Hub
3. **Deploy** — SSH into EC2, pull latest images, restart containers

## Live demo
https://yourdomain.com  ← update this after deployment
