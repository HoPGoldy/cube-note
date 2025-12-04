# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

**cube-probe** is a full-stack Node.js application that combines a personal SSO (Single Sign-On) authentication platform with **API endpoint monitoring/probing capabilities**. It uses a monorepo architecture with pnpm workspaces.

### Core Features

1. **Authentication System**: JWT-based auth with WebAuthn (passkey) support
2. **API Probe Monitoring**: Schedule periodic HTTP probes to monitor endpoint health
3. **User Management**: Registration, roles (USER/ADMIN), banning/deletion
4. **Application Management**: Third-party app integration with access tokens
5. **File Attachments**: Upload/download with 512MB limit
6. **Notification System**: Alert notifications via multiple channels (Email, Webhook, etc.) when endpoints fail

## Tech Stack

### Backend (`packages/backend/`)

- **Framework**: Fastify 5.x with TypeBox validation
- **Database**: SQLite with Prisma ORM (schema at `prisma/schema.prisma`)
- **Authentication**: @fastify/jwt + @simplewebauthn/server
- **HTTP Client**: Axios (for probe requests)
- **Task Scheduling**: Node.js setInterval-based (IntervalProbeService)
- **API Docs**: Swagger (@fastify/swagger)

### Frontend (`packages/frontend/`)

- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: Ant Design V5
- **State Management**: Jotai
- **Data Fetching**: TanStack React Query
- **Routing**: React Router DOM v7
- **Charts**: ECharts

## Common Commands

```bash
# Install dependencies
pnpm install

# Initialize dev database (SQLite + migrations)
pnpm init:dev

# Start backend (default port from ENV_BACKEND_PORT)
pnpm start:backend

# Start frontend (port 3500)
pnpm start:frontend

# Linting
pnpm lint

# Open Prisma Studio
pnpm --filter backend start:db

# Build for production
pnpm --filter backend build
pnpm --filter frontend build
```

## Architecture

### Monorepo Structure

```
packages/
├── backend/    # Fastify API server
└── frontend/   # React admin dashboard
```

### Backend Architecture

**Entry Flow:**
`src/index.ts` → `src/app/build-app.ts` → `src/app/register-service.ts`

**Manual Dependency Injection Pattern:**
Services are instantiated first in `register-service.ts`, then passed to controllers.

**Key Modules (in `src/modules/`):**

- `user/` - User CRUD and authentication
- `auth/` - Login/logout, JWT token handling
- `webauthn/` - FIDO2 passkey credentials
- `attachment/` - File upload/download
- `application/` - Third-party app management
- `monitored-endpoint/` - Endpoint configuration (Service + EndPoint models)
- `monitored-result/` - Probe result storage
- `probe-task/` - **IntervalProbeService** - interval-based probe scheduler
- `probe-result-cleanup/` - Automated cleanup of old probe results
- `probe-stats-aggregation/` - Statistics aggregation service (hourly/daily stats, multi-range queries)
- `notification/` - **NotificationService** - alert notifications when probes fail
- `probe-env/` - **ProbeEnvService** - environment variables for CODE mode probes
- `app-config/` - Application configuration storage
- `code-executor/` - Code execution sandbox

**API Routes:** All prefixed with `/api`

### Database Models (Prisma)

**Authentication Models:**

- `User` - Core user with roles, banning, password hash
- `WebAuthnCredential` - FIDO2 credentials linked to users
- `Application` - Third-party apps with token keys

**Probe Monitoring Models:**

- `Service` - Service definition (name, base URL, default headers, intervalTime, notification settings)
- `EndPoint` - Endpoint config (URL, method, headers, intervalTime, timeout, bodyContent)
- `ProbeResult` - Probe execution results (status, responseTime, success, message)
- `ProbeHourlyStat` - Hourly aggregated statistics (avgResponseTime, successCount, failureCount, uptimePercentage)
- `ProbeDailyStat` - Daily aggregated statistics (same fields as hourly)

**Notification Models:**

- `NotificationChannel` - Notification channels (name, type: EMAIL/WEBHOOK/TELEGRAM, config JSON)
- `NotificationLog` - Notification history (hostId, channelId, status, message)

**Probe Environment Models:**

- `ProbeEnv` - Environment variables for CODE mode probes (key, value, isSecret, desc)

**Other Models:**

- `Attachment` - File metadata
- `AppConfig` - Key-value configuration

### Probe System Design

The probe system uses **interval-based scheduling** (not cron):

1. **Service**: Groups related endpoints with shared defaults (base URL, headers, interval)
2. **EndPoint**: Individual probe targets inheriting from Service
3. **IntervalProbeService**: Manages scheduled probes using `setInterval`
4. **ProbeResultCleanupService**: Periodic cleanup of old results
5. **ProbeStatsAggregationService**: Aggregates probe results into hourly/daily statistics

**Dual-Layer Enabled State Design:**

The system uses a two-layer enable/disable mechanism:

- `Service.enabled` - Service-level switch (master switch)
- `EndPoint.enabled` - Endpoint-level switch (individual switch)

**Only when both are enabled will the probe execute.**

Design rationale:

1. **Quick maintenance**: Disable an entire service with one click without touching individual endpoints
2. **Clear semantics**: `Service.enabled = false` means "pause monitoring for the entire service"
3. **Easy recovery**: When re-enabling a Service, each endpoint retains its original enabled state
4. **Dashboard display**: Service status is a simple binary state, no need to derive from child endpoints

Alternative considered (rejected):

- Remove `Service.enabled`, use batch enable/disable endpoints instead
- Rejected because: requires updating multiple records, introduces "partial enabled" state complexity, and loses the semantic clarity of "service-level pause"

**Statistics Aggregation:**

The system aggregates raw probe results into hourly and daily statistics for efficient querying:

- **ProbeHourlyStat**: Hourly aggregation (used for 24h queries)
- **ProbeDailyStat**: Daily aggregation (used for 30d/1y queries)

Multi-range stats API returns metrics for multiple time ranges in one call:

- `current`: Latest probe result (responseTime)
- `stats24h`: Last 24 hours (from hourly table)
- `stats30d`: Last 30 days (from daily table)
- `stats1y`: Last 1 year (from daily table)

Each stat includes: `avgResponseTime`, `successCount`, `failureCount`, `uptimePercentage`

**URL Resolution:**

- If `EndPoint.url` is absolute (starts with http/https), use directly
- If `EndPoint.url` is relative, concatenate with `Service.url`
- If `EndPoint.url` is empty, use `Service.url`

### Notification System Design

The notification system monitors probe results and sends alerts when endpoints fail.

**Architecture:**

1. **NotificationChannel**: Configures delivery methods (Email, Webhook, Telegram, etc.)
2. **Service-level Configuration**: Notification settings are stored directly on the Service model
3. **NotificationService**: Core service managing host status and sending alerts
4. **NotificationLog**: Records all sent notifications

**Service Notification Fields:**

- `notifyEnabled` - Whether notifications are enabled for this service
- `notifyFailureCount` - Consecutive failures threshold before alerting (default: 3)
- `notifyCooldownMin` - Cooldown period in minutes between notifications (default: 5)
- `notifyChannelIds` - JSON array of channel IDs to notify

**Host Status Management (In-Memory):**

The `NotificationService` maintains an in-memory `hostStatus` Map tracking each service's health:

```typescript
interface HostStatus {
  failedEndpoints: Map<string, { consecutiveFailures: number }>;
  currentStatus: "UP" | "DOWN";
  lastNotifiedAt: Date | null;
}
```

**Status Determination:**

- **DOWN**: Any endpoint under the service has consecutive failures >= `notifyFailureCount`
- **UP**: All endpoints have consecutive failures < threshold
- Status transitions trigger notifications (UP→DOWN sends failure alert, DOWN→UP sends recovery alert)

**Notification Flow:**

1. `IntervalProbeService` executes probe and saves result
2. Calls `NotificationService.processProbeResult(endpointId, success)`
3. Service updates `failedEndpoints` map for the endpoint
4. If status changes (UP↔DOWN), sends notification to configured channels
5. Respects cooldown period to prevent notification spam

**API Endpoints:**

- `GET /api/notification/channel/list` - List all channels
- `POST /api/notification/channel/add` - Create channel
- `POST /api/notification/channel/update` - Update channel
- `POST /api/notification/channel/delete` - Delete channel
- `GET /api/notification/log/list` - Query notification history
- `GET /api/notification/status/list` - Get all hosts' current status (from memory)

### Probe Environment Variables

The probe environment module provides global key-value storage that gets injected into CODE mode probes.

**API Endpoints:**

- `GET /api/probe-env/list` - List all environment variables (secrets show as `******`)
- `POST /api/probe-env/add` - Create environment variable
- `POST /api/probe-env/update` - Update environment variable
- `POST /api/probe-env/delete` - Delete environment variable

**Usage in CODE Probes:**

Environment variables are automatically injected as the `env` object:

```javascript
// Access environment variables in CODE mode probes
const apiKey = env.API_KEY;
const baseUrl = env.SERVICE_BASE_URL;

const response = await http.get(`${baseUrl}/health`, {
  headers: { Authorization: `Bearer ${apiKey}` },
});

return {
  result: {
    success: response.status === 200,
    message: `Status: ${response.status}`,
  },
};
```

**Key Features:**

- Variables with `isSecret=true` are hidden in the UI (displayed as `******`)
- Cached for 5 minutes to reduce database queries
- Naming convention: uppercase letters + underscores (e.g., `API_KEY`, `DB_PASSWORD`)
- Probes can update existing env vars by returning `{ result: {...}, env: {...} }`

**Updating Env from Probes:**

CODE probes can update existing environment variables by using the return format:

```javascript
return {
  result: { success: true, message: "Token refreshed" },
  env: { ACCESS_TOKEN: newToken }, // Only updates existing keys
};
```

Constraints:

- Can only update existing keys (new keys are skipped)
- Values must be strings, max 10,000 characters

### Frontend Architecture

**Page Structure (`src/pages/`):**

- `home/` - Main dashboard with notification status summary
- `probe-services/` - Service management
- `probe-endpoints/` - Endpoint management
- `probe-result/` - View probe results
- `probe-dashboard/` - Monitoring overview
- `monitored-host/` - Host monitoring
- `host-home/` - Host details with notification settings
- `notification-channel/` - Notification channel management
- `notification-log/` - Notification history
- `probe-env/` - Environment variables management
- `setting-user/` - User management (admin)
- `setting-application/` - App management
- `user-profile/` - Personal profile
- `login/`, `logout/` - Authentication pages

**Layout Components (`src/layouts/`):**

- `app-container/` - Main app shell
- `login-auth.tsx` - Auth guard
- `sidebar/` - Navigation menu
- `header/` - Top bar

## Configuration

### Environment Variables

Backend (`.env` or `.env.local` in `packages/backend/`):

- `BACKEND_JWT_SECRET` - JWT signing secret
- `ENV_BACKEND_PORT` - Server port (default varies)
- `FRONTEND_BASE_URL` - Base URL path for frontend deployment

### Database

- Location: `packages/backend/storage/dev.db` (SQLite)
- Migrations: `packages/backend/prisma/migrations/`

## Development Notes

1. **pnpm workspaces** - Always run from root or use `--filter` syntax
2. **Manual DI** - Services created in `register-service.ts`, passed to controllers
3. **Probe scheduler** starts automatically after controllers register (via `setImmediate`)
4. **Frontend port**: 3500, Backend port: configurable
5. **All API routes** under `/api` prefix
6. **File uploads** limited to 512MB

## Docker Deployment

```bash
# Build
docker build -t cube-probe .

# Run
docker run -d \
  --restart=always \
  -p 9736:3499 \
  -v cube-probe-storage:/app/packages/backend/storage \
  -e FRONTEND_BASE_URL=/cube-probe/ \
  -e BACKEND_JWT_SECRET=your-secret-here \
  cube-probe:latest
```

## Testing

```bash
# Run tests
pnpm --filter backend test

# Run tests with UI
pnpm --filter backend test:ui

# Run tests with coverage
pnpm --filter backend test:coverage
```

Test files are located alongside modules in `__tests__/` directories.
