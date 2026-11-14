import { BaseHackathonProvider } from "./BaseHackathonProvider.js";

/**
 * ExternalHackathonProviderPlaceholder
 * 
 * PLACEHOLDER FOR FUTURE EXTERNAL HACKATHON API INTEGRATION
 * (e.g. Unstop, Devpost, MLH, Devfolio, HackerEarth)
 * 
 * When an external API provider is selected:
 * 1. Set environment variables in backend/.env:
 *    - HACKATHON_API_PROVIDER=unstop
 *    - HACKATHON_API_BASE_URL=https://api.example.com
 *    - HACKATHON_API_KEY=your_api_key_here
 * 2. Implement the methods below using real HTTP client (fetch or axios)
 * 3. Map the provider's specific JSON response in normalizeHackathonData()
 * 4. Register the new provider in hackathonSyncService.js
 * 
 * DO NOT make unauthorized requests or assume third-party schema until official documentation is provided.
 */

export class ExternalHackathonProviderPlaceholder extends BaseHackathonProvider {
  constructor(providerName = "external-placeholder") {
    super(providerName);
    this.baseUrl = process.env.HACKATHON_API_BASE_URL || null;
    this.apiKey = process.env.HACKATHON_API_KEY || null;
  }

  /**
   * TODO: Connect real external endpoint once credentials & documentation are supplied
   */
  async fetchHackathons(options = {}) {
    if (!this.baseUrl || !this.apiKey) {
      console.warn(
        `[${this.name}] External API provider not configured. Skipping external fetch until API keys are set in backend/.env.`
      );
      return [];
    }

    // TODO: Example implementation when API is selected:
    // const response = await fetch(`${this.baseUrl}/hackathons?page=${options.page || 1}`, {
    //   headers: {
    //     "Authorization": `Bearer ${this.apiKey}`,
    //     "Accept": "application/json"
    //   }
    // });
    // const json = await response.json();
    // return json.data;

    throw new Error(
      `External provider ${this.name} is not connected yet. Please refer to HACKATHON_API_INTEGRATION_GUIDE.md to complete setup.`
    );
  }

  /**
   * TODO: Connect real details endpoint
   */
  async fetchHackathonDetails(externalId) {
    if (!this.baseUrl || !this.apiKey) {
      throw new Error(`External provider ${this.name} credentials missing`);
    }

    // TODO: Fetch single hackathon details by externalId from API provider
    throw new Error(`Not implemented until external API is selected`);
  }

  /**
   * TODO: Map provider-specific fields to internal Campus Connect schema
   * 
   * Example:
   * raw.id -> sourceId
   * raw.title or raw.name -> title
   * raw.organizer.name -> organizer
   * raw.registration_url -> registrationUrl
   * raw.categories or raw.themes -> categories
   */
  normalizeHackathonData(raw) {
    // Return object complying with Hackathon model
    const normalized = {
      title: raw.title || raw.name,
      slug: (raw.title || raw.name || "hackathon")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      organizer: raw.organizer || "Unknown Organizer",
      description: raw.description || "",
      fullDescription: raw.fullDescription || raw.description || "",
      logo: raw.logo || "",
      source: this.name,
      sourceId: String(raw.id || raw._id),
      sourceUrl: raw.sourceUrl || raw.url || "",
      registrationUrl: raw.registrationUrl || raw.applyUrl || "",
      mode: ["Online", "Offline", "Hybrid"].includes(raw.mode) ? raw.mode : "Online",
      location: raw.location || "Online",
      categories: Array.isArray(raw.categories) ? raw.categories : [],
      technologies: Array.isArray(raw.technologies) ? raw.technologies : [],
      teamSize: {
        min: raw.teamSize?.min || 1,
        max: raw.teamSize?.max || 4,
      },
      prizePool: {
        amount: raw.prizePool?.amount || 0,
        currency: raw.prizePool?.currency || "INR",
      },
      registrationDeadline: new Date(raw.registrationDeadline || Date.now()),
      startDate: new Date(raw.startDate || Date.now()),
      endDate: raw.endDate ? new Date(raw.endDate) : undefined,
      eligibility: raw.eligibility || "Open to all students",
      status: raw.status || "Open",
      isFeatured: Boolean(raw.isFeatured),
      isDemo: false, // Real imported records are marked false
      lastSyncedAt: new Date(),
    };

    this.validate(normalized);
    return normalized;
  }
}

export default ExternalHackathonProviderPlaceholder;
