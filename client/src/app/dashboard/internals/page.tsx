'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/lib/api-client';
import type { InternalsResponse } from '@nimora/types';

export default function InternalsPage() {
  const { data, isLoading } = useQuery<InternalsResponse>({
    queryKey: ['internals'],
    queryFn: async () => {
      const response = await apiClient.get('/internals');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Internal Marks</h1>
        <p className="text-slate-400">Your continuous assessment scores</p>
      </div>

      {/* Overview */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Overview</CardTitle>
          <CardDescription className="text-slate-400">
            Summary of your internal marks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-slate-700/50 rounded-lg">
              <div className="text-3xl font-bold text-purple-400">
                {isLoading ? '...' : data?.courses?.length ?? '--'}
              </div>
              <p className="text-slate-400 text-sm">Courses</p>
            </div>
            <div className="text-center p-4 bg-slate-700/50 rounded-lg">
              <div className="text-3xl font-bold text-cyan-400">
                {isLoading
                  ? '...'
                  : data?.courses
                  ? `${(
                      (data.courses.reduce((sum, c) => sum + c.totalObtained, 0) /
                        data.courses.reduce((sum, c) => sum + c.totalMax, 0)) *
                      100
                    ).toFixed(1)}%`
                  : '--'}
              </div>
              <p className="text-slate-400 text-sm">Average Score</p>
            </div>
            <div className="text-center p-4 bg-slate-700/50 rounded-lg">
              <div className="text-3xl font-bold text-green-400">
                {isLoading
                  ? '...'
                  : data?.courses
                  ? data.courses.filter((c) => (c.totalObtained / c.totalMax) * 100 >= 60).length
                  : '--'}
              </div>
              <p className="text-slate-400 text-sm">Passing Courses</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course-wise Marks */}
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
      ) : data?.courses && data.courses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {data.courses.map((course) => {
            const percentage = (course.totalObtained / course.totalMax) * 100;
            return (
              <Card key={course.courseCode} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-white">{course.courseCode}</h3>
                      <p className="text-sm text-slate-400">{course.courseName}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${getPercentageColor(percentage)}`}>
                        {percentage.toFixed(1)}%
                      </span>
                      <p className="text-sm text-slate-400">
                        {course.totalObtained} / {course.totalMax}
                      </p>
                    </div>
                  </div>

                  <Progress
                    value={percentage}
                    className="h-2 bg-slate-700 mb-4"
                  />

                  {/* Individual marks breakdown */}
                  {course.marks.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Breakdown</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {course.marks.map((mark, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center bg-slate-700/50 p-2 rounded"
                          >
                            <span className="text-slate-300">{mark.testName}</span>
                            <span className={getPercentageColor(mark.percentage)}>
                              {mark.obtainedMarks}/{mark.maxMarks}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8">
            <div className="text-center">
              <span className="text-4xl">📝</span>
              <p className="mt-4 text-slate-400">No internal marks available yet</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-6 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-slate-300">≥80% (Excellent)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-slate-300">60-79% (Good)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-slate-300">40-59% (Average)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-slate-300">&lt;40% (Low)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
