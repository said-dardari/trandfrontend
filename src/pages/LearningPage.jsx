import React, { useEffect, useState } from 'react';
import { learningAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const LearningPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await learningAPI.getCourses();
        setCourses(res.data.courses || []);
      } catch (e) {
        console.error('Error loading courses:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">MasterClass Learning Center</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {loading ? (
            <div className="text-gray-500 dark:text-gray-400 italic">Loading...</div>
          ) : courses.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 italic">No courses available</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map(c => (
                <div key={c.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-500 dark:text-gray-300">{c.level.toUpperCase()}</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{c.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{c.modules} modules</div>
                  <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                    Start
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPage;
