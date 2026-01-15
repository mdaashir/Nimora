import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <FileQuestion className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Page not found
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It
            might have been moved or doesn&apos;t exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-gray-100 p-4 text-center">
            <p className="text-7xl font-bold text-gray-300">404</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full" size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full" size="lg">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
