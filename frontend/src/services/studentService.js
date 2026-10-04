import { students } from "../data/students";

export const studentService = {
  getAllStudents() {
    return Promise.resolve([...students]);
  },

  getStudentById(id) {
    const student = students.find((s) => s.id === id);
    return Promise.resolve(student || students[0]);
  },

  searchStudents(filters = {}) {
    let result = [...students];

    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.course.toLowerCase().includes(q) ||
          s.campus.toLowerCase().includes(q) ||
          s.skills.some((sk) => sk.toLowerCase().includes(q)) ||
          s.interests.some((it) => it.toLowerCase().includes(q))
      );
    }

    if (filters.skill) {
      const skillLower = filters.skill.toLowerCase();
      result = result.filter((s) =>
        s.skills.some((sk) => sk.toLowerCase().includes(skillLower))
      );
    }

    if (filters.campus) {
      result = result.filter((s) =>
        s.campus.toLowerCase().includes(filters.campus.toLowerCase())
      );
    }

    if (filters.course) {
      result = result.filter((s) =>
        s.course.toLowerCase().includes(filters.course.toLowerCase())
      );
    }

    if (filters.year) {
      result = result.filter((s) =>
        s.year.toLowerCase().includes(filters.year.toLowerCase())
      );
    }

    if (filters.interest) {
      result = result.filter((s) =>
        s.interests.some((i) =>
          i.toLowerCase().includes(filters.interest.toLowerCase())
        )
      );
    }

    return Promise.resolve(result);
  },
};

export default studentService;
