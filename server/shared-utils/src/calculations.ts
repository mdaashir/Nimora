// Calculation utilities for academic data

import { GRADE_POINTS } from '@nimora/shared-types';

/**
 * Calculate how many classes can be bunked while maintaining threshold
 * Formula: ((attended / total) * 100 >= threshold)
 * We need: (attended / (total + x)) * 100 >= threshold
 * Solving for x: x <= (attended * 100 / threshold) - total
 */
export function calculateBunkableClasses(
  attended: number,
  total: number,
  threshold: number = 75
): number {
  if (threshold <= 0 || threshold > 100) return 0;
  if (total === 0) return 0;

  const currentPercentage = (attended / total) * 100;
  if (currentPercentage < threshold) return 0;

  const maxTotal = (attended * 100) / threshold;
  const bunkable = Math.floor(maxTotal - total);
  return Math.max(0, bunkable);
}

/**
 * Calculate classes needed to reach threshold
 */
export function calculateClassesNeeded(
  attended: number,
  total: number,
  threshold: number = 75
): number {
  if (threshold <= 0 || threshold > 100) return 0;

  const currentPercentage = total > 0 ? (attended / total) * 100 : 0;
  if (currentPercentage >= threshold) return 0;

  // Formula: (attended + x) / (total + x) >= threshold / 100
  // Solving for x: x >= (threshold * total - 100 * attended) / (100 - threshold)
  const needed = Math.ceil(
    (threshold * total - 100 * attended) / (100 - threshold)
  );
  return Math.max(0, needed);
}

/**
 * Calculate attendance percentage
 */
export function calculateAttendancePercentage(
  attended: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((attended / total) * 100 * 100) / 100;
}

/**
 * Calculate CGPA from semester GPAs
 */
export function calculateCGPA(
  semesterGPAs: Array<{ gpa: number; credits: number }>
): number {
  const totalCredits = semesterGPAs.reduce((sum, s) => sum + s.credits, 0);
  if (totalCredits === 0) return 0;

  const weightedSum = semesterGPAs.reduce(
    (sum, s) => sum + s.gpa * s.credits,
    0
  );
  return Math.round((weightedSum / totalCredits) * 100) / 100;
}

/**
 * Get grade point from grade string
 */
export function getGradePoint(grade: string): number {
  const upperGrade = grade.toUpperCase().trim();
  return GRADE_POINTS[upperGrade] ?? 0;
}

/**
 * Calculate required end semester marks to achieve target grade
 * Internal weightage: 40%, End sem weightage: 60%
 * Pass mark: 50/100 total
 */
export function calculateRequiredEndsem(
  internalMarks: number,
  maxInternal: number = 40,
  targetTotal: number = 50,
  endsemMax: number = 60
): number | null {
  // Normalize internal to 40 (40% weightage)
  const normalizedInternal = (internalMarks / maxInternal) * 40;

  // Max possible endsem contribution is 60 (60% weightage)
  const maxEndsemContribution = 60;

  // Check if target is achievable
  const maxPossible = normalizedInternal + maxEndsemContribution;
  if (targetTotal > maxPossible) return null; // Not achievable

  const requiredEndsem = targetTotal - normalizedInternal;

  if (requiredEndsem <= 0) return 0;

  // Convert required marks to percentage of actual endsem max
  return Math.ceil((requiredEndsem / 60) * endsemMax);
}
