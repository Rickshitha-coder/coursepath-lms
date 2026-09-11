import { useEffect, useState } from 'react';
import { useCourses } from '../context/CourseContext';
import CourseCard from '../components/CourseCard';

export default function Courses() {
  const { courses, loading, error, fetchCourses } = useCourses();
  const [q, setQ] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  function handleSearch(e) {
    e.preventDefault();
    fetchCourses({ q });
  }

  return (
    <main className="page">
      <h1>Browse courses</h1>
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          placeholder="Search by course name or instructor…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

      {loading && <p>Loading courses…</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && !error && courses.length === 0 && <p>No courses found.</p>}

      <div className="course-grid">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </main>
  );
}
