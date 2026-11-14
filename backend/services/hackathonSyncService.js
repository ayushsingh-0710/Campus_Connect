import cron from "node-cron";
import Hackathon from "../models/Hackathon.js";
import { demoProvider } from "./providers/demoProvider.js";
import { brabbleProvider } from "./providers/brabbleProvider.js";
import { apishProvider } from "./providers/apishProvider.js";
import { ExternalHackathonProviderPlaceholder } from "./providers/externalProviderPlaceholder.js";

/**
 * HackathonSyncService
 * 
 * Orchestrates fetching, normalizing, validating, deduplicating,
 * and upserting hackathon records from registered providers into MongoDB.
 */

class HackathonSyncService {
  constructor() {
    this.providers = new Map();
    // Register demo provider by default
    this.registerProvider("demo", demoProvider);
    // Register live aggregator provider (Brabble.ai - Unstop, Devfolio, etc.)
    this.registerProvider("brabble", brabbleProvider);
    // Register secondary provider (API.SH - direct live Unstop feed)
    this.registerProvider("apish", apishProvider);

    // Register placeholder for other future external providers if configured
    const externalProviderName = process.env.HACKATHON_API_PROVIDER || "unstop";
    if (!this.providers.has(externalProviderName.toLowerCase())) {
      this.registerProvider(
        externalProviderName,
        new ExternalHackathonProviderPlaceholder(externalProviderName)
      );
    }

    this.lastSync = null;
    this.lastError = null;
    this.isSyncing = false;
    this.providerSyncInfo = {
      brabble: null,
      apish: null,
    };
  }

  /**
   * Register a new data provider adapter
   */
  registerProvider(name, providerInstance) {
    this.providers.set(name.toLowerCase(), providerInstance);
  }

  /**
   * Get registered provider by key
   */
  getProvider(name) {
    return this.providers.get(name.toLowerCase());
  }

  /**
   * Determine registration status dynamically based on current time
   */
  computeDynamicStatus(existingStatus, deadline, startDate) {
    const now = new Date();
    const regDeadline = new Date(deadline);

    if (now > regDeadline) {
      return "Closed";
    }

    const timeDiffDays = (regDeadline.getTime() - now.getTime()) / (1000 * 3600 * 24);
    if (timeDiffDays <= 3 && timeDiffDays >= 0) {
      return "Closing Soon";
    }

    if (startDate) {
      const start = new Date(startDate);
      if (start.getTime() - now.getTime() > 1000 * 3600 * 24 * 30) {
        return "Upcoming";
      }
    }

    return existingStatus || "Open";
  }

  /**
   * Ingest a batch of normalized records using atomic upsert (deduplication on source + sourceId)
   */
  async ingestBatch(items, sourceName) {
    const stats = {
      total: items.length,
      inserted: 0,
      updated: 0,
      duplicatesPrevented: 0,
      skipped: 0,
      errors: [],
    };

    for (const item of items) {
      try {
        const cleanId = String(item.sourceId || "").replace(/^unstop-/i, "");

        // Deduplication criteria: match by sourceId ("unstop-123" or "123"), or slug, or original registration URL
        const filter = {
          $or: [
            { sourceId: item.sourceId },
            { sourceId: `unstop-${cleanId}` },
            { sourceId: cleanId },
            { slug: item.slug },
          ],
        };

        if (item.registrationUrl) {
          filter.$or.push({ registrationUrl: item.registrationUrl });
          filter.$or.push({ sourceUrl: item.registrationUrl });
        }

        const existing = await Hackathon.findOne(filter);

        if (existing) {
          // Document already exists in MongoDB -> Enrich & update without duplicate creation
          const mergedUpdate = {
            lastSyncedAt: new Date(),
          };

          // Dynamic status adjustment
          mergedUpdate.status = this.computeDynamicStatus(
            existing.status || item.status,
            item.registrationDeadline || existing.registrationDeadline,
            existing.startDate || item.startDate
          );

          // Update registration deadline if incoming has valid newer date
          if (item.registrationDeadline && !isNaN(new Date(item.registrationDeadline).getTime())) {
            mergedUpdate.registrationDeadline = item.registrationDeadline;
          }

          // Merge technologies/skills (union without duplicate)
          if (Array.isArray(item.technologies) && item.technologies.length > 0) {
            mergedUpdate.technologies = Array.from(
              new Set([...(existing.technologies || []), ...item.technologies])
            );
          }

          // Merge categories (union without duplicate)
          if (Array.isArray(item.categories) && item.categories.length > 0) {
            mergedUpdate.categories = Array.from(
              new Set([...(existing.categories || []), ...item.categories])
            );
          }

          // Enrich registered student count
          if (item.registeredCount != null && item.registeredCount > (existing.registeredCount || 0)) {
            mergedUpdate.registeredCount = item.registeredCount;
          }

          // Preserve verified geographic details: never replace verified domestic/international with unknown or null
          if ((!existing.countryCode || existing.locationType === "unknown") && item.countryCode) {
            mergedUpdate.country = item.country;
            mergedUpdate.countryCode = item.countryCode;
            mergedUpdate.state = item.state;
            mergedUpdate.stateCode = item.stateCode;
            mergedUpdate.city = item.city;
            mergedUpdate.locationType = item.locationType;
            mergedUpdate.countryDetectionMethod = item.countryDetectionMethod;
          } else if (!existing.city && item.city) {
            mergedUpdate.city = item.city;
            if (!existing.state && item.state) {
              mergedUpdate.state = item.state;
              mergedUpdate.stateCode = item.stateCode;
            }
          }

          // Preserve prize pool: never replace with null
          if (!existing.prizePool?.amount && item.prizePool?.amount) {
            mergedUpdate.prizePool = item.prizePool;
          }

          // Enrich full description if existing was brief
          if ((!existing.fullDescription || existing.fullDescription.length < 50) && item.fullDescription) {
            mergedUpdate.fullDescription = item.fullDescription;
          }

          // Enrich logo if existing was empty
          if (!existing.logo && item.logo) {
            mergedUpdate.logo = item.logo;
          }

          // Preserve primary source attribution (keep "brabble" if already set, else sourceName)
          mergedUpdate.source = existing.source || (item.isDemo ? "demo" : sourceName);

          await Hackathon.findByIdAndUpdate(existing._id, { $set: mergedUpdate });
          stats.updated += 1;
          stats.duplicatesPrevented += 1;
        } else {
          // Document does not exist in MongoDB -> Insert brand new genuine listing
          const insertDoc = {
            ...item,
            source: item.isDemo ? "demo" : sourceName,
            status: this.computeDynamicStatus(
              item.status,
              item.registrationDeadline,
              item.startDate
            ),
            createdAt: new Date(),
            lastSyncedAt: new Date(),
          };

          await Hackathon.create(insertDoc);
          stats.inserted += 1;
        }
      } catch (err) {
        console.error(`[Sync Ingest Error] Failed to process "${item.title}":`, err.message);
        stats.errors.push({ title: item.title, error: err.message });
      }
    }

    return stats;
  }

  /**
   * Sync records from a specific provider
   * @param {string} providerName - Name of registered provider ('demo' or 'brabble')
   * @param {Object} options - Provider query options
   */
  async syncFromProvider(providerName = "brabble", options = {}) {
    if (this.isSyncing) {
      console.warn("[Sync Service] Synchronization is already in progress. Skipping concurrent request.");
      return { inProgress: true };
    }

    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error(`Provider "${providerName}" is not registered in HackathonSyncService`);
    }

    this.isSyncing = true;
    console.log(`[Sync Service] Starting sync for provider "${providerName}"...`);

    try {
      // If verifying connection first for Brabble
      if (providerName === "brabble" && typeof provider.verifyConnection === "function") {
        const verify = await provider.verifyConnection();
        if (!verify.success) {
          throw new Error(`Connection verification failed: ${verify.message}`);
        }
        console.log(`[Sync Service] Verification OK: ${verify.total} total hackathons available on ${providerName}.`);
      }

      const fetchResult = await provider.fetchHackathons(options);

      // Handle both object payload with listings array or direct array
      let rawRecords = [];
      let totalAvailable = 0;
      let attribution = "";
      let refreshedAt = null;

      if (Array.isArray(fetchResult)) {
        rawRecords = fetchResult;
        totalAvailable = fetchResult.length;
      } else if (fetchResult && Array.isArray(fetchResult.listings)) {
        rawRecords = fetchResult.listings;
        totalAvailable = fetchResult.total || rawRecords.length;
        attribution = fetchResult.attribution || "";
        refreshedAt = fetchResult.refreshedAt || null;
      }

      if (rawRecords.length === 0) {
        console.log(`[Sync Service] Provider "${providerName}" returned 0 listings.`);
        this.isSyncing = false;
        return { total: 0, inserted: 0, updated: 0, errors: [] };
      }

      const normalizedRecords = rawRecords.map((raw) =>
        provider.normalizeHackathonData(raw)
      );

      const stats = await this.ingestBatch(normalizedRecords, providerName);

      this.lastSync = {
        timestamp: new Date(),
        provider: providerName,
        totalAvailable,
        syncedCount: rawRecords.length,
        inserted: stats.inserted,
        updated: stats.updated,
        duplicatesPrevented: stats.duplicatesPrevented || 0,
        attribution,
        refreshedAt,
      };
      this.providerSyncInfo[providerName] = { ...this.lastSync };
      this.lastError = null;

      console.log(
        `[Sync Service] Finished sync for "${providerName}": Inserted: ${stats.inserted}, Updated: ${stats.updated}, Duplicates Prevented: ${stats.duplicatesPrevented || 0}, Errors: ${stats.errors.length}`
      );

      await this.refreshExpiredStatus();

      this.isSyncing = false;
      return {
        ...stats,
        totalAvailable,
        attribution,
        refreshedAt,
      };
    } catch (err) {
      this.isSyncing = false;
      this.lastError = {
        timestamp: new Date(),
        provider: providerName,
        message: err.message,
      };
      this.providerSyncInfo[providerName] = {
        timestamp: new Date(),
        provider: providerName,
        status: "failed",
        error: err.message,
      };
      console.error(`[Sync Service] Provider "${providerName}" sync failed:`, err.message);
      throw err;
    }
  }

  /**
   * Maintenance function: evaluate deadlines and update expired hackathons
   */
  async refreshExpiredStatus() {
    const now = new Date();
    const result = await Hackathon.updateMany(
      {
        registrationDeadline: { $lt: now },
        status: { $ne: "Closed" },
      },
      {
        $set: { status: "Closed", lastSyncedAt: now },
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`[Sync Service] Expired hackathons updated to Closed: ${result.modifiedCount}`);
    }
    return result.modifiedCount;
  }

  /**
   * Get telemetry info about the last synchronization run and registered providers
   */
  getLastSyncInfo() {
    const apishProviderInstance = this.getProvider("apish");
    return {
      lastSync: this.lastSync,
      lastError: this.lastError,
      isSyncing: this.isSyncing,
      providers: this.providerSyncInfo,
      apishTelemetry: typeof apishProviderInstance?.getTelemetry === "function"
        ? apishProviderInstance.getTelemetry()
        : null,
    };
  }

  /**
   * Initialize automated cron jobs:
   * 1. Brabble (Primary multi-platform aggregator): runs every 6 hours
   * 2. API.SH (Secondary Unstop direct feed): runs once daily at 3:00 AM (conserves free quota)
   */
  initScheduledSync() {
    if (process.env.HACKATHON_SYNC_ENABLED === "false") {
      console.log("[Sync Cron] Scheduled synchronization is disabled via HACKATHON_SYNC_ENABLED=false.");
      return;
    }

    console.log("[Sync Cron] Initializing periodic hackathon sync schedules (Brabble: every 6h, API.SH: daily 3am).");

    // Primary Provider (Brabble): Every 6 hours ("0 */6 * * *")
    cron.schedule("0 */6 * * *", async () => {
      console.log("[Sync Cron] Executing scheduled Brabble multi-platform synchronization...");
      try {
        if (process.env.HACKATHON_API_KEY) {
          await this.syncFromProvider("brabble", { limit: 200, fetchAll: true });
        }
        await this.refreshExpiredStatus();
      } catch (err) {
        console.error("[Sync Cron Error] Brabble scheduled sync encountered an error:", err.message);
      }
    });

    // Secondary Provider (API.SH Unstop feed): Once daily at 3:00 AM ("0 3 * * *")
    cron.schedule("0 3 * * *", async () => {
      console.log("[Sync Cron] Executing daily API.SH Unstop synchronization...");
      try {
        if (process.env.APISH_API_KEY) {
          await this.syncFromProvider("apish", { fetchAll: true, maxPages: 15 });
        }
        await this.refreshExpiredStatus();
      } catch (err) {
        console.error("[Sync Cron Error] API.SH scheduled sync encountered an error:", err.message);
      }
    });
  }
}

export const hackathonSyncService = new HackathonSyncService();
export default hackathonSyncService;
