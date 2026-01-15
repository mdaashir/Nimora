'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface UserProfile {
  rollNo: string;
  name: string;
  email: string;
}

export default function ClassTimetablePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://localhost:3001/user/profile', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);

          // Only allow access if roll number starts with 22pt (case insensitive)
          const rollNo = data.rollNo?.toLowerCase() || '';
          setHasAccess(rollNo.startsWith('22pt'));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This page is only available for students with roll numbers starting with 22PT.
          </p>
          {userProfile && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              Your roll number: {userProfile.rollNo}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
          Class Time Table
        </h1>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Note:</strong> This is the class timetable for students with roll numbers starting with 22PT.
          </p>
        </div>

        <div className="flex justify-center">
          {!imageError ? (
            <div className="relative w-full max-w-4xl">
              <Image
                src="/Schedule.png"
                alt="Class Schedule"
                width={1200}
                height={800}
                className="rounded-lg shadow-md w-full h-auto"
                onError={() => setImageError(true)}
                priority
              />
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-12 text-center max-w-2xl w-full">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">
                Schedule image not found. Please contact administrator.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
          <p>This is your class schedule for the semester.</p>
          <p className="text-sm mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
