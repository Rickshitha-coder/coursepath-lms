// Reusable course card — used by the Courses page (and reusable anywhere
// else a course needs to be rendered) instead of repeating markup.
export default function CourseCard({ course }) {
  return (
    <article className="course-card">
      <h3>{course.name}</h3>
      <p className="course-card-meta">{course.instructor} &middot; {course.duration} weeks &middot; {course.category}</p>
      <p className="course-card-desc">{course.description}</p>
      <p className="course-card-modules">{(course.modules || []).length} modules</p>
    </article>
  );
}
