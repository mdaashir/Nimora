'use client';

import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4">
          <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-lg">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Critical Error
              </h1>
              <p className="mt-2 text-gray-600">
                A critical error occurred. Please try refreshing the page.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 rounded-lg bg-gray-100 p-4 text-left">
                  <p className="text-sm font-medium text-gray-700">
                    Error details:
                  </p>
                  <p className="mt-1 text-sm text-gray-600 font-mono">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="mt-2 text-xs text-gray-500">
                      Digest: {error.digest}
                    </p>
                  )}
                </div>
              )}
              <button
                onClick={reset}
                className="mt-6 inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
