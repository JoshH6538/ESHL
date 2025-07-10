# Equity Smart Real Estate Web App

A full-stack serverless real estate listing platform featuring realtor and IDX listing search, secure API integration, and fully static frontend deployment. Built with MongoDB, AWS, and Retool, and deployed via GitHub Pages + CloudFront.

## Overview

Equity Smart Real Estate (ESRE) enables dynamic search and display of realtors and property listings through a secure, modern web architecture:

- **Secure Serverless Backend** using AWS Lambda and API Gateway
- **Retool Workflows** powering MongoDB queries and API interaction
- **Public-Safe Frontend** hosted on GitHub Pages, using vanilla JS, HTML, CSS, and SASS
- **Fully Static Client** with client-side filtering and data caching
- **Cloud Distribution** via AWS S3 & CloudFront

## Architecture

Client (GitHub Pages / S3)
↓
CloudFront (CDN + HTTPS)
↓
API Gateway (Public Endpoint)
↓
Lambda (Secure Proxy)
↓
Retool Workflow (API Logic)
↓
MongoDB (Data Layer)

## Key Features

- **Serverless & Scalable**: No backend servers to maintain
- **Secure Data Flow**: API keys and credentials handled entirely server-side
- **IDX Integration**: Dynamic property data from Trestle RESO Web API via OAuth2
- **CORS-Safe**: Controlled domain access for frontend API usage
- **Real-Time Search**: Frontend pulls and filters listings locally
- **DevOps Ready**: GitHub Actions auto-deploys latest frontend build to AWS S3

## Frontend Structure

```bash
📁 RealEstate/
├── css/
├── fonts/
├── images/
│   └── agent/, assets/, blog/, es/
├── js/
│   ├── credentials.js
│   ├── display-realtors.js
│   ├── map-script.js
│   ├── api.js
│   └── theme.js
├── scss/
├── index.html
├── agent.html
├── agent_details.html
└── 404.html
```

## Backend Components

- **Lambda Function**: Validates, routes, and securely proxies requests to Retool
- **Retool Workflows**:
- **Realtors Workflow**: Fetch and return sanitized realtor data
- **IDX Workflow**: Authenticated access to Trestle API for live listing data
- **MongoDB**: Structured storage, managed via Retool

## Deployment

- **Frontend**: Deployed via GitHub Actions to S3, served via CloudFront w/ HTTPS
- **Backend**: Deployed on AWS Lambda, invoked via API Gateway POST /

## Security Notes

- All credentials stored in environment variables
- Public API access returns only sanitized, non-sensitive data
- CORS restricted to allowed origins (e.g., GitHub Pages)

## Resources

- [Retool Workflows Documentation](https://docs.retool.com/docs/workflows):
- [Trestle API Guide](https://docs.corelogic.com/display/Trestle)
- [AWS Lambda](https://docs.aws.amazon.com/lambda/)
- [AWS API Gateway](https://docs.aws.amazon.com/apigateway/)
