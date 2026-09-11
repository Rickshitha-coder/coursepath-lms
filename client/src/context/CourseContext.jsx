import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

// Centralized course-data state via Context API, shared by the Courses
// list, the Dashboard, and anywhere else that needs the catalog without
// re-fetching or prop-drilling it down through the component tree.
const CourseContext = createContext(null);

export function CourseProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCourses = useCallback(async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/courses', { params });
      setCourses(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load courses.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const value = { courses, loading, error, fetchCourses };
  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourses must be used within a CourseProvider');
  return ctx;
}
