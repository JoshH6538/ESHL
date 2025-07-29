# Equity Smart Home Loans Web App

A full-stack serverless mortgage platform featuring loan officer discovery, prequalification forms, and a built-in AI assistant. The system is powered by AWS, MongoDB, and Retool Workflows, with a fully static frontend deployed via GitHub Pages and delivered globally via CloudFront.

## Overview

Equity Smart Home Loans allows users to explore licensed loan officers, calculate estimated mortgage payments, and securely submit prequalification forms through a modern, public-facing web platform. The site combines static delivery with dynamic backend workflows and AI-assisted interactions.

- **Serverless Backend** using AWS Lambda and API Gateway
- **Three Retool Workflows** powering MongoDB access, form routing, and AI-assisted queries
- **Static Frontend** built with HTML, CSS, JavaScript, and SASS
- **Client-Side Filtering** for user search with local caching
- **RAG-Based AI Assistant** that understands natural language and responds using live backend data
- **Prequalification Forms** sent via Zapier Webhooks with reCAPTCHA v3 verification
- **Static Deployment** via GitHub Pages + AWS S3 and CloudFront for global delivery

## Architecture

Client (GitHub Pages / S3)  
↓  
CloudFront (CDN + HTTPS)  
↓  
API Gateway (Public Endpoint)  
↓  
Lambda (Secure Proxy)  
↓  
Retool Workflows (MongoDB / Form / AI)  
↓  
MongoDB and Zapier Webhook

## Key Features

- **Serverless and Modular**: Built with AWS Lambda and decoupled services
- **Secure Form Handling**: reCAPTCHA-protected prequalification sent to an external automation platform
- **AI Assistant Integration**: GPT-4o-mini assistant interprets user queries and returns safe, contextual results
- **Safe Public API Access**: All queries validated server-side with CORS and projection rules
- **Auto Deployment**: GitHub Actions deploy frontend to S3 and invalidate CloudFront cache automatically

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
