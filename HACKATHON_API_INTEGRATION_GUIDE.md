# Campus Connect — Hackathon API Integration Guide (Brabble.ai & Multi-Provider)

This guide documents the live **Brabble.ai Aggregator API** integration in **Campus Connect** and explains how the provider-independent synchronization architecture processes real hackathon listings from platforms like **Unstop**, **Devpost**, **Internshala**, **Hack Club**, and **Devfolio**.

---

## 1. Architectural Overview

```
                      +---------------------------------------+
                      |         Brabble Aggregator API        |
                      |   (Unstop, Devpost, Internshala, etc) |
                      +---------------------------------------+
                                          |
                                          v  [GET /api/listings?hub=hackathons]
                      +---------------------------------------+
                      |       BrabbleHackathonProvider        |
                      |   (Extends BaseHackathonProvider)     |
                      +---------------------------------------+
                                          |
                                          v  [normalizeHackathonData]
                      +---------------------------------------+
                      |        Canonical Normalization        |
                      |  (Mode, Deadlines, Prizes, Platforms) |
                      +---------------------------------------+
                                          |
                                          v  [Atomic Upsert by source + sourceId]
                      +---------------------------------------+
                      |       Validation & Deduplication      |
                      |         (MongoDB Compound Index)      |
                      +---------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |     MongoDB Hackathon Collection      |
                      |   (380+ Live Records + Demo Records)  |
                      +---------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |           Express REST APIs           |
                      |      (/api/hackathons, /sync/status)  |
                      +---------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |             React Frontend            |
                      |  (Search, Filters, Attribution, Auth) |
                      +---------------------------------------+
```

---

## 2. Environment Configuration

The backend environment file (`backend/.env`) securely configures Brabble API authentication:

```ini
# Server & Database Settings
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/campus_connect
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:8443

# Brabble API Aggregator Configuration
HACKATHON_API_PROVIDER=brabble
HACKATHON_API_BASE_URL=https://brabble.ai
HACKATHON_API_KEY=brbl_33c24e5b9673d3a9581866fe563959e01865048b84a4821efcbe8021d6e174ca
HACKATHON_SYNC_ENABLED=true
```

> **Security Guardrails**:
> - `backend/.env` is tracked in `.gitignore` and is never committed to GitHub.
> - The API key is used strictly server-side inside `brabbleProvider.js` and is never exposed in client bundles or API JSON responses.

---

## 3. Brabble API Integration Details

### Authentication & Endpoints
- **Base URL**: `https://brabble.ai`
- **Listings Endpoint**: `GET https://brabble.ai/api/listings`
- **Query Parameters**:
  - `hub=hackathons`
  - `limit=200` (max supported per request)
  - `offset=0` (pagination offset)
- **Header**: `Authorization: Bearer <HACKATHON_API_KEY>`

### Data Normalization Rules (`brabbleProvider.js`)

| Brabble API Field | Campus Connect Field | Transformation Logic |
| :--- | :--- | :--- |
| `id` | `sourceId` | Preserved as external unique ID (e.g. `unstop-1756262`) |
| `title` | `title` & `slug` | Slugified with sourceId suffix for URL uniqueness |
| `organiser` | `organizer` | Fallbacks to platform partner if blank |
| `platform` | `platform` | Identifies origin (e.g. `Unstop`, `Devpost`, `Internshala`) |
| `"brabble"` | `source` | Identifies provider architecture |
| `url` / `shareUrl` | `registrationUrl` | Direct external registration link for students |
| `mode` | `mode` | `ONLINE -> Online`, `HYBRID -> Hybrid`, `IN_PERSON -> Offline` |
| `city` | `location` | Set to actual city or `"Online / Virtual"`. Omitted if `"See listing"` |
| `deadline` | `registrationDeadline` | If `kind === "contest"`, deadline sets `startDate`. If `"competition"`, sets application deadline |
| `prize.inr` / `label` | `prizePool` | If `inr` is null, amount is `null` (never false ₹0); label displays `"Check official listing"` |
| `team` | `teamSize` | Parsed into min/max numbers and readable label (e.g. `1–4 Members`) |
| `eligibility` | `eligibility` | Formatted into readable criteria string |
| `false` | `isDemo` | Live imported listings have `isDemo: false` |

---

## 4. Scheduled & Manual Synchronization

### Automatic 6-Hour Background Sync
The backend initializes a `node-cron` job (`backend/services/hackathonSyncService.js`):
```javascript
// Runs every 6 hours (00:00, 06:00, 12:00, 18:00)
cron.schedule("0 */6 * * *", async () => {
  await hackathonSyncService.syncFromProvider("brabble", { limit: 200, fetchAll: true });
  await hackathonSyncService.refreshExpiredStatus();
});
```

### Manual Trigger CLI / Script
To trigger synchronization on demand:
```bash
cd "Campus_Connect/backend"
npm run seed
```

### Telemetry & Admin Endpoint
- **Status Check**: `GET /api/hackathons/sync/status`
  Returns last sync timestamp, total available listings, and synchronization health.
- **Protected Manual Sync**: `POST /api/hackathons/sync`
  Allows authorized administrative synchronization.

---

## 5. Adding Another External Provider in the Future

To add another provider (e.g. direct Unstop partner API or custom university endpoint):

1. **Subclass Base Provider**:
   Create `backend/services/providers/[providerName]Provider.js` extending `BaseHackathonProvider`.
2. **Implement Required Contract**:
   Implement `fetchHackathons()`, `fetchHackathonDetails()`, and `normalizeHackathonData()`.
3. **Register in Sync Service**:
   Import and register in `backend/services/hackathonSyncService.js`:
   ```javascript
   this.registerProvider("myprovider", new MyProvider());
   ```
4. **Zero Frontend Modifications Required**:
   The frontend automatically renders cards, platforms, filters, and details from MongoDB.
