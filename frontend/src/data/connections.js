import { students } from "./students";

export const initialConnections = [
  {
    id: "conn-1",
    student: students[1], // Jordan Ellis
    status: "connected",
    date: "Connected 2 days ago",
  },
  {
    id: "conn-2",
    student: students[2], // Noah Williams
    status: "connected",
    date: "Connected 1 week ago",
  },
  {
    id: "conn-3",
    student: students[3], // Sofia Ahmed
    status: "connected",
    date: "Connected 2 weeks ago",
  },
  {
    id: "conn-4",
    student: students[4], // Ethan Clark
    status: "connected",
    date: "Connected 3 weeks ago",
  },
  {
    id: "conn-5",
    student: students[5], // Liam Brooks
    status: "pending_incoming",
    date: "Requested yesterday",
  },
  {
    id: "conn-6",
    student: students[6], // Aisha Patel
    status: "pending_incoming",
    date: "Requested 3 hours ago",
  },
];

export default initialConnections;
