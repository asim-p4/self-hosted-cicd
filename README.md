# 🚀 Self-Hosted CI/CD Server

A production-ready CI/CD server built from scratch to automate deployments for frontend and backend applications.

## Features
- Secure GitHub webhook validation (HMAC-SHA256)
- Queue-based processing with duplicate detection
- Zero-downtime Rolling & Blue-Green deployments
- Automatic rollback on health check failure
- Multi-environment support (Testing & Production)
- GitHub commit status updates
- Email failure notifications
- Config-driven design for multiple projects

## Tech Stack
- Node.js, Express, AsyncLocalStorage
- AWS (EC2, S3, CloudFront)
- PM2, Bash, GitHub Webhooks

## Deployment Strategies
- **Frontend:** Blue-Green deployment via S3 + CloudFront
- **Backend:** Rolling deployment via EC2 + PM2
