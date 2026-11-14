/**
 * BaseHackathonProvider
 * 
 * Abstract base class defining the provider interface.
 * Any external provider (e.g., Unstop, Devfolio, MLH, Devpost) or local demo provider
 * must extend this class and implement the required methods.
 */

export class BaseHackathonProvider {
  constructor(name) {
    if (new.target === BaseHackathonProvider) {
      throw new TypeError("Cannot construct BaseHackathonProvider instances directly");
    }
    this.name = name;
  }

  /**
   * Fetch a list of hackathons from the provider.
   * @param {Object} options - Pagination, search, and filter parameters
   * @returns {Promise<Array<Object>>} Raw or provider-specific hackathon items
   */
  async fetchHackathons(options = {}) {
    throw new Error(`fetchHackathons() must be implemented by provider: ${this.name}`);
  }

  /**
   * Fetch detailed information for a specific hackathon by external ID.
   * @param {string} externalId - Provider's native identifier
   * @returns {Promise<Object>} Raw provider detail object
   */
  async fetchHackathonDetails(externalId) {
    throw new Error(`fetchHackathonDetails() must be implemented by provider: ${this.name}`);
  }

  /**
   * Normalize raw external hackathon data into our standard Campus Connect Hackathon schema.
   * @param {Object} raw - Raw provider record
   * @returns {Object} Normalized Hackathon data matching the internal Mongoose schema
   */
  normalizeHackathonData(raw) {
    throw new Error(`normalizeHackathonData() must be implemented by provider: ${this.name}`);
  }

  /**
   * Basic validation for normalized hackathon objects before database ingestion.
   * @param {Object} item - Normalized hackathon object
   * @returns {boolean}
   */
  validate(item) {
    if (!item.title || !item.organizer || !item.registrationDeadline) {
      throw new Error(
        `[${this.name}] Normalized item missing required fields: title, organizer, or registrationDeadline`
      );
    }
    return true;
  }
}

export default BaseHackathonProvider;
