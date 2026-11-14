import "dotenv/config";
import axios from "axios";
import { BaseHackathonProvider } from "./BaseHackathonProvider.js";
import { classifyLocation } from "../../utils/geographicData.js";

/**
 * ApishHackathonProvider
 * 
 * Secondary Provider Adapter for the API.SH Unstop API (https://api.api.sh).
 * Provides direct access to live, open hackathons hosted on Unstop.
 */
export class ApishHackathonProvider extends BaseHackathonProvider {
  constructor() {
    super("apish");
    const rawBase = process.env.APISH_BASE_URL || "https://api.api.sh";
    this.baseUrl = rawBase.replace(/\/+$/, "");
    this.apiKey = process.env.APISH_API_KEY || null;

    // Telemetry & Usage Monitoring
    this.telemetry = {
      requestsMade: 0,
      creditsConsumed: 0,
      lastSyncTimestamp: null,
      lastSyncStatus: "idle",
      lastSyncCount: 0,
      lastError: null,
      lastCreditsRemaining: null,
    };
  }

  getHeaders() {
    const key = this.apiKey || process.env.APISH_API_KEY;
    if (!key) {
      throw new Error(
        "APISH_API_KEY is missing in backend/.env. Please configure your API.SH key."
      );
    }
    return {
      "x-api-key": key,
      Accept: "application/json",
      "User-Agent": "CampusConnect-UniversityPlatform/1.0",
    };
  }

  /**
   * Diagnostic / Authentication Check:
   * Verifies API.SH endpoint with a single page request.
   */
  async verifyConnection() {
    const key = this.apiKey || process.env.APISH_API_KEY;
    if (!key) {
      return {
        success: false,
        status: 401,
        message: "APISH_API_KEY is not defined in backend/.env.",
      };
    }

    const testUrl = `${this.baseUrl}/unstop/v1/search`;
    try {
      this.telemetry.requestsMade += 1;
      const response = await axios.get(testUrl, {
        headers: this.getHeaders(),
        params: {
          type: "hackathons",
          status: "open",
          sort: "deadline",
          page: 1,
        },
        timeout: 10000,
      });

      if (response.status === 200) {
        const data = response.data;
        const items = data.items || data.data || [];
        const creditsRemaining = response.headers["x-credits-remaining"] || null;
        const creditsUsed = response.headers["x-credits-used"] || 1;

        this.telemetry.creditsConsumed += Number(creditsUsed);
        this.telemetry.lastCreditsRemaining = creditsRemaining;

        return {
          success: true,
          status: 200,
          total: data.total || items.length,
          count: items.length,
          page: data.page || 1,
          nextPage: data.next_page || null,
          creditsRemaining,
          creditsUsed: Number(creditsUsed),
          message: "API.SH connection successful. API key accepted.",
        };
      }

      return {
        success: false,
        status: response.status,
        message: `Unexpected HTTP status ${response.status}`,
      };
    } catch (err) {
      const status = err.response?.status || 0;
      const data = err.response?.data;
      this.telemetry.lastError = err.message;

      if (status === 401 || status === 403) {
        return {
          success: false,
          status,
          message: "Invalid or unauthorized API.SH key (HTTP " + status + ").",
          error: data,
        };
      }
      if (status === 429) {
        return {
          success: false,
          status: 429,
          message: "API.SH rate limit or monthly quota exhausted (HTTP 429).",
          error: data,
        };
      }

      return {
        success: false,
        status,
        message: `API.SH connection error: ${err.message}`,
        error: data,
      };
    }
  }

  /**
   * Fetch hackathons with pagination support.
   * Dynamically follows next_page up to maxPages ceiling to conserve free credits.
   */
  async fetchHackathons(options = {}) {
    const fetchAll = options.fetchAll !== false;
    const maxPages = options.maxPages || 15; // 15 pages * 15 = 225 items max (covers ~172 total)
    const startPage = options.page || 1;

    const url = `${this.baseUrl}/unstop/v1/search`;
    let allListings = [];
    let currentPage = startPage;
    let nextPage = currentPage;
    let totalAvailable = 0;
    let creditsThisRun = 0;
    let pagesFetchedCount = 0;

    try {
      while (nextPage && currentPage <= maxPages) {
        this.telemetry.requestsMade += 1;
        const response = await axios.get(url, {
          headers: this.getHeaders(),
          params: {
            type: "hackathons",
            status: "open",
            sort: "deadline",
            page: currentPage,
          },
          timeout: 15000,
        });

        const data = response.data;
        const items = data.items || data.data || [];
        totalAvailable = data.total || totalAvailable;
        const pageCredits = response.headers["x-credits-used"] || 1;
        creditsThisRun += Number(pageCredits);
        this.telemetry.creditsConsumed += Number(pageCredits);
        this.telemetry.lastCreditsRemaining = response.headers["x-credits-remaining"] || this.telemetry.lastCreditsRemaining;
        pagesFetchedCount += 1;

        if (items.length === 0) {
          break;
        }

        allListings = allListings.concat(items);

        // Check next page indicator
        nextPage = data.next_page || null;
        if (!fetchAll || !nextPage) {
          break;
        }
        currentPage++;
      }

      this.telemetry.lastSyncTimestamp = new Date();
      this.telemetry.lastSyncStatus = "success";
      this.telemetry.lastSyncCount = allListings.length;
      this.telemetry.lastError = null;

      return {
        listings: allListings,
        total: totalAvailable || allListings.length,
        count: allListings.length,
        pagesFetched: pagesFetchedCount,
        creditsConsumed: creditsThisRun,
        creditsRemaining: this.telemetry.lastCreditsRemaining,
      };
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message;
      this.telemetry.lastSyncStatus = "failed";
      this.telemetry.lastError = msg;
      throw new Error(`[ApishProvider] Failed to fetch Unstop hackathons (HTTP ${status || "ERR"}): ${msg}`);
    }
  }

  /**
   * Fetch single hackathon details by external ID
   */
  async fetchHackathonDetails(externalId) {
    const cleanId = String(externalId).replace(/^unstop-/i, "");
    const res = await this.fetchHackathons({ fetchAll: false, page: 1 });
    const found = res.listings.find((h) => String(h.id) === cleanId);
    if (!found) {
      throw new Error(`API.SH hackathon with ID ${cleanId} not found`);
    }
    return found;
  }

  /**
   * Infer skill categories
   */
  inferCategories(title, skills = []) {
    const t = (title + " " + skills.join(" ")).toLowerCase();
    const categories = [];

    if (t.includes("ai") || t.includes("artificial intelligence") || t.includes("agentic") || t.includes("gpt")) {
      categories.push("Artificial Intelligence");
    }
    if (t.includes("ml") || t.includes("machine learning") || t.includes("data") || t.includes("analytics")) {
      categories.push("Machine Learning");
    }
    if (t.includes("web") || t.includes("frontend") || t.includes("react") || t.includes("full stack") || t.includes("html") || t.includes("css")) {
      categories.push("Web Development");
    }
    if (t.includes("app") || t.includes("mobile") || t.includes("android") || t.includes("flutter")) {
      categories.push("App Development");
    }
    if (t.includes("blockchain") || t.includes("web3") || t.includes("crypto") || t.includes("solidity")) {
      categories.push("Blockchain");
    }
    if (t.includes("cyber") || t.includes("security") || t.includes("ctf") || t.includes("flag")) {
      categories.push("Cybersecurity");
    }
    if (t.includes("cloud") || t.includes("devops") || t.includes("aws") || t.includes("docker")) {
      categories.push("Cloud Computing");
    }
    if (t.includes("iot") || t.includes("hardware") || t.includes("robotics") || t.includes("sensor")) {
      categories.push("IoT");
    }

    if (categories.length === 0) {
      categories.push("Open Innovation");
    }
    return categories;
  }

  /**
   * Normalizes raw API.SH record into Campus Connect Hackathon schema
   */
  normalizeHackathonData(raw) {
    const rawNumericId = String(raw.id || raw.unstop_id || "");
    const sourceId = `unstop-${rawNumericId}`;
    const title = raw.title || "Unstop Hackathon";

    const cleanTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .substring(0, 55);
    // Canonical slug matching Brabble naming pattern for identical Unstop events
    const slug = `${cleanTitle}-${sourceId}`;

    const organizer =
      raw.organisation?.name ||
      raw.organisation ||
      raw.organization ||
      "Unstop Partner";

    // Skills & technologies
    const rawSkills = Array.isArray(raw.skills) ? raw.skills : [];
    const categories = this.inferCategories(title, rawSkills);
    const technologies = Array.from(new Set([
      ...rawSkills.slice(0, 8),
      ...(rawSkills.length === 0 ? ["Software Engineering", "Full-Stack"] : [])
    ]));

    // Mode determination
    let mode = "Online";
    const rawRegion = String(raw.region || "").toLowerCase();
    if (rawRegion === "offline" || rawRegion === "in_person") {
      mode = "Offline";
    } else if (rawRegion === "hybrid") {
      mode = "Hybrid";
    }

    // Location string
    let location = "";
    if (Array.isArray(raw.locations) && raw.locations.length > 0) {
      location = raw.locations.filter(Boolean).join(", ");
    } else if (raw.city && raw.city.toLowerCase() !== "remote" && raw.city.toLowerCase() !== "see listing") {
      location = raw.city.trim();
    } else if (mode === "Online") {
      location = "Online / Virtual";
    }

    // Eligibility formatting
    let eligibilityText = "Open to university students";
    if (Array.isArray(raw.eligibility) && raw.eligibility.length > 0) {
      const eligNames = raw.eligibility
        .map((e) => (typeof e === "object" ? e.name : e))
        .filter(Boolean);
      if (eligNames.length > 0) {
        eligibilityText = eligNames.join(", ");
      }
    }

    // Classify country, state, city using verified geographic rules
    const geo = classifyLocation({
      title,
      organizer,
      location,
      city: raw.city || location,
      eligibility: eligibilityText,
      platform: "Unstop",
    });

    // Dates
    const deadlineDate = raw.registration_end || raw.end_date
      ? new Date(raw.registration_end || raw.end_date)
      : new Date();
    const startDate = raw.registration_start ? new Date(raw.registration_start) : null;
    const endDate = raw.end_date ? new Date(raw.end_date) : null;

    // Team Size
    let teamSize = { min: 1, max: 4, label: "1–4 Members" };
    if (raw.team_size && typeof raw.team_size === "object") {
      const min = raw.team_size.min != null ? Number(raw.team_size.min) : 1;
      const max = raw.team_size.max != null ? Number(raw.team_size.max) : min;
      const label = min === max ? `${min} Member${min > 1 ? "s" : ""}` : `${min}–${max} Members`;
      teamSize = { min, max, label };
    }

    // Prize Pool
    let prizeAmount = null;
    let prizeLabel = "Check official listing";
    if (Array.isArray(raw.prizes) && raw.prizes.length > 0) {
      const firstPrize = raw.prizes[0];
      if (firstPrize?.cash != null) {
        prizeAmount = Number(firstPrize.cash);
        prizeLabel = `₹${prizeAmount.toLocaleString("en-IN")}`;
      } else if (firstPrize?.name) {
        prizeLabel = firstPrize.name;
      }
    }

    const unstopUrl = raw.url || raw.short_url || "";

    const normalized = {
      title,
      slug,
      organizer,
      description: raw.snippet
        ? raw.snippet.substring(0, 220).replace(/\n+/g, " ").trim()
        : `${title}. Hosted via Unstop by ${organizer}.`,
      fullDescription: raw.snippet
        ? `${title}\n\n${raw.snippet}\n\nPlatform: Unstop\nOrganizer: ${organizer}\nMode: ${mode}${
            location ? ` · Location: ${location}` : ""
          }\nEligible: ${eligibilityText}\n\nOfficial registration and submissions are hosted on Unstop.`
        : `${title}\n\nPlatform: Unstop\nOrganizer: ${organizer}\nMode: ${mode}\nEligible: ${eligibilityText}`,
      logo: raw.logo || raw.logoUrl2 || raw.organisation?.logoUrl || "",
      source: "apish",
      platform: "Unstop",
      kind: "competition",
      sourceId,
      sourceUrl: unstopUrl,
      shareUrl: raw.short_url || unstopUrl,
      registrationUrl: unstopUrl,
      mode,
      location,
      country: geo.country,
      countryCode: geo.countryCode,
      state: geo.state,
      stateCode: geo.stateCode,
      city: geo.city,
      locationType: geo.locationType,
      countryDetectionMethod: geo.countryDetectionMethod,
      categories,
      technologies,
      teamSize,
      prizePool: {
        amount: prizeAmount,
        currency: "INR",
        label: prizeLabel,
      },
      registeredCount: raw.registrations != null ? Number(raw.registrations) : null,
      registrationDeadline: deadlineDate,
      startDate,
      endDate,
      eligibility: eligibilityText,
      status: "Open", // Evaluated dynamically
      isFeatured: Boolean((raw.views && raw.views > 2000) || (prizeAmount && prizeAmount >= 50000)),
      isDemo: false,
      lastSyncedAt: new Date(),
    };

    this.validate(normalized);
    return normalized;
  }

  /**
   * Telemetry accessor
   */
  getTelemetry() {
    return {
      provider: "apish",
      ...this.telemetry,
    };
  }
}

export const apishProvider = new ApishHackathonProvider();
export default apishProvider;
