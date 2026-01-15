'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import type { ExamScheduleResponse } from '@nimora/shared-types';

export default function TimetablePage() {
  const { data, isLoading } = useQuery<ExamScheduleResponse>({
    queryKey: ['timetable'],
    queryFn: async () => {
      const response = await apiClient.get('/timetable/exams');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const formatDate = (dateStr: string): string => {
    try {
      // Try to parse various date formats
      const parts = dateStr.split(/[/\-\.]/);
      if (parts.length === 3) {
        // Assume DD/MM/YYYY or similar
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        const date = new Date(year < 100 ? year + 2000 : year, month, day);
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
      }
    } catch {
      // Return original if parsing fails
    }
    return dateStr;
  };

  const getDaysUntil = (dateStr: string): number | null => {
    try {
      const parts = dateStr.split(/[/\-\.]/);
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        const examDate = new Date(year < 100 ? year + 2000 : year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diff = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
      }
    } catch {
      // Return null if parsing fails
    }
    return null;
  };

  const getUrgencyColor = (daysUntil: number | null): string => {
    if (daysUntil === null) return 'border-slate-600';
    if (daysUntil <= 0) return 'border-red-500 bg-red-500/10';
    if (daysUntil <= 3) return 'border-red-400 bg-red-500/5';
    if (daysUntil <= 7) return 'border-yellow-400 bg-yellow-500/5';
    return 'border-slate-600';
  };

  const sortedExams = data?.exams
    ?.map((exam) => ({ ...exam, daysUntil: getDaysUntil(exam.date) }))
    ?.sort((a, b) => {
      if (a.daysUntil === null) return 1;
      if (b.daysUntil === null) return -1;
      return a.daysUntil - b.daysUntil;
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Timetable</h1>
        <p className="text-slate-400">Upcoming exams and schedules</p>
      </div>

      {/* Exam Schedule */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Exam Schedule</CardTitle>
          <CardDescription className="text-slate-400">
            Upcoming internal and external exams
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-slate-700/50 rounded animate-pulse" />
              ))}
            </div>
          ) : sortedExams && sortedExams.length > 0 ? (
            <div className="space-y-4">
              {sortedExams.map((exam, index) => {
                const urgencyClass = getUrgencyColor(exam.daysUntil);
                return (
                  <div
                    key={`${exam.courseCode}-${index}`}
                    className={`p-4 rounded-lg border ${urgencyClass}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-white">{exam.courseCode}</h3>
                        <p className="text-sm text-slate-400">{exam.courseName}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-slate-400">Date</p>
                          <p className="text-white font-medium">{formatDate(exam.date)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400">Time</p>
                          <p className="text-white font-medium">{exam.time}</p>
                        </div>
                        {exam.daysUntil !== null && (
                          <div className="text-center">
                            <p className="text-slate-400">Days Left</p>
                            <p
                              className={`font-bold ${
                                exam.daysUntil <= 0
                                  ? 'text-red-400'
                                  : exam.daysUntil <= 3
                                  ? 'text-red-400'
                                  : exam.daysUntil <= 7
                                  ? 'text-yellow-400'
                                  : 'text-green-400'
                              }`}
                            >
                              {exam.daysUntil <= 0 ? 'Today!' : exam.daysUntil}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    {exam.venue && (
                      <p className="mt-2 text-sm text-slate-400">
                        Venue: <span className="text-slate-300">{exam.venue}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl">📚</span>
              <p className="mt-4 text-slate-400">No upcoming exams scheduled</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-6 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-slate-300">Within 3 days</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-slate-300">Within 7 days</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-500" />
              <span className="text-slate-300">More than 7 days</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
