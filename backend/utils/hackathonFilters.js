/**
 * Query filter builder and sorting helper for Hackathons
 */

export const buildHackathonQuery = (params = {}) => {
  const query = {};

  // 1. Search across title, organizer, description, categories, and technologies
  if (params.search && params.search.trim()) {
    const term = params.search.trim();
    const regex = new RegExp(term, "i");
    query.$or = [
      { title: regex },
      { organizer: regex },
      { description: regex },
      { categories: { $elemMatch: { $regex: regex } } },
      { technologies: { $elemMatch: { $regex: regex } } },
    ];
  }

  // 2. Mode filter: Online, Offline, Hybrid
  if (params.mode && ["Online", "Offline", "Hybrid"].includes(params.mode)) {
    query.mode = params.mode;
  }

  // 3. Category filter
  if (params.category && params.category !== "All") {
    query.categories = { $regex: new RegExp(`^${params.category}$`, "i") };
  }

  // 4. Registration Status filter: Open, Closing Soon, Closed, Upcoming
  if (params.status && ["Open", "Closing Soon", "Closed", "Upcoming"].includes(params.status)) {
    query.status = params.status;
  }

  // 5. Team Size filter
  if (params.teamSize) {
    switch (params.teamSize) {
      case "Individual":
        query.$or = [
          { "teamSize.min": 1, "teamSize.max": 1 },
          { "teamSize.label": { $regex: /individual/i } },
        ];
        break;
      case "2–4 Members":
      case "2-4 Members":
        query.$or = [
          { "teamSize.min": { $lte: 2 }, "teamSize.max": { $gte: 4 } },
          { "teamSize.label": { $regex: /1.*4|2.*4/i } },
        ];
        break;
      case "2–5 Members":
      case "2-5 Members":
        query.$or = [
          { "teamSize.min": { $lte: 2 }, "teamSize.max": { $gte: 5 } },
          { "teamSize.label": { $regex: /1.*5|2.*5/i } },
        ];
        break;
      case "Custom":
        query.$or = [
          { "teamSize.min": { $gt: 2 } },
          { "teamSize.max": { $gt: 5 } },
          { "teamSize.label": { $regex: /see listing|check listing/i } },
        ];
        break;
      default:
        break;
    }
  }

  // 6. Prize Pool filter
  if (params.prizePool) {
    switch (params.prizePool) {
      case "No Prize":
        query.$or = [
          { "prizePool.amount": 0 },
          { "prizePool.amount": null },
        ];
        break;
      case "Under ₹10,000":
      case "under-10k":
        query["prizePool.amount"] = { $gt: 0, $lte: 10000 };
        break;
      case "₹10,000–₹50,000":
      case "10k-50k":
        query["prizePool.amount"] = { $gte: 10000, $lte: 50000 };
        break;
      case "₹50,000–₹1,00,000":
      case "50k-100k":
        query["prizePool.amount"] = { $gte: 50000, $lte: 100000 };
        break;
      case "Above ₹1,00,000":
      case "above-100k":
        query["prizePool.amount"] = { $gt: 100000 };
        break;
      default:
        break;
    }
  }

  // 7. Participation filter (Students vs Open to All)
  if (params.participation) {
    if (params.participation === "Students") {
      query.eligibility = { $regex: /student|undergrad|grad|enrolled|college|university/i };
    } else if (params.participation === "Open to All") {
      query.eligibility = { $regex: /open to all|everyone|all backgrounds|anyone|open category/i };
    }
  }

  // 8. Featured filter
  if (params.featured === "true" || params.featured === true) {
    query.isFeatured = true;
  }

  // 9. Demo Filter (Optional: filter only live or only demo)
  if (params.isDemo !== undefined && params.isDemo !== "") {
    query.isDemo = params.isDemo === "true" || params.isDemo === true;
  }

  // 10. Platform / Source filter (e.g. Unstop, Internshala, Hack Club)
  if (params.platform) {
    query.platform = { $regex: new RegExp(`^${params.platform}$`, "i") };
  }

  // 11. Country Filter (India Only, International Only, Location Not Specified)
  if (params.country) {
    const c = String(params.country).toLowerCase().trim();
    if (c === "in" || c === "india" || c === "india only") {
      query.countryCode = "IN";
    } else if (c === "international" || c === "international only") {
      query.locationType = "international";
    } else if (c === "unknown" || c === "not-specified" || c === "location not specified") {
      query.$or = [{ countryCode: null }, { locationType: "unknown" }];
    }
  }

  // 12. State Filter (e.g., "Uttar Pradesh", "Maharashtra")
  if (params.state && params.state !== "All States" && params.state !== "All") {
    const sTerm = params.state.trim();
    query.state = { $regex: new RegExp(`^${sTerm}$`, "i") };
  }

  // 13. City Filter (e.g., "Lucknow", "Bengaluru")
  if (params.city && params.city !== "All Cities" && params.city !== "All") {
    const cTerm = params.city.trim();
    query.city = { $regex: new RegExp(`^${cTerm}$`, "i") };
  }

  return query;
};

export const buildHackathonSort = (sortBy) => {
  let primarySort = { createdAt: -1 };

  switch (sortBy) {
    case "deadline":
    case "Registration Deadline":
      primarySort = { registrationDeadline: 1 };
      break;
    case "upcoming":
    case "Upcoming Events":
      primarySort = { registrationDeadline: 1 };
      break;
    case "prize-high":
    case "Highest Prize Pool":
      primarySort = { "prizePool.amount": -1, createdAt: -1 };
      break;
    case "recently-added":
    case "Recently Added":
    default:
      primarySort = { createdAt: -1 };
      break;
  }

  // Prioritize real imported hackathons over demo records: isDemo false (0) before true (1)
  return { isDemo: 1, ...primarySort };
};

export default {
  buildHackathonQuery,
  buildHackathonSort,
};
