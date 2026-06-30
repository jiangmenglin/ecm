# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Electronic Component Management System (ECM - 电子元件管理系统). A full-stack application for managing electronic components throughout their lifecycle: cataloging, inventory tracking, inbound/outbound logistics, quality inspection, and alerting.

## Tech Stack

- **Backend**: Spring Boot 3.2.5, Java 17, Spring Data JPA, Spring Security + JWT (jjwt 0.12.5), MySQL, Lombok
- **Frontend**: React 18, TypeScript, Vite 5, Ant Design 5, Zustand (state), React Router 6, Axios, @ant-design/charts
- **Database**: MySQL (schema in `sql/init.sql`)

## Build & Run Commands

### Backend (from `backend/`)
```bash
./mvnw spring-boot:run          # Start backend on :9090
./mvnw clean package             # Build JAR
./mvnw test                      # Run tests
./mvnw test -Dtest=FooTest       # Run single test class
```

### Frontend (from `frontend/`)
```bash
npm run dev          # Start dev server on :80 (proxies /api to :9090)
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build
```

### Database
- MySQL must be running on `localhost:3306` with database `ecm_db`
- Initialize schema: `mysql -u root -p < sql/init.sql`
- Default credentials: root/root (see `application.yml`)

## Architecture

### Monorepo Structure
```
ecm/
├── backend/     # Spring Boot REST API
├── frontend/    # React SPA
└── sql/         # Database initialization scripts
```

### Backend Domain Modules (package: `com.ecm.*`)

Each business domain follows the same layered pattern: `controller/ → service/ → repository/` with `entity/` and `dto/` packages.

| Module | Package | Purpose |
|--------|---------|---------|
| Component | `com.ecm.component` | Component catalog, categories, parameters, substitutes |
| Inventory | `com.ecm.inventory` | Warehouses, storage locations, stock, batches, locks |
| Inbound | `com.ecm.inbound` | Purchase orders, inbound orders, IQC inspection, suppliers |
| Outbound | `com.ecm.outbound` | Outbound orders, BOM management |
| Alert | `com.ecm.alert` | Alert rules and records (low stock, expiry, etc.) |
| Report | `com.ecm.report` | Dashboard, turnover/stale reports, operation logs |
| System | `com.ecm.system` | Users, roles, authentication |
| Common | `com.ecm.common` | `Result<T>` wrapper, `PageResult<T>`, `PageRequest`, `BusinessException`, `GlobalExceptionHandler` |
| Config | `com.ecm.config` | CORS, JPA configuration |
| Security | `com.ecm.security` | JWT filter, token provider, Spring Security config |

### API Convention
- All responses wrapped in `Result<T>` with `{ code: 200, message: "success", data: T }`
- Paginated endpoints return `Result<PageResult<T>>` with `{ list, total, page, size }`
- API prefix: `/api` (configured via Vite proxy and Spring context path)
- Authentication: JWT Bearer token in Authorization header

### Frontend Architecture

- **Routing**: `src/router/index.tsx` — React Router with `ProtectedRoute` guard wrapping `MainLayout`
- **API layer**: `src/api/request.ts` (axios instance with interceptors) + `src/api/index.ts` (all endpoint functions)
- **State**: Zustand store in `src/store/auth.ts` for auth (token + user persisted in localStorage)
- **Types**: `src/types/index.ts` — all TypeScript interfaces shared across the app
- **Path alias**: `@/*` maps to `src/*` (configured in `tsconfig.json` and Vite)
- **Pages**: organized by domain under `src/pages/{domain}/`

### Database
- `sql/init.sql` — full DDL + seed data. Drops and recreates `ecm_db` on each run.
- JPA `ddl-auto` is set to `none` — schema managed by SQL scripts only.
