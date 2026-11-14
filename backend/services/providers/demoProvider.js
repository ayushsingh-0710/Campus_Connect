import { BaseHackathonProvider } from "./BaseHackathonProvider.js";
import { classifyLocation } from "../../utils/geographicData.js";

/**
 * DemoHackathonProvider
 * 
 * Provides high-quality, illustrative demo hackathon listings for testing
 * and demonstration purposes. All records are explicitly flagged with isDemo: true.
 */

const RAW_DEMO_HACKATHONS = [
  {
    rawId: "demo-hack-001",
    name: "AI Campus Innovate 2026",
    host: "Centre for Artificial Intelligence & Robotics",
    summary: "Build next-generation generative AI tools, autonomous agents, and campus assistants.",
    overview:
      "AI Campus Innovate 2026 challenges university students to build practical AI-driven solutions addressing education accessibility, campus safety, research discovery, and smart student services. Teams will receive mentor feedback from seasoned ML engineers and access to cloud compute credits.",
    badgeLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
    eventMode: "Hybrid",
    venue: "Main Auditorium, Technology Park & Online Discord",
    tags: ["Artificial Intelligence", "Machine Learning", "Cloud Computing"],
    techStack: ["Python", "PyTorch", "LangChain", "FastAPI", "React"],
    minTeam: 2,
    maxTeam: 4,
    rewardAmount: 150000,
    currencyCode: "INR",
    regCloseDate: "2026-11-28T23:59:59.000Z",
    eventStart: "2026-12-05T09:00:00.000Z",
    eventEnd: "2026-12-07T18:00:00.000Z",
    requirements: "Open to all enrolled undergraduate and postgraduate students from recognized colleges.",
    state: "Open",
    featuredEvent: true,
    website: "https://example.edu/ai-campus-innovate",
    applyLink: "https://unstop.com/hackathons/example-ai-campus-innovate",
  },
  {
    rawId: "demo-hack-002",
    name: "Web3 Bharat Hackathon",
    host: "Blockchain Developers Guild",
    summary: "Architect decentralized applications, public goods, and zero-knowledge identity protocols.",
    overview:
      "Join 400+ Web3 student builders for a 36-hour sprint. Build decentralized protocols, DeFi consumer apps, credential verification for universities, and decentralized physical infrastructure (DePIN) on leading EVM chains.",
    badgeLogo: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=150&auto=format&fit=crop&q=80",
    eventMode: "Online",
    venue: "Virtual / Gather.town & Discord",
    tags: ["Blockchain", "Web Development", "Open Innovation"],
    techStack: ["Solidity", "Ethereum", "Ethers.js", "Next.js", "IPFS"],
    minTeam: 1,
    maxTeam: 4,
    rewardAmount: 85000,
    currencyCode: "INR",
    regCloseDate: "2026-11-20T23:59:59.000Z",
    eventStart: "2026-11-25T10:00:00.000Z",
    eventEnd: "2026-11-27T17:00:00.000Z",
    requirements: "Open to All — developers, designers, and web3 enthusiasts of any level.",
    state: "Closing Soon",
    featuredEvent: true,
    website: "https://example.org/web3-bharat",
    applyLink: "https://unstop.com/hackathons/example-web3-bharat",
  },
  {
    rawId: "demo-hack-003",
    name: "CloudNative Sprint 2026",
    host: "DevOps & Cloud Computing Society",
    summary: "Deploy resilient microservices, serverless workflows, and Kubernetes monitoring dashboards.",
    overview:
      "Test your system architecture skills by engineering scalable cloud-native architectures that withstand extreme traffic spikes and failover scenarios. Mentorship provided by industry platform engineers.",
    badgeLogo: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=150&auto=format&fit=crop&q=80",
    eventMode: "Online",
    venue: "Online / Google Meet & GitHub Classroom",
    tags: ["Cloud Computing", "Web Development"],
    techStack: ["Docker", "Kubernetes", "Go", "Node.js", "Prometheus"],
    minTeam: 2,
    maxTeam: 4,
    rewardAmount: 45000,
    currencyCode: "INR",
    regCloseDate: "2026-12-10T18:00:00.000Z",
    eventStart: "2026-12-18T09:00:00.000Z",
    eventEnd: "2026-12-20T21:00:00.000Z",
    requirements: "Open to university students with foundational knowledge of Linux, containers, or backend APIs.",
    state: "Open",
    featuredEvent: false,
    website: "https://example.com/cloudnative-sprint",
    applyLink: "https://unstop.com/hackathons/example-cloudnative-sprint",
  },
  {
    rawId: "demo-hack-004",
    name: "CyberShield CTF & Defense Challenge",
    host: "National Student Cyber Security Cell",
    summary: "Engage in red-team penetration testing, binary analysis, and web security defense.",
    overview:
      "CyberShield combines Jeopardy-style CTF challenges with real-time defensive blue teaming. Form a team to safeguard simulated university hospital infrastructure against advanced threat models.",
    badgeLogo: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150&auto=format&fit=crop&q=80",
    eventMode: "Offline",
    venue: "Cyber Security Lab, Block C, University Campus",
    tags: ["Cybersecurity"],
    techStack: ["Wireshark", "Ghidra", "Python", "Burp Suite", "Bash"],
    minTeam: 2,
    maxTeam: 4,
    rewardAmount: 75000,
    currencyCode: "INR",
    regCloseDate: "2026-11-18T18:00:00.000Z",
    eventStart: "2026-11-22T08:30:00.000Z",
    eventEnd: "2026-11-23T20:00:00.000Z",
    requirements: "Students currently enrolled in undergraduate or graduate degrees with valid college IDs.",
    state: "Closing Soon",
    featuredEvent: false,
    website: "https://example.edu/cybershield-2026",
    applyLink: "https://unstop.com/hackathons/example-cybershield",
  },
  {
    rawId: "demo-hack-005",
    name: "Smart Campus IoTathon",
    host: "Department of Electronics & Embedded Systems",
    summary: "Create connected hardware, energy harvesting monitors, and automated campus transit trackers.",
    overview:
      "Harness microcontrollers, LoRaWAN gateways, and cloud dashboards to tackle energy waste, bicycle parking management, and air quality across smart university campuses. Hardware toolkits provided at check-in.",
    badgeLogo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80",
    eventMode: "Offline",
    venue: "Maker Studio, Innovation Center, Bengaluru Campus",
    tags: ["IoT", "Open Innovation"],
    techStack: ["ESP32", "Raspberry Pi", "MQTT", "C++", "Node-RED"],
    minTeam: 2,
    maxTeam: 5,
    rewardAmount: 60000,
    currencyCode: "INR",
    regCloseDate: "2026-12-01T23:59:59.000Z",
    eventStart: "2026-12-12T09:00:00.000Z",
    eventEnd: "2026-12-14T17:00:00.000Z",
    requirements: "College students of any branch. Cross-functional teams encouraged (ECE, CS, Mechanical).",
    state: "Open",
    featuredEvent: false,
    website: "https://example.edu/smart-campus-iot",
    applyLink: "https://unstop.com/hackathons/example-smart-campus-iot",
  },
  {
    rawId: "demo-hack-006",
    name: "Flutter & Mobile Odyssey",
    host: "Mobile App Developers Circle",
    summary: "Ship high-performance cross-platform apps for productivity, wellbeing, and student communities.",
    overview:
      "A 48-hour sprint dedicated to craft, motion, and seamless mobile UX. Build offline-first, fluid mobile experiences using Flutter, React Native, or native Kotlin/Swift.",
    badgeLogo: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=150&auto=format&fit=crop&q=80",
    eventMode: "Online",
    venue: "Virtual Hackathon / YouTube Live & Slack",
    tags: ["App Development", "Web Development"],
    techStack: ["Flutter", "Dart", "Firebase", "React Native", "Tailwind"],
    minTeam: 1,
    maxTeam: 3,
    rewardAmount: 30000,
    currencyCode: "INR",
    regCloseDate: "2026-12-20T23:59:59.000Z",
    eventStart: "2027-01-08T10:00:00.000Z",
    eventEnd: "2027-01-10T18:00:00.000Z",
    requirements: "Open to All students, self-taught coders, and early designers.",
    state: "Upcoming",
    featuredEvent: false,
    website: "https://example.com/mobile-odyssey",
    applyLink: "https://unstop.com/hackathons/example-mobile-odyssey",
  },
  {
    rawId: "demo-hack-007",
    name: "Climate & GreenTech Buildathon",
    host: "EcoTech Collaborative & University Green Fund",
    summary: "Engineer digital tools that empower local communities to reduce carbon emissions.",
    overview:
      "Build open-source calculators, renewable energy optimization models, and food-waste logistics dashboards. Top three teams qualify for venture seed grants from the University Green Technology Fund.",
    badgeLogo: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=150&auto=format&fit=crop&q=80",
    eventMode: "Hybrid",
    venue: "Green Energy Building, North Campus + Zoom",
    tags: ["Open Innovation", "Artificial Intelligence", "Web Development"],
    techStack: ["Python", "GIS", "React", "PostgreSQL", "FastAPI"],
    minTeam: 2,
    maxTeam: 5,
    rewardAmount: 120000,
    currencyCode: "INR",
    regCloseDate: "2026-11-26T23:59:59.000Z",
    eventStart: "2026-12-02T09:00:00.000Z",
    eventEnd: "2026-12-04T18:00:00.000Z",
    requirements: "Open to all university students passionate about sustainability and software solutions.",
    state: "Open",
    featuredEvent: true,
    website: "https://example.org/greentech-buildathon",
    applyLink: "https://unstop.com/hackathons/example-greentech-buildathon",
  },
  {
    rawId: "demo-hack-008",
    name: "FullStack Velocity Sprint",
    host: "Modern Web Engineers Club",
    summary: "Rapid prototyping marathon for modern web apps solving daily student challenges.",
    overview:
      "From collaborative study room booking to campus marketplace platforms, show off your full-stack prowess using modern frameworks, TypeScript, and edge databases.",
    badgeLogo: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80",
    eventMode: "Online",
    venue: "Online / GitHub & Discord",
    tags: ["Web Development", "App Development"],
    techStack: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
    minTeam: 1,
    maxTeam: 4,
    rewardAmount: 8000,
    currencyCode: "INR",
    regCloseDate: "2026-12-15T23:59:59.000Z",
    eventStart: "2026-12-22T09:00:00.000Z",
    eventEnd: "2026-12-24T18:00:00.000Z",
    requirements: "College students of all semesters. Individual participants welcome.",
    state: "Open",
    featuredEvent: false,
    website: "https://example.com/fullstack-velocity",
    applyLink: "https://unstop.com/hackathons/example-fullstack-velocity",
  },
  {
    rawId: "demo-hack-009",
    name: "National Open Innovation Hack",
    host: "University Student Council & Startup Cell",
    summary: "Multidisciplinary innovation sprint solving problems pitched by local public agencies.",
    overview:
      "Bring any idea that improves life in your city or university. Receive pitch coaching from venture capitalists, design feedback from product mentors, and prototype review.",
    badgeLogo: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150&auto=format&fit=crop&q=80",
    eventMode: "Hybrid",
    venue: "Convention Center & Zoom Live",
    tags: ["Open Innovation"],
    techStack: ["React", "Python", "Figma", "Flutter"],
    minTeam: 2,
    maxTeam: 5,
    rewardAmount: 200000,
    currencyCode: "INR",
    regCloseDate: "2026-12-30T23:59:59.000Z",
    eventStart: "2027-01-15T09:00:00.000Z",
    eventEnd: "2027-01-17T19:00:00.000Z",
    requirements: "Open to All university and polytechnic students across India.",
    state: "Upcoming",
    featuredEvent: false,
    website: "https://example.edu/open-innovation-hack",
    applyLink: "https://unstop.com/hackathons/example-open-innovation",
  },
  {
    rawId: "demo-hack-010",
    name: "Algorithmic Trading & FinTech Jam",
    host: "Finance & Quantitative Computing Society",
    summary: "Simulate quantitative strategies, risk management bots, and peer payment rails.",
    overview:
      "A fast-paced weekend where quantitative finance meets modern software engineering. Access historical tick data and backtesting engines to design resilient automated portfolios.",
    badgeLogo: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=150&auto=format&fit=crop&q=80",
    eventMode: "Offline",
    venue: "Finance Lab, School of Management",
    tags: ["Machine Learning", "Web Development"],
    techStack: ["Python", "NumPy", "Pandas", "Streamlit", "Docker"],
    minTeam: 2,
    maxTeam: 4,
    rewardAmount: 50000,
    currencyCode: "INR",
    regCloseDate: "2026-11-24T18:00:00.000Z",
    eventStart: "2026-11-29T09:00:00.000Z",
    eventEnd: "2026-11-30T20:00:00.000Z",
    requirements: "Undergraduate and MBA students with passion for finance and technology.",
    state: "Open",
    featuredEvent: false,
    website: "https://example.edu/fintech-jam",
    applyLink: "https://unstop.com/hackathons/example-fintech-jam",
  },
  {
    rawId: "demo-hack-011",
    name: "Autumn Campus Codeathon (Concluded)",
    host: "Computer Science Association",
    summary: "Annual flagship coding marathon featuring algorithmic and UI challenge tracks.",
    overview:
      "The autumn flagship hackathon has concluded for this season. Check back for spring edition announcements!",
    badgeLogo: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=150&auto=format&fit=crop&q=80",
    eventMode: "Offline",
    venue: "Auditorium Hall 2",
    tags: ["Web Development", "Artificial Intelligence"],
    techStack: ["C++", "Java", "Python", "React"],
    minTeam: 1,
    maxTeam: 3,
    rewardAmount: 25000,
    currencyCode: "INR",
    regCloseDate: "2026-10-15T23:59:59.000Z",
    eventStart: "2026-10-20T09:00:00.000Z",
    eventEnd: "2026-10-22T17:00:00.000Z",
    requirements: "Students of university campus.",
    state: "Closed",
    featuredEvent: false,
    website: "https://example.edu/autumn-codeathon",
    applyLink: "https://unstop.com/hackathons/example-autumn-codeathon",
  },
];

export class DemoHackathonProvider extends BaseHackathonProvider {
  constructor() {
    super("demo");
  }

  async fetchHackathons(options = {}) {
    return RAW_DEMO_HACKATHONS;
  }

  async fetchHackathonDetails(externalId) {
    const item = RAW_DEMO_HACKATHONS.find((h) => h.rawId === externalId);
    if (!item) {
      throw new Error(`Demo hackathon with ID ${externalId} not found`);
    }
    return item;
  }

  normalizeHackathonData(raw) {
    const slug = raw.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const geo = classifyLocation({
      title: raw.name,
      organizer: raw.host,
      location: raw.venue,
      eligibility: raw.requirements,
    });

    const normalized = {
      title: raw.name,
      slug,
      organizer: raw.host,
      description: raw.summary,
      fullDescription: raw.overview,
      logo: raw.badgeLogo,
      source: "demo",
      sourceId: raw.rawId,
      sourceUrl: raw.website,
      registrationUrl: raw.applyLink,
      mode: raw.eventMode,
      location: raw.venue,
      country: geo.country || "India",
      countryCode: geo.countryCode || "IN",
      state: geo.state || null,
      stateCode: geo.stateCode || null,
      city: geo.city || null,
      locationType: geo.locationType || "domestic",
      countryDetectionMethod: geo.countryDetectionMethod || "verified_location_mapping",
      categories: raw.tags || [],
      technologies: raw.techStack || [],
      teamSize: {
        min: raw.minTeam || 1,
        max: raw.maxTeam || 4,
      },
      prizePool: {
        amount: raw.rewardAmount || 0,
        currency: raw.currencyCode || "INR",
      },
      registrationDeadline: new Date(raw.regCloseDate),
      startDate: new Date(raw.eventStart),
      endDate: raw.eventEnd ? new Date(raw.eventEnd) : undefined,
      eligibility: raw.requirements,
      status: raw.state || "Open",
      isFeatured: Boolean(raw.featuredEvent),
      isDemo: true,
      lastSyncedAt: new Date(),
    };

    this.validate(normalized);
    return normalized;
  }
}

export const demoProvider = new DemoHackathonProvider();
export default demoProvider;
