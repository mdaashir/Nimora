import { isValidRollNumber, isValidPassword, sanitizeInput } from './validation';

describe('Validation Utils', () => {
  describe('isValidRollNumber', () => {
    it('should accept valid roll numbers', () => {
      expect(isValidRollNumber('22Z209')).toBe(true);
      expect(isValidRollNumber('21z101')).toBe(true);
      expect(isValidRollNumber('20A999')).toBe(true);
      expect(isValidRollNumber('23B001')).toBe(true);
    });

    it('should reject invalid roll numbers', () => {
      expect(isValidRollNumber('')).toBe(false);
      expect(isValidRollNumber('ABC')).toBe(false);
      expect(isValidRollNumber('12345')).toBe(false);
      expect(isValidRollNumber('22Z')).toBe(false);
      expect(isValidRollNumber('22Z20900')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should accept valid passwords', () => {
      expect(isValidPassword('password123')).toBe(true);
      expect(isValidPassword('MySecureP@ss')).toBe(true);
      expect(isValidPassword('short1')).toBe(true);
    });

    it('should reject invalid passwords', () => {
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword('12345')).toBe(false); // too short
      expect(isValidPassword('a'.repeat(101))).toBe(false); // too long
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
    });

    it('should remove HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    });

    it('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });
});
