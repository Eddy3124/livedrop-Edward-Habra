# Deployment Guide (Week 5)

1. Setup MongoDB Atlas
   - Create free cluster (M0)
   - Create database user and whitelist IPs (0.0.0.0/0 for dev)
   - Copy connection string and set `MONGODB_URI` in `apps/api/.env`

2. Backend
   - cd apps/api
   - npm install
   - create `.env` from `.env.example` and fill `MONGODB_URI` and `LLM_ENDPOINT`
   - npm run seed
   - npm run dev

3. Frontend
   - cd apps/storefront
   - npm install
   - set `VITE_API_URL` to backend URL (e.g. http://localhost:8080/api)
   - npm run dev

4. LLM endpoint
   - Add /generate endpoint to your Week 3 Colab as described in the Week5 assignment and set `LLM_ENDPOINT` in backend `.env`.
