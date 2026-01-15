'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface LoginCredentials {
  rollno: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    rollno: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Add effect to handle viewport adjustments on mobile
  useEffect(() => {
    const updateViewportHeight = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    return () => window.removeEventListener('resize', updateViewportHeight);
  }, []);

  // Handle input focus state for mobile
  useEffect(() => {
    if (isInputFocused) {
      document.body.classList.add('input-focused');
      const loginContainer = document.querySelector('.login-container');
      if (loginContainer) {
        loginContainer.classList.add('active');
      }
    } else {
      document.body.classList.remove('input-focused');
      const loginContainer = document.querySelector('.login-container');
      if (loginContainer) {
        loginContainer.classList.remove('active');
      }
    }
  }, [isInputFocused]);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginCredentials) => {
      const response = await apiClient.post('/auth/login', {
        email: `${data.rollno.toLowerCase()}@psgtech.ac.in`,
        rollno: data.rollno.toLowerCase(),
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Login successful!');
      router.push('/dashboard');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!credentials.rollno || !credentials.password) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate roll number format
    const sanitizedRollNo = credentials.rollno.toLowerCase().trim();
    if (!/^[a-z0-9]+$/i.test(sanitizedRollNo)) {
      toast.error('Please enter a valid roll number');
      return;
    }

    loginMutation.mutate(credentials);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#111418] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBmthQzGCvaiD9b2_Evv3ffGwgO48Tmsz7ugSLIsvL9r3NBZUTV4qN615RiPaWay0VknPl_Q0gD3kQOxRU4vgLJFL-7i_tRS_QImCmCiWu-Q3uIikovSr1K2haRBTF1FinTNeHYmD8-di4Zi4-f3_anrM6wFTJZYkX_zxyBidpx9Q0isTNOsNpAr_o9x9yj-1O1kHKSPfLDvIkHAAVcSHfWcRvb2W0e6kEF5ucWpIVwGZXsDEzw991Q3XUjtEzNFB_9x72LYli-E4o')",
        }}
      >
        <div className="absolute inset-0 bg-slate-900/85"></div>
      </div>
      <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-[#1a202c]/80 backdrop-blur-sm rounded-2xl shadow-2xl login-container">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">Skipp</h1>
          <p className="mt-2 text-lg text-gray-300">Track Your Attendance</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="sr-only" htmlFor="roll-no">
              Roll No
            </label>
            <input
              className="form-input block w-full appearance-none rounded-lg border-2 border-[#2d3748] bg-[#2d3748] px-4 py-3.5 text-white placeholder-gray-400 shadow-sm focus:border-[#1173d4] focus:ring-0"
              id="roll-no"
              name="roll-no"
              placeholder="Roll No"
              required
              type="text"
              value={credentials.rollno}
              onChange={(e) => setCredentials({ ...credentials, rollno: e.target.value })}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              disabled={loginMutation.isPending}
            />
          </div>
          <div className="relative">
            <label className="sr-only" htmlFor="password">
              Password
            </label>
            <input
              className="form-input block w-full appearance-none rounded-lg border-2 border-[#2d3748] bg-[#2d3748] px-4 py-3.5 text-white placeholder-gray-400 shadow-sm focus:border-[#1173d4] focus:ring-0 pr-12"
              id="password"
              name="password"
              placeholder="Password"
              required
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              disabled={loginMutation.isPending}
            />
            {showPassword ? (
              <EyeOff
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-white transition-colors duration-300"
                onClick={() => setShowPassword(!showPassword)}
              />
            ) : (
              <Eye
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-white transition-colors duration-300"
                onClick={() => setShowPassword(!showPassword)}
              />
            )}
          </div>

          <div className="flex items-center justify-center text-xs text-gray-400 bg-blue-900/30 p-2 rounded-md border border-blue-800/50">
            <Shield className="h-3 w-3 text-blue-400 mr-1" />
            <span>Password is encrypted</span>
          </div>

          <div>
            <button
              className="flex w-full justify-center rounded-lg bg-[#1173d4] px-4 py-3.5 text-base font-semibold leading-6 text-white shadow-sm hover:bg-linear-to-r hover:from-[#1173d4] hover:to-[#0f6ac0] hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1173d4] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              type="submit"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-t border-gray-700/50">
        <div className="max-w-md mx-auto px-8 py-4">
          <p className="text-center text-gray-400 text-sm">
            © {currentYear} Skipp. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
