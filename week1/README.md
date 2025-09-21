# LiveDrop System Design

**Assignment**: Flash-Sale & Follow Platform System Design  
**Author**: Edward Habra 
**Architecture Diagram**: https://excalidraw.com/#json=7k2Gkh8DH1GTPK-tE2_Uv,7H9ivH7MBCOstHdlDj9-CQ

## Overview

LiveDrop is a high-scale platform where creators can run limited-inventory flash sales (drops) to their followers. The system handles real-time notifications, prevents overselling, and scales to support celebrity creators with millions of followers while maintaining sub-200ms response times.

## Architecture Diagram

```
                                 ┌─────────────────┐
                                 │   Load Balancer │
                                 │   (CloudFlare)  │
                                 └─────────┬───────┘
                                           │
                                 ┌─────────▼───────┐
                                 │   API Gateway   │
                                 │  (Auth, Rate    │
                                 │   Limiting)     │
                                 └─────────┬───────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
          ┌─────────▼─────────┐  ┌─────────▼─────────┐  ┌─────────▼─────────┐
          │   User Service    │  │  Product Service  │  │   Order Service   │
          │                   │  │                   │  │                   │
          │ • Follow/Unfollow │  │ • Browse Products │  │ • Place Orders    │
          │ • User Profiles   │  │ • Drop Management │  │ • Inventory Mgmt  │
          │ • Authentication  │  │ • Search & Filter │  │ • Idempotency     │
          └─────────┬─────────┘  └─────────┬─────────┘  └─────────┬─────────┘
                    │                      │                      │
                    └──────────────────────┼──────────────────────┘
                                           │
                              ┌────────────▼────────────┐
                              │   Notification Service  │
                              │                         │
                              │  • WebSocket Manager    │
                              │  • Push Notifications   │
                              │  • Real-time Updates    │
                              └────────────┬────────────┘
                                           │
                              ┌────────────▼────────────┐
                              │      Message Queue      │
                              │      (Apache Kafka)     │
                              │                         │
                              │ Topics:                 │
                              │ • drop-events           │
                              │ • order-events          │
                              │ • stock-updates         │
                              └────────────┬────────────┘
                                           │
        ┌──────────────────────────────────▼──────────────────────────────────┐
        │                           Data Layer                                │
        │                                                                     │
        │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
        │  │   Primary   │  │ Read Replica│  │    Redis    │  │Elasticsearch│ │
        │  │ PostgreSQL  │  │ PostgreSQL  │  │   (Cache)   │  │  (Search)   │ │
        │  │             │  │             │  │             │  │             │ │
        │  │ • Users     │  │ • Browse    │  │ • Sessions  │  │ • Products  │ │
        │  │ • Orders    │  │ • Products  │  │ • Hot Data  │  │ • Creators  │ │
        │  │ • Follows   │  │ • Analytics │  │ • Locks     │  │ • Full Text │ │
        │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
        └─────────────────────────────────────────────────────────────────────┘
```

## Data Model Design

### Core Tables Structure

**Users & Creators**
- `users`: Basic user information with efficient indexing
- `creators`: Extended creator profiles with follower metrics
- `follows`: Relationship table with special partitioning for celebrities

**Products & Drops**
- `products`: Creator product catalog with JSON metadata
- `drops`: Time-bound sales events with stock tracking
- `orders`: Transaction records with idempotency keys

### Celebrity Scaling Strategy

For creators with millions of followers, we implement:
- **Partitioned follower tables** (16 shards)
- **Cursor-based pagination** instead of offset
- **Cached follower counts** separate from lists
- **Read replicas** for follower queries

```sql

CREATE TABLE celebrity_follows (
    id UUID PRIMARY KEY,
    user_id UUID,
    creator_id UUID,
    shard_key INTEGER,
    created_at TIMESTAMP
) PARTITION BY HASH (shard_key);
```

## API Design Philosophy

### GraphQL-First Approach
Single endpoint with flexible queries to minimize network calls:

```graphql
query GetDropPage($dropId: ID!) {
  drop(id: $dropId) {
    id
    startTime
    currentStock
    product {
      name
      price
      images
    }
    creator {
      displayName
      isFollowed
    }
  }
}
```

### RESTful Fallbacks
Traditional REST endpoints for simple operations:
- `POST /api/v1/orders` - Place order with idempotency
- `GET /api/v1/drops?status=live` - Browse active drops
- `POST /api/v1/follows` - Follow a creator

## Critical System Guarantees

### 1. No Overselling Protection

**Three-layer approach**:
1. **Database constraints**: Stock cannot go negative
2. **Distributed locks**: Redis-based inventory reservation
3. **Optimistic locking**: Version numbers on stock updates

```python

async def reserve_inventory(drop_id, quantity):
    async with redis.lock(f"inventory:{drop_id}", timeout=10):
        current = await get_current_stock(drop_id)
        if current >= quantity:
            await update_stock_atomic(drop_id, -quantity)
            return await create_reservation(drop_id, quantity)
        raise InsufficientStockError()
```

### 2. Order Idempotency

**Client-generated keys** with database uniqueness:
- Each order attempt has a unique idempotency key
- Duplicate keys return the existing order
- Prevents double-charging from retries/network issues

### 3. Real-Time Notifications

**Multi-channel delivery**:
- **WebSockets**: Primary real-time channel
- **Push notifications**: Mobile backup
- **Email**: Final fallback

**Celebrity fan-out strategy**:
- Small creators: Fan-out on write (immediate)
- Celebrity creators: Fan-out on read (batched processing)

## Caching Strategy

### Three-Tier Cache Architecture

1. **CDN Layer** (CloudFlare/AWS CloudFront)
   - Static assets, product images
   - 24h TTL with cache busting

2. **Application Cache** (Redis)
   - User sessions: 1h TTL
   - Product data: 5min TTL
   - Drop status: 30s TTL (critical for stock)
   - Creator profiles: 30min TTL

3. **Database Query Cache**
   - Prepared statements
   - Connection pooling

### Smart Invalidation

Event-driven cache invalidation ensures consistency:
```
Stock Update → Invalidate drop/{id} + product/{id}
New Follower → Invalidate user/following + creator/followers
Order Placed → Invalidate user/orders + drop/stock
```

## Performance Optimizations

### Database Level
- **Read replicas** for browse operations
- **Connection pooling** with PgBouncer
- **Partitioning** for large tables (follows, orders)
- **Materialized views** for analytics

### Application Level
- **DataLoader pattern** prevents N+1 queries
- **Circuit breakers** for external service failures
- **Background jobs** for non-critical operations
- **Compression** for large payloads

### Infrastructure Level
- **Auto-scaling** based on CPU/memory metrics
- **Health checks** with graceful degradation
- **Geographic distribution** for global latency

## Scaling Bottlenecks & Solutions

### Problem 1: Celebrity Creator Followers
**Issue**: Millions of followers create database hot spots
**Solution**: 
- Horizontal partitioning across 16 shards
- Cursor-based pagination
- Cached counts with periodic updates

### Problem 2: Flash Sale Traffic Spikes
**Issue**: Sudden 10x traffic when popular drops go live
**Solution**:
- Auto-scaling with pre-warming
- Circuit breakers prevent cascade failures
- Queue-based order processing

### Problem 3: Real-Time Notification Fan-Out
**Issue**: Notifying millions instantly is expensive
**Solution**:
- Kafka topics for reliable message delivery
- Batched processing for celebrity creators
- Multiple delivery channels (WebSocket, push, email)

## Security & Compliance

### Authentication & Authorization
- **JWT tokens** with short expiration + refresh
- **Role-based access control** (users, creators, admins)
- **API rate limiting** per user and IP

### Data Protection
- **Input validation** with strict schemas
- **SQL injection prevention** via parameterized queries
- **HTTPS only** with proper CORS configuration
- **PII encryption** for sensitive user data

## Monitoring & Observability

### Key Metrics Dashboard
- **Latency**: p50, p95, p99 for all endpoints
- **Throughput**: Requests per second by service
- **Cache hit ratios**: Redis and CDN performance
- **Stock accuracy**: Oversell prevention effectiveness
- **Notification delivery**: Success rates by channel

### Alerting Thresholds
- Order placement latency > 500ms
- Read query latency > 200ms
- Cache hit ratio < 80%
- WebSocket connection failures > 5%
- Database connection pool > 80% usage

## Deployment Strategy

### Infrastructure as Code
- **Docker containers** with multi-stage builds
- **Kubernetes** orchestration with auto-scaling
- **Terraform** for infrastructure provisioning
- **Blue-green deployments** for zero downtime

### Environment Progression
1. **Development**: Single instance, SQLite
2. **Staging**: Scaled-down production replica
3. **Production**: Full multi-region deployment

## Cost Optimization

### Resource Efficiency
- **Right-sizing** instances based on metrics
- **Spot instances** for batch processing
- **Reserved capacity** for predictable workloads
- **CDN costs** reduced through smart caching

### Estimated Monthly Costs (AWS)
- **Compute**: ~$2,000 (auto-scaling instances)
- **Database**: ~$1,500 (RDS with replicas)
- **Cache**: ~$500 (Redis clusters)
- **Storage**: ~$300 (S3, EBS)
- **Network**: ~$400 (CloudFront, data transfer)
- **Total**: ~$4,700/month for 500 RPS sustained

## Future Enhancements

### Phase 2 Features
- **Machine learning** for personalized product recommendations
- **Social features** like drop reviews and creator interactions
- **Analytics dashboard** for creators
- **Advanced search** with AI-powered filters

### Scalability Roadmap
- **Global expansion** with multi-region deployment
- **Microservice splitting** as team grows
- **Event sourcing** for complete audit trails
- **CQRS pattern** for read/write optimization

---

## Key Design Tradeoffs

| Decision | Benefit | Tradeoff |
|----------|---------|----------|
| PostgreSQL over NoSQL | ACID compliance, complex queries | Harder to scale writes |
| GraphQL + REST | Flexible queries, mobile-friendly | Learning curve, complexity |
| Event-driven architecture | Scalability, loose coupling | Eventual consistency |
| Multi-tier caching | Sub-200ms reads | Cache invalidation complexity |
| Partitioned follower data | Celebrity scale support | Query complexity |

This design successfully handles all requirements while maintaining strong consistency where needed (orders, inventory) and eventual consistency where acceptable (notifications, analytics).
