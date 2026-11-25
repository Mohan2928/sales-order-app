# Domestic Sales Order – React + Spring Boot (Hibernate/JPA)

```
backend/   Spring Boot 3.3, Spring Data JPA (Hibernate), H2 (dev) / PostgreSQL, Java 21
frontend/  React 18 + Vite + React Router
```

## Run

Backend (http://localhost:8085)
```
cd backend
mvn spring-boot:run                                   # in-memory H2, sample masters auto-loaded
mvn spring-boot:run -Dspring-boot.run.profiles=postgres  # PostgreSQL, edit .properties
```

Frontend (http://localhost:5175, proxies /api to :8085)
```
cd frontend
npm install
npm run dev
```

## What is included
- Domestic Sales Order list: search by order no / buyer / quality, status tabs, actions
  (move to production, hold, reject, cancel, complete, resume)
- New Order form: all header fields + order detail lines (ADD DETAILS), mandatory-field checks,
  auto Basic Amount / Total Amount (GST % per line, default 5)
- Order view page
- Auto order number: `RM-D4/DGF/26-27/D-0001` (prefix in `app.order-no-prefix`)

## REST API
| Method | URL | Purpose |
|---|---|---|
| GET | /api/masters/lookups, /buyers, /qualities | dropdown data |
| POST | /api/masters/lookups, /buyers, /qualities | add master data |
| GET | /api/sales-orders?orderNo=&buyerId=&qualityId=&status= | list / search |
| GET | /api/sales-orders/{id} | one order with lines |
| POST | /api/sales-orders | create order (validated) |
| PUT | /api/sales-orders/{id}/status?value=ON_HOLD | change status |

## Next steps
Edit order, login/roles (Spring Security + JWT), master screens in the UI,
dispatch/proforma invoice, Flyway migrations instead of `ddl-auto=update`.
