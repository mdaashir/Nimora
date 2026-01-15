'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { calculateBunkableClasses } from '@nimora/shared-utils';
import type { AttendanceResponse, CourseAttendance } from '@nimora/shared-types';

export default function AttendancePage() {
  const [threshold, setThreshold] = useState(75);

  const { data, isLoading, error, refetch } = useQuery<AttendanceResponse>({
    queryKey: ['attendance', threshold],
    queryFn: async () => {
      const response = await apiClient.get(`/attendance?threshold=${threshold}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-400';
    if (percentage >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 85) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getBunkStatus = (course: CourseAttendance) => {
    if (course.canBunk > 0) {
      return {
        text: `Can skip ${course.canBunk} class${course.canBunk > 1 ? 'es' : ''}`,
        color: 'text-green-400',
      };
    }
    if (course.mustAttend > 0) {
      return {
        text: `Must attend ${course.mustAttend} class${course.mustAttend > 1 ? 'es' : ''}`,
        color: 'text-red-400',
      };
    }
    return {
      text: 'On the edge',
      color: 'text-yellow-400',
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Attendance</h1>
          <p className="text-slate-400">Track your attendance and bunk eligibility</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="threshold" className="text-slate-300 whitespace-nowrap">
              Threshold:
            </Label>
            <Input
              id="threshold"
              type="number"
              min="50"
              max="100"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value) || 75)}
              className="w-20 bg-slate-700/50 border-slate-600 text-white"
            />
            <span className="text-slate-400">%</span>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Overall Statistics</CardTitle>
          <CardDescription className="text-slate-400">
            Your cumulative attendance across all courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getAttendanceColor(data?.overallPercentage ?? 0)}`}>
                {isLoading ? '...' : `${data?.overallPercentage?.toFixed(1) ?? '--'}%`}
              </div>
              <p className="text-slate-400 text-sm mt-1">Overall Attendance</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400">
                {isLoading ? '...' : data?.courses?.length ?? '--'}
              </div>
              <p className="text-slate-400 text-sm mt-1">Total Courses</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400">
                {threshold}%
              </div>
              <p className="text-slate-400 text-sm mt-1">Target Threshold</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Progress to {threshold}%</span>
              <span className={getAttendanceColor(data?.overallPercentage ?? 0)}>
                {data?.overallPercentage?.toFixed(1) ?? 0}%
              </span>
            </div>
            <Progress
              value={data?.overallPercentage ?? 0}
              className="h-3 bg-slate-700"
            />
          </div>
        </CardContent>
      </Card>

      {/* Course-wise Attendance */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Course-wise Breakdown</h2>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-700 rounded w-1/2 mb-4" />
                  <div className="h-3 bg-slate-700 rounded w-full mb-2" />
                  <div className="h-3 bg-slate-700 rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data?.courses?.map((course) => {
              const status = getBunkStatus(course);
              return (
                <Card key={course.courseCode} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-white">{course.courseCode}</h3>
                        <p className="text-sm text-slate-400">{course.courseName}</p>
                      </div>
                      <span className={`text-2xl font-bold ${getAttendanceColor(course.percentage)}`}>
                        {course.percentage.toFixed(1)}%
                      </span>
                    </div>

                    <Progress
                      value={course.percentage}
                      className="h-2 bg-slate-700 mb-4"
                    />

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">
                        {course.attendedClasses} / {course.totalClasses} classes
                      </span>
                      <span className={status.color}>{status.text}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-6 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-slate-300">≥85% (Safe)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-slate-300">75-84% (Warning)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-slate-300">&lt;75% (Critical)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
