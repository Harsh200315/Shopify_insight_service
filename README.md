
# Shopify Insights Dashboard

## Project Overview

Shopify Insights Dashboard is a multi-tenant web application designed to help Shopify store owners gain valuable insights into their customers and revenue. The system allows onboarding multiple Shopify stores (tenants), synchronizes customer and order data via Shopify API and webhooks, and presents aggregated metrics through a user-friendly dashboard.

The backend is built using Node.js, Express, and Prisma ORM connected to a PostgreSQL database hosted on Render. The frontend is a React application that fetches and displays insights securely per tenant.

---

## Features

- Tenant onboarding with Shopify store details and API keys
- Secure JWT authentication for API access
- Real-time ingestion of customers and orders via webhook endpoints
- Sync existing Shopify customers via Shopify API integration
- Dashboard displaying total customers, orders, and revenue for each tenant
- Hosted backend and database on Render cloud platform

---

## Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL database (Render-hosted recommended)
- Shopify store with API access token
- Git for cloning repository

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd shopify-insights
```

### 2. Backend Setup

```bash
cd backend
npm install
```

- Create a `.env` file in the `backend` folder with:

```
DATABASE_URL=postgresql://shopify_insights_user:your_password@dpg-d33v8tbuibrs73av58r0-a.singapore-postgres.render.com/shopify_insights
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

- Run Prisma migrations to set up database tables:

```bash
npx prisma migrate deploy
```

- Start backend server locally:

```bash
npm start
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

- Create a `.env` file in the frontend folder with:

```
REACT_APP_BACKEND_URL=http://localhost:3000
```

- Start frontend development server:

```bash
npm start
```

---

## Deployment

### Backend

- Deployed at:  
  `https://shopify-insight-service-backend1.onrender.com`

- Uses Render PostgreSQL as DB:  
  `postgresql://shopify_insights_user:your_password@dpg-d33v8tbuibrs73av58r0-a.singapore-postgres.render.com/shopify_insights`

### Frontend

- Deployed at:  
  `https://shopify-insight-service-1.onrender.com`

---

## Usage

### Tenant Onboarding

Make a POST request to `/onboard-tenant` with payload:

```json
{
  "name": "YourShopName",
  "shopifyUrl": "your-shop.myshopify.com",
  "apiKey": "shopify_api_key"
}
```

Example curl:

```bash
curl -X POST https://shopify-insight-service-backend1.onrender.com/onboard-tenant -H "Content-Type: application/json" -d '{"name":"StoreName", "shopifyUrl":"store.myshopify.com", "apiKey":"your_api_key"}'
```

### Sync Existing Customers

Trigger a full customers sync for a tenant:

```bash
curl -X POST https://shopify-insight-service-backend1.onrender.com/sync-customers/<tenantId>
```

### Webhooks

- `/webhook/customer` — POST customer data with `tenantid` header to ingest customer
- `/webhook/order` — POST order data with `tenantid` header to ingest order revenue

### Fetch Insights

Access insights data at:

```bash
GET https://shopify-insight-service-backend1.onrender.com/insights/<tenantId>
```

**###Place Order**
curl -X POST https://shopify-insight-service-backend1.onrender.com/webhook/order \
  -H "Content-Type: application/json" \
  -H "tenantid: <tenant_id>" \
  -d '{
    "id": "7001",
    "total_price": "250.75",
    "created_at": "2025-09-15T10:30:00Z",
    "customer": {"id": "5001"}
  }'

  **###Customer Creation**


curl -X POST https://shopify-insight-service-backend1.onrender.com/webhook/customer \
  -H "Content-Type: application/json" \
  -H "tenantid: b63e0dd0-0162-4e5d-b71b-5ff5f78e93e9" \
  -d '{
    "id": "500333",
    "name": "Jegdjhcvjhewn Doe",
    "email": "custejhvxehgwcxmer1@example.com",
    "spend": 10
  }'


  
With header:

```
Authorization: Bearer <JWT token>
```

---

## Technologies

- Backend: Node.js, Express, Prisma ORM, PostgreSQL
- Frontend: React.js
- Authentication: JWT tokens
- Hosting: Render.com

---

## Contributing

Contributions are welcome! Please fork the repo and create pull requests for enhancements or bug fixes.


---

## Contact

For questions or feedback, please contact: harshso763@gmail.com
