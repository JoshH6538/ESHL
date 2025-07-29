# Equity Smart Home Loans Web App

A full-stack serverless mortgage platform featuring loan officer discovery, prequalification forms, secure API integration, and fully static frontend deployment. Built with MongoDB, AWS, and Retool, and deployed via GitHub Pages + CloudFront.

## Overview

Equity Smart Home Loans enables dynamic search and display of loan officers and supports secure form submissions through a modern serverless web architecture:

- **Secure Serverless Backend** using AWS Lambda and API Gateway
- **Retool Workflows** powering MongoDB queries and external webhook integration
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
- **Prequalification Integration**: Submits form data to Zapier webhook with reCAPTCHA verification
- **CORS-Safe**: Controlled domain access for frontend API usage
- **Real-Time Filtering**: Frontend pulls and filters loan officer data locally
- **DevOps Ready**: GitHub Actions auto-deploys latest frontend build to AWS S3

## Frontend Structure

```bash
📁 HomeLoans/
├── css/
├── fonts/
├── images/
│   └── officer/, assets/, blog/, es/
├── js/
│   ├── calculator.js
│   ├── branch-data.js
│   ├── change-logo-on-scroll.js
│   ├── calculator.js
│   ├── chat-data.js
│   ├── contact.js
│   ├── display-los.js
│   ├── display-one-lo.js
│   ├── map.js
│   ├── preq.js
│   ├── production-routing.js
│   ├── user-data.js
│   └── theme.js
├── scss/
├── index.html
├── about.html
├── calculator.html
├── contact.html
├── loan-officers.html
├── loan-officer-details.html
├── preq.html
├── privacy.html
├── terms.html
└── 404.html
```

## Backend Components

- **Lambda Function**: Validates, routes, and securely proxies requests to Retool
- **Retool Workflows**:
  - **Loan Officer Workflow**: Fetch and return sanitized loan officer data
  - **Prequalification Workflow**: Relay form submissions to external automation platform
- **MongoDB**: Structured storage, managed via Retool

## Deployment

- **Frontend**: Deployed via GitHub Actions to S3, served via CloudFront w/ HTTPS
- **Backend**: Deployed on AWS Lambda, invoked via API Gateway POST /

## Security Notes

- All credentials stored in environment variables
- Public API access returns only sanitized, non-sensitive data
- CORS restricted to allowed origins (e.g., GitHub Pages)

## Resources

- [Retool Workflows Documentation](https://docs.retool.com/docs/workflows)
- [Zapier Webhooks](https://platform.zapier.com/docs/triggers)
- [AWS Lambda](https://docs.aws.amazon.com/lambda/)
- [AWS API Gateway](https://docs.aws.amazon.com/apigateway/)
