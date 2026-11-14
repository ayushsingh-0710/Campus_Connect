import "dotenv/config";
import axios from "axios";
import { BaseHackathonProvider } from "./BaseHackathonProvider.js";
import { classifyLocation } from "../../utils/geographicData.js";

/**
 * BrabbleHackathonProvider
 * 
 * Production adapter for the Brabble.ai aggregator API (https://brabble.ai).
 * Aggregates real-time hackathon listings from Unstop, Internshala, Hack Club, Devfolio, etc.
 */
export class BrabbleHackathonProvider extends BaseHackathonProvider {
  constructor() {
    super("brabble");
    const rawBase = process.env.HACKATHON_API_BASE_URL || "https://brabble.ai";
    // Normalize base URL to remove trailing slash or /api if present
    this.baseUrl = rawBase.replace(/\/+$/, "").replace(/\/api$/, "");
    this.apiKey = process.env.HACKATHON_API_KEY || null;
  }

  getHeaders() {
    const key = this.apiKey || process.env.HACKATHON_API_KEY;
    if (!key) {
      throw new Error(
        "HACKATHON_API_KEY is missing in backend/.env. Please configure your Brabble API key."
      );
    }
    return {
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
      "User-Agent": "CampusConnect-UniversityPlatform/1.0",
    };
  }

  /**
   * Mandatory Verification Step:
   * Tests authentication and validates API contract before ingesting data.
   */
  async verifyConnection() {
    const key = this.apiKey || process.env.HACKATHON_API_KEY;
    if (!key) {
      return {
        success: false,
        status: 401,
        message: "HACKATHON_API_KEY is not defined in backend/.env.",
      };
    }

    const testUrl = `${this.baseUrl}/api/listings?hub=hackathons&limit=1`;
    try {
      const response = await axios.get(testUrl, {
        headers: this.getHeaders(),
        timeout: 10000,
      });

      if (response.status === 200) {
        const data = response.data;
        if (!Array.isArray(data.listings)) {
          return {
            success: false,
            status: 200,
            message: "Response did not contain a valid 'listings' array.",
          };
        }

        return {
          success: true,
          status: 200,
          total: data.total || 0,
          count: data.count || 0,
          refreshedAt: data.refreshedAt || null,
          attribution: data.attribution || "Powered by Brabble.ai",
          message: "Brabble API connection successful. API key accepted.",
        };
      }

      return {
        success: false,
        status: response.status,
        message: `Unexpected HTTP status ${response.status}`,
      };
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        if (status === 401) {
          return {
            success: false,
            status: 401,
            message: "Invalid or unauthorized Brabble API key (HTTP 401).",
            error: data,
          };
        }
        if (status === 429) {
          return {
            success: false,
            status: 429,
            message: "Brabble API daily rate limit exhausted (HTTP 429).",
            error: data,
          };
        }
        if (status === 400) {
          return {
            success: false,
            status: 400,
            message: "Invalid query parameters sent to Brabble API (HTTP 400).",
            error: data,
          };
        }
        return {
          success: false,
          status,
          message: `Brabble API error: HTTP ${status}`,
          error: data,
        };
      }

      return {
        success: false,
        status: 0,
        message: `Network or connection failure: ${err.message}`,
      };
    }
  }

  /**
   * Fetch hackathons with pagination support.
   * Supports limit (1-200), offset, and optional fetchAll flag.
   */
  async fetchHackathons(options = {}) {
    const limit = Math.min(200, Math.max(1, options.limit || 200));
    const offset = Math.max(0, options.offset || 0);

    if (options.fetchAll) {
      return await this.fetchAllHackathons(options);
    }

    const url = `${this.baseUrl}/api/listings`;
    const params = {
      hub: "hackathons",
      limit,
      offset,
    };

    try {
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        params,
        timeout: 15000,
      });

      const data = response.data;
      return {
        listings: data.listings || [],
        total: data.total || 0,
        count: data.count || 0,
        refreshedAt: data.refreshedAt || null,
        attribution: data.attribution || "Opportunity listings powered by Brabble.ai",
      };
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message;
      throw new Error(`[BrabbleProvider] Failed to fetch hackathons (HTTP ${status || "ERR"}): ${msg}`);
    }
  }

  /**
   * Paginates through all pages up to total or maxBatches safety ceiling.
   */
  async fetchAllHackathons(options = {}) {
    const batchSize = 200;
    let offset = 0;
    let allListings = [];
    let total = 0;
    let metadata = {};
    const maxBatches = options.maxBatches || 5; // Safety safeguard: max 1000 items

    for (let batch = 0; batch < maxBatches; batch++) {
      const result = await this.fetchHackathons({ limit: batchSize, offset });
      total = result.total;
      metadata = {
        refreshedAt: result.refreshedAt,
        attribution: result.attribution,
        total: result.total,
      };

      if (!result.listings || result.listings.length === 0) {
        break;
      }

      allListings = allListings.concat(result.listings);
      offset += result.listings.length;

      if (offset >= total || result.listings.length < batchSize) {
        break;
      }
    }

    return {
      listings: allListings,
      total,
      count: allListings.length,
      ...metadata,
    };
  }

  /**
   * Fetch single hackathon details by external ID
   */
  async fetchHackathonDetails(externalId) {
    const res = await this.fetchHackathons({ limit: 200 });
    const found = res.listings.find((h) => h.id === externalId);
    if (!found) {
      throw new Error(`Brabble hackathon with ID ${externalId} not found in current batch`);
    }
    return found;
  }

  inferCategories(title, raw) {
    const t = (title + " " + (raw.type || "") + " " + (raw.kind || "")).toLowerCase();
    const categories = [];

    if (t.includes("ai") || t.includes("artificial intelligence") || t.includes("genai") || t.includes("gpt")) {
      categories.push("Artificial Intelligence");
    }
    if (t.includes("ml") || t.includes("machine learning") || t.includes("data science") || t.includes("analytics")) {
      categories.push("Machine Learning");
    }
    if (t.includes("web") || t.includes("frontend") || t.includes("full stack") || t.includes("fullstack") || t.includes("react")) {
      categories.push("Web Development");
    }
    if (t.includes("app") || t.includes("mobile") || t.includes("android") || t.includes("ios") || t.includes("flutter")) {
      categories.push("App Development");
    }
    if (t.includes("blockchain") || t.includes("web3") || t.includes("crypto") || t.includes("solidity") || t.includes("eth")) {
      categories.push("Blockchain");
    }
    if (t.includes("cyber") || t.includes("security") || t.includes("ctf") || t.includes("defense")) {
      categories.push("Cybersecurity");
    }
    if (t.includes("cloud") || t.includes("devops") || t.includes("aws") || t.includes("docker") || t.includes("kubernetes")) {
      categories.push("Cloud Computing");
    }
    if (t.includes("iot") || t.includes("hardware") || t.includes("robotics") || t.includes("embedded") || t.includes("sensor")) {
      categories.push("IoT");
    }

    if (categories.length === 0) {
      categories.push("Open Innovation");
    }
    return categories;
  }

  inferTechnologies(title) {
    const t = title.toLowerCase();
    const tech = [];
    if (t.includes("python") || t.includes("ai") || t.includes("ml")) tech.push("Python");
    if (t.includes("react") || t.includes("web")) tech.push("React", "JavaScript");
    if (t.includes("node") || t.includes("backend")) tech.push("Node.js");
    if (t.includes("blockchain") || t.includes("web3") || t.includes("crypto")) tech.push("Solidity", "Web3");
    if (t.includes("flutter") || t.includes("mobile") || t.includes("app")) tech.push("Flutter", "Mobile SDK");
    if (t.includes("cloud") || t.includes("devops")) tech.push("Docker", "Cloud APIs");
    if (t.includes("iot") || t.includes("robotics")) tech.push("Hardware / Embedded");
    if (tech.length === 0) tech.push("Software Engineering", "Full-Stack");
    return tech;
  }

  parseTeamSize(teamString) {
    if (!teamString || typeof teamString !== "string" || teamString.toLowerCase() === "see listing") {
      return { min: 1, max: 4, label: "Check listing" };
    }

    const clean = teamString.trim();
    if (clean.toLowerCase() === "individual" || clean === "1") {
      return { min: 1, max: 1, label: "Individual" };
    }

    const rangeMatch = clean.match(/(\d+)\s*(?:to|-)\s*(\d+)/i);
    if (rangeMatch) {
      return {
        min: parseInt(rangeMatch[1], 10),
        max: parseInt(rangeMatch[2], 10),
        label: `${rangeMatch[1]}–${rangeMatch[2]} Members`,
      };
    }

    const singleMatch = clean.match(/(\d+)/);
    if (singleMatch) {
      const num = parseInt(singleMatch[1], 10);
      return { min: 1, max: num, label: `Up to ${num} Members` };
    }

    return { min: 1, max: 4, label: clean };
  }

  /**
   * Normalizes raw Brabble listing into Campus Connect's Hackathon schema
   */
  normalizeHackathonData(raw) {
    const title = raw.title || "Hackathon Challenge";
    const cleanTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .substring(0, 55);
    const slug = `${cleanTitle}-${raw.id}`;

    const categories = this.inferCategories(title, raw);
    const technologies = this.inferTechnologies(title);
    const teamSize = this.parseTeamSize(raw.team);

    // Mode conversion: ONLINE -> Online, OFFLINE -> Offline, HYBRID -> Hybrid
    let mode = "Online";
    const rawMode = (raw.mode || "").toUpperCase();
    if (rawMode === "ONLINE") mode = "Online";
    else if (rawMode === "HYBRID") mode = "Hybrid";
    else if (rawMode === "OFFLINE" || rawMode === "IN_PERSON") mode = "Offline";

    // Location: Do not invent or display "See listing" / "Remote" as confirmed physical city
    let location = "";
    if (raw.city && raw.city.toLowerCase() !== "see listing" && raw.city.toLowerCase() !== "remote") {
      location = raw.city.trim();
    } else if (mode === "Online") {
      location = "Online / Virtual";
    }

    // Deadlines & Event Dates:
    // If kind === "contest", deadline means event start date.
    // If kind === "competition", deadline means application closing date.
    // Never invent event dates. If unavailable, store null.
    const deadlineDate = raw.deadline ? new Date(raw.deadline) : new Date();
    let registrationDeadline = deadlineDate;
    let startDate = null;
    let endDate = null;

    if (raw.kind === "contest") {
      startDate = deadlineDate;
      registrationDeadline = deadlineDate;
    }

    // Prize Pool handling:
    // If prize.inr is null, amount = null (never ₹0).
    // If prize.label says "See listing", display "Check official listing".
    let prizeAmount = null;
    if (raw.prize && raw.prize.inr != null && !isNaN(Number(raw.prize.inr))) {
      prizeAmount = Number(raw.prize.inr);
    }

    let prizeLabel = "Check official listing";
    if (raw.prize?.label && raw.prize.label.toLowerCase() !== "see listing") {
      prizeLabel = raw.prize.label;
    } else if (prizeAmount && prizeAmount > 0) {
      prizeLabel = `₹${prizeAmount.toLocaleString("en-IN")}`;
    }

    const platform = raw.platform || "Unstop";
    const organizer = raw.organiser || `${platform} Partner`;

    const eligibilityText = Array.isArray(raw.eligibility) && raw.eligibility.length > 0
      ? raw.eligibility.join(", ")
      : "Open to college students";

    // Classify country, state, and city using verified geographic evidence
    const geo = classifyLocation({
      title,
      organizer,
      city: raw.city,
      location,
      eligibility: eligibilityText,
      platform,
    });

    const normalized = {
      title,
      slug,
      organizer,
      description: `${title}. Hosted via ${platform} by ${organizer}.`,
      fullDescription: `${title}\n\nPlatform: ${platform}\nOrganizer: ${organizer}\nMode: ${mode}${
        location ? ` · Location: ${location}` : ""
      }\nFee: ${raw.fee || "Free"}\nEligible: ${eligibilityText}\n\nOfficial registration and submissions are hosted on ${platform}. Click "Register Now" below to register directly on the host website.`,
      logo: "",
      source: "brabble",
      platform,
      kind: raw.kind || "competition",
      sourceId: String(raw.id),
      sourceUrl: raw.url || raw.shareUrl || "",
      shareUrl: raw.shareUrl || "",
      registrationUrl: raw.url || raw.shareUrl || "",
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
      registeredCount: raw.registered != null ? Number(raw.registered) : null,
      registrationDeadline,
      startDate,
      endDate,
      eligibility: eligibilityText,
      status: "Open", // Will be evaluated dynamically by hackathonSyncService
      isFeatured: Boolean(prizeAmount && prizeAmount >= 50000),
      isDemo: false,
      lastSyncedAt: new Date(),
    };

    this.validate(normalized);
    return normalized;
  }
}

export const brabbleProvider = new BrabbleHackathonProvider();
export default brabbleProvider;
