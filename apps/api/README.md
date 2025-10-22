This is the backend API scaffold for the Week 5 assignment.

Setup:
1. Copy `.env.example` to `.env` and fill in `MONGODB_URI` and `LLM_ENDPOINT`.
2. npm install
3. npm run seed (optional) to populate sample data
4. npm run dev

Endpoints (basic):
- GET /api/products
- GET /api/products/:id
- POST /api/orders
- GET /api/orders/:id
- GET /api/orders/:id/stream  (SSE)
- GET /api/customers?email=
