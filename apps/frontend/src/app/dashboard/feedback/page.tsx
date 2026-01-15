'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';

interface FeedbackOption {
  id: string;
  label: string;
  value: number;
}

const feedbackOptions: FeedbackOption[] = [
  { id: 'excellent', label: 'Excellent', value: 5 },
  { id: 'very-good', label: 'Very Good', value: 4 },
  { id: 'good', label: 'Good', value: 3 },
  { id: 'satisfactory', label: 'Satisfactory', value: 2 },
  { id: 'poor', label: 'Poor', value: 1 },
];

export default function FeedbackPage() {
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async (rating: number) => {
      const response = await apiClient.post('/feedback/submit', { rating });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Feedback submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    },
  });

  const handleAutoFill = async () => {
    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync(selectedRating);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Feedback</h1>
        <p className="text-slate-400">Auto-fill course feedback forms</p>
      </div>

      {/* Warning Card */}
      <Card className="bg-yellow-500/10 border-yellow-500/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-400">Important Notice</h3>
              <p className="text-sm text-yellow-200/80">
                This feature will automatically submit feedback for all your courses with the selected
                rating. Make sure you want to proceed before clicking the submit button.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Selection */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Select Rating</CardTitle>
          <CardDescription className="text-slate-400">
            Choose the rating to apply to all courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {feedbackOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedRating(option.value)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedRating === option.value
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'
                }`}
              >
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${
                      selectedRating === option.value ? 'text-purple-400' : 'text-slate-300'
                    }`}
                  >
                    {option.value}
                  </div>
                  <p
                    className={`text-sm ${
                      selectedRating === option.value ? 'text-purple-300' : 'text-slate-400'
                    }`}
                  >
                    {option.label}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <Button
              onClick={handleAutoFill}
              disabled={isSubmitting || submitMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting || submitMutation.isPending
                ? 'Submitting...'
                : 'Submit Feedback for All Courses'}
            </Button>
            <p className="text-sm text-slate-400">
              Selected rating: <span className="text-white font-medium">{selectedRating}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-purple-500/20 text-purple-400 rounded-full text-sm">
                1
              </span>
              <span>Select your preferred rating from the options above</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-purple-500/20 text-purple-400 rounded-full text-sm">
                2
              </span>
              <span>Click the submit button to auto-fill feedback for all courses</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-purple-500/20 text-purple-400 rounded-full text-sm">
                3
              </span>
              <span>The system will navigate to each course feedback page and submit the rating</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-purple-500/20 text-purple-400 rounded-full text-sm">
                4
              </span>
              <span>Wait for the process to complete - this may take a few minutes</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <p className="text-sm text-slate-400 text-center">
            🔒 Your eCampus credentials are encrypted and never stored in plain text. All operations
            are performed securely.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
