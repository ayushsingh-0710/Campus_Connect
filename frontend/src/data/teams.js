import { photos } from "./students";

export const teams = [
  {
    id: "northstar",
    name: "Northstar",
    desc: "A campus navigation tool designed around accessibility and step-free routes.",
    fullDesc: "Northstar is an indoor and outdoor accessible navigation platform for students with physical disabilities, temporary injuries, and sensory sensitivities. We are competing in Build for Good 2025 and building an intuitive React + OpenStreetMap interface with audio navigation cues.",
    hackathonId: "build-for-good-2025",
    hackathonName: "Build for Good 2025",
    membersCount: 4,
    members: [
      { name: "Maya Chen", role: "Frontend Lead", photo: photos[0], studentId: "maya-chen" },
      { name: "Jordan Ellis", role: "Product Designer", photo: photos[1], studentId: "jordan-ellis" },
      { name: "Ethan Clark", role: "Backend Developer", photo: photos[4], studentId: "ethan-clark" },
      { name: "Aisha Patel", role: "Accessibility Specialist", photo: photos[6], studentId: "aisha-patel" },
    ],
    skills: ["React", "UX", "Maps", "Accessibility", "Node.js"],
    openRoles: ["Mobile Developer (React Native)", "Campus Data Scout"],
    colorVariant: 0,
  },
  {
    id: "greenbyte",
    name: "GreenByte",
    desc: "Helping student households understand and cut their weekly energy use.",
    fullDesc: "GreenByte links smart meter readouts with student housemate bill-splitting. By turning energy reduction into friendly inter-campus dorm leaderboards, we encourage collective action on climate and save students money.",
    hackathonId: "climate-code",
    hackathonName: "Climate Code",
    membersCount: 3,
    members: [
      { name: "Noah Williams", role: "Data Scientist", photo: photos[2], studentId: "noah-williams" },
      { name: "Sofia Ahmed", role: "Growth & Pitch", photo: photos[3], studentId: "sofia-ahmed" },
      { name: "Liam Brooks", role: "Security & Cloud", photo: photos[5], studentId: "liam-brooks" },
    ],
    skills: ["Python", "Data", "Product", "SQL", "Energy APIs"],
    openRoles: ["Frontend Web Developer"],
    colorVariant: 1,
  },
  {
    id: "pulsepay",
    name: "PulsePay",
    desc: "Micro-savings and transparent shared expenses for student societies.",
    fullDesc: "Student clubs lose hundreds every semester managing receipt reimbursements through messy spreadsheets. PulsePay automates verified approvals, petty cash tracking, and transparent member dues.",
    hackathonId: "fintech-sprint",
    hackathonName: "FinTech Sprint",
    membersCount: 2,
    members: [
      { name: "Sofia Ahmed", role: "Product Manager", photo: photos[3], studentId: "sofia-ahmed" },
      { name: "Marcus Vance", role: "Full Stack Engineer", photo: photos[7], studentId: "marcus-vance" },
    ],
    skills: ["FinTech", "Mobile", "Next.js", "Postgres"],
    openRoles: ["UI/UX Designer", "Financial Compliance Lead"],
    colorVariant: 0,
  },
];

export default teams;
