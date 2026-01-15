'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface DashboardData {
  attendance: {
    overallPercentage: number;
  };
  cgpa: {
    currentCGPA: number;
  };
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      // Fetch multiple endpoints in parallel
      const [attendanceRes, cgpaRes] = await Promise.all([
        apiClient.get('/attendance').catch(() => ({ data: { overallPercentage: 0 } })),
        apiClient.get('/cgpa').catch(() => ({ data: { currentCGPA: 0 } })),
      ]);
      return {
        attendance: attendanceRes.data,
        cgpa: cgpaRes.data,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const quickStats = [
    {
      title: 'Attendance',
      value: data?.attendance?.overallPercentage ?? '--',
      suffix: '%',
      description: 'Overall attendance',
      href: '/dashboard/attendance',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'CGPA',
      value: data?.cgpa?.currentCGPA ?? '--',
      suffix: '',
      description: 'Current CGPA',
      href: '/dashboard/cgpa',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Timetable',
      value: '📋',
      suffix: '',
      description: 'View schedule',
      href: '/dashboard/timetable',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Internals',
      value: '📝',
      suffix: '',
      description: 'View marks',
      href: '/dashboard/internals',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400">Welcome back! Here's your overview.</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-400">
                  {stat.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {isLoading ? '...' : stat.value}
                  </span>
                  <span className="text-slate-400">{stat.suffix}</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Attendance Overview */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Attendance Overview</CardTitle>
          <CardDescription className="text-slate-400">
            Your overall attendance progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Overall Attendance</span>
              <span className="text-sm font-medium text-white">
                {isLoading ? '...' : `${data?.attendance?.overallPercentage ?? 0}%`}
              </span>
            </div>
            <Progress
              value={data?.attendance?.overallPercentage ?? 0}
              className="h-3 bg-slate-700"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>0%</span>
              <span className="text-yellow-500">75% (Required)</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link
              href="/dashboard/attendance"
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
            >
              <span className="text-2xl">📅</span>
              <div>
                <p className="font-medium text-white">Check Bunks</p>
                <p className="text-sm text-slate-400">See how many classes you can skip</p>
              </div>
            </Link>
            <Link
              href="/dashboard/timetable"
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
            >
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-medium text-white">View Exams</p>
                <p className="text-sm text-slate-400">Upcoming exam schedule</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">CGPA Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                {isLoading ? '...' : (data?.cgpa?.currentCGPA ?? '--')}
              </div>
              <p className="text-slate-400 mt-2">Current CGPA</p>
              <Link
                href="/dashboard/cgpa"
                className="inline-block mt-4 text-purple-400 hover:text-purple-300 text-sm"
              >
                View semester-wise breakdown →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
