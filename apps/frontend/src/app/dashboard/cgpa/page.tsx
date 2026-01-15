'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import type { CGPAResponse, SemesterGPA } from '@nimora/shared-types';

export default function CGPAPage() {
  const { data, isLoading, error } = useQuery<CGPAResponse>({
    queryKey: ['cgpa'],
    queryFn: async () => {
      const response = await apiClient.get('/cgpa');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const getGPAColor = (gpa: number) => {
    if (gpa >= 9) return 'text-green-400';
    if (gpa >= 8) return 'text-blue-400';
    if (gpa >= 7) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getGradeFromGPA = (gpa: number): string => {
    if (gpa >= 9) return 'O';
    if (gpa >= 8) return 'A';
    if (gpa >= 7) return 'B+';
    if (gpa >= 6) return 'B';
    if (gpa >= 5) return 'C';
    return 'RA';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">CGPA</h1>
        <p className="text-slate-400">Your academic performance overview</p>
      </div>

      {/* Current CGPA */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-purple-900/30 border-slate-700">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-slate-400 mb-2">Current CGPA</p>
            <div className="text-7xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {isLoading ? '...' : data?.currentCGPA?.toFixed(2) ?? '--'}
            </div>
            <div className="mt-4 flex justify-center gap-8 text-sm">
              <div>
                <span className="text-slate-400">Semesters: </span>
                <span className="text-white font-medium">
                  {data?.completedSemesters ?? '--'}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Credits: </span>
                <span className="text-white font-medium">
                  {data?.totalCredits ?? '--'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Semester-wise GPA */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Semester-wise Performance</CardTitle>
          <CardDescription className="text-slate-400">
            GPA progression across semesters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-slate-700/50 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {data?.semesterWise?.map((sem: SemesterGPA) => (
                <div
                  key={sem.semester}
                  className={`p-4 rounded-lg border ${
                    sem.isPending
                      ? 'bg-slate-700/30 border-slate-600'
                      : 'bg-slate-700/50 border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">
                        Semester {sem.semester}
                        {sem.isPending && (
                          <span className="ml-2 text-xs text-yellow-400">(Pending)</span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-400">{sem.credits} Credits</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getGPAColor(sem.gpa)}`}>
                        {sem.isPending ? '--' : sem.gpa.toFixed(2)}
                      </div>
                      <p className="text-sm text-slate-400">
                        CGPA: {sem.isPending ? '--' : sem.cgpa.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* GPA Bar */}
                  {!sem.isPending && (
                    <div className="mt-3">
                      <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            sem.gpa >= 9
                              ? 'bg-green-500'
                              : sem.gpa >= 8
                              ? 'bg-blue-500'
                              : sem.gpa >= 7
                              ? 'bg-yellow-500'
                              : 'bg-orange-500'
                          }`}
                          style={{ width: `${(sem.gpa / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Distribution */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Grade Point Reference</CardTitle>
          <CardDescription className="text-slate-400">
            Grade to grade point mapping
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { grade: 'O', point: 10, color: 'text-green-400' },
              { grade: 'A+', point: 9, color: 'text-green-400' },
              { grade: 'A', point: 8, color: 'text-blue-400' },
              { grade: 'B+', point: 7, color: 'text-yellow-400' },
              { grade: 'B', point: 6, color: 'text-yellow-400' },
              { grade: 'C', point: 5, color: 'text-orange-400' },
            ].map(({ grade, point, color }) => (
              <div key={grade} className="text-center p-3 bg-slate-700/50 rounded-lg">
                <div className={`text-2xl font-bold ${color}`}>{grade}</div>
                <div className="text-sm text-slate-400">{point} points</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Courses */}
      {data?.courses && data.courses.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">All Courses</CardTitle>
            <CardDescription className="text-slate-400">
              Complete list of courses with grades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Course</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Credits</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Grade</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {data.courses.map((course) => (
                    <tr key={course.courseCode} className="border-b border-slate-700/50">
                      <td className="py-3 px-4">
                        <div className="text-white font-medium">{course.courseCode}</div>
                        <div className="text-sm text-slate-400">{course.courseName}</div>
                      </td>
                      <td className="text-center py-3 px-4 text-slate-300">{course.credits}</td>
                      <td className={`text-center py-3 px-4 font-bold ${getGPAColor(course.gradePoint)}`}>
                        {course.grade}
                      </td>
                      <td className="text-center py-3 px-4 text-slate-300">{course.gradePoint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
