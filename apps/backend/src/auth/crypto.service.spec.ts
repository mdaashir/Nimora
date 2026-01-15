import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-encryption-key-32-characters!!'),
          },
        },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt a string correctly', () => {
      const plaintext = 'test-password-123';
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(encrypted).not.toBe(plaintext);
      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertexts for the same plaintext', () => {
      const plaintext = 'test-password-123';
      const encrypted1 = service.encrypt(plaintext);
      const encrypted2 = service.encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle special characters', () => {
      const plaintext = 'p@$$w0rd!@#$%^&*()';
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle unicode characters', () => {
      const plaintext = 'test-密码-пароль-🔐';
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe('hash', () => {
    it('should produce consistent hashes for the same input', () => {
      const input = 'test-value';
      const hash1 = service.hash(input);
      const hash2 = service.hash(input);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = service.hash('input1');
      const hash2 = service.hash('input2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateToken', () => {
    it('should generate a token of the specified length', () => {
      const token = service.generateToken(16);
      // 16 bytes = 32 hex characters
      expect(token.length).toBe(32);
    });

    it('should generate unique tokens', () => {
      const token1 = service.generateToken();
      const token2 = service.generateToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe('generateSessionId', () => {
    it('should generate a valid UUID', () => {
      const sessionId = service.generateSessionId();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(sessionId).toMatch(uuidRegex);
    });
  });

  describe('secureCompare', () => {
    it('should return true for equal strings', () => {
      expect(service.secureCompare('test', 'test')).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(service.secureCompare('test1', 'test2')).toBe(false);
    });

    it('should return false for strings of different lengths', () => {
      expect(service.secureCompare('test', 'testing')).toBe(false);
    });
  });
});
