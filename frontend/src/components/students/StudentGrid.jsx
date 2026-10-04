import React from "react";
import StudentCard from "./StudentCard";

export function StudentGrid({
  students = [],
  compact = false,
  className = "",
  onViewStudent,
}) {
  return (
    <div
      className={`student-grid ${compact ? "compact-grid" : ""} ${className}`.trim()}
    >
      {students.map((student) => (
        <StudentCard
          key={student.id || student.name}
          student={student}
          onView={onViewStudent ? () => onViewStudent(student) : undefined}
        />
      ))}
    </div>
  );
}

export default StudentGrid;
