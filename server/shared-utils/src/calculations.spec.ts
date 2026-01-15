import {
  calculateBunkableClasses,
  calculateClassesNeeded,
  calculateAttendancePercentage,
  calculateCGPA,
  calculateRequiredEndsem,
  getGradePoint,
} from './calculations';

describe('Calculations Utils', () => {
  describe('calculateAttendancePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculateAttendancePercentage(75, 100)).toBe(75);
      expect(calculateAttendancePercentage(30, 40)).toBe(75);
      expect(calculateAttendancePercentage(0, 100)).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(calculateAttendancePercentage(0, 0)).toBe(0);
      expect(calculateAttendancePercentage(100, 100)).toBe(100);
    });
  });

  describe('calculateBunkableClasses', () => {
    it('should return positive bunks when above threshold', () => {
      // 90/100 = 90%, threshold 75%
      const bunks = calculateBunkableClasses(90, 100, 75);
      expect(bunks).toBeGreaterThan(0);
    });

    it('should return 0 when exactly at threshold', () => {
      // 75/100 = 75%, threshold 75%
      const bunks = calculateBunkableClasses(75, 100, 75);
      expect(bunks).toBe(0);
    });

    it('should return 0 when below threshold', () => {
      // 70/100 = 70%, threshold 75%
      const bunks = calculateBunkableClasses(70, 100, 75);
      expect(bunks).toBe(0);
    });
  });

  describe('calculateClassesNeeded', () => {
    it('should return 0 when above threshold', () => {
      const needed = calculateClassesNeeded(90, 100, 75);
      expect(needed).toBe(0);
    });

    it('should return positive classes needed when below threshold', () => {
      // 70/100 = 70%, threshold 75%
      const needed = calculateClassesNeeded(70, 100, 75);
      expect(needed).toBeGreaterThan(0);
    });
  });

  describe('getGradePoint', () => {
    it('should return correct grade points', () => {
      expect(getGradePoint('O')).toBe(10);
      expect(getGradePoint('A+')).toBe(9);
      expect(getGradePoint('A')).toBe(8);
      expect(getGradePoint('B+')).toBe(7);
      expect(getGradePoint('B')).toBe(6);
      expect(getGradePoint('C')).toBe(5);
    });

    it('should return 0 for unknown grades', () => {
      expect(getGradePoint('RA')).toBe(0);
      expect(getGradePoint('U')).toBe(0);
      expect(getGradePoint('Unknown')).toBe(0);
    });
  });

  describe('calculateCGPA', () => {
    it('should calculate CGPA correctly', () => {
      const semesters = [
        { gpa: 8.5, credits: 20 },
        { gpa: 9.0, credits: 22 },
        { gpa: 8.8, credits: 21 },
      ];
      const cgpa = calculateCGPA(semesters);

      expect(cgpa).toBeGreaterThan(8);
      expect(cgpa).toBeLessThan(10);
    });

    it('should return 0 for empty semesters', () => {
      expect(calculateCGPA([])).toBe(0);
    });
  });

  describe('calculateRequiredEndsem', () => {
    it('should calculate required end semester marks', () => {
      // Internal: 40/50, target: 50/100
      const required = calculateRequiredEndsem(40, 50, 50, 100);
      expect(required).toBeDefined();
    });

    it('should return null if target is unachievable', () => {
      // Internal: 10/50, target: 100/100 (impossible)
      const required = calculateRequiredEndsem(10, 50, 100, 100);
      expect(required).toBeNull();
    });
  });
});
