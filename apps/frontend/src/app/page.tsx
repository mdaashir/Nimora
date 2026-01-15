import Link from 'next/link';
import { GraduationCap, BookOpen, Calendar, Award, ClipboardList, MessageSquare } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Attendance',
    description: 'Track your attendance and know how many classes you can bunk',
    href: '/attendance',
    color: 'text-blue-500',
  },
  {
    icon: Award,
    title: 'CGPA',
    description: 'View your CGPA, semester-wise GPA, and grade distribution',
    href: '/cgpa',
    color: 'text-purple-500',
  },
  {
    icon: Calendar,
    title: 'Timetable',
    description: 'Check your exam schedule and class timetable',
    href: '/timetable',
    color: 'text-green-500',
  },
  {
    icon: ClipboardList,
    title: 'Internals',
    description: 'View internal marks and calculate required end semester marks',
    href: '/internals',
    color: 'text-orange-500',
  },
  {
    icon: MessageSquare,
    title: 'Feedback',
    description: 'Automate feedback submission with one click',
    href: '/feedback',
    color: 'text-pink-500',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 nimora-gradient opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-3 rounded-full bg-white/80 dark:bg-slate-800/80 px-6 py-3 shadow-lg backdrop-blur">
                <GraduationCap className="h-10 w-10 text-primary" />
                <span className="text-3xl font-bold nimora-gradient-text">
                  Nimora
                </span>
              </div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">Your Modern</span>
              <span className="block nimora-gradient-text">Student Portal</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Track attendance, view CGPA, check timetables, and more.
              All your academic information in one beautiful interface.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center rounded-lg nimora-gradient px-8 py-3 text-base font-medium text-white shadow-lg hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-8 py-3 text-base font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Everything you need
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Access all your academic information with ease
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-200"
            >
              <div className={`inline-flex rounded-lg p-3 ${feature.color} bg-opacity-10`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-semibold text-slate-900 dark:text-white">
                Nimora
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} Nimora. Built for PSG Tech students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
