import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await service.hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(password);
      
      // Should follow the format: iterations:salt:hash
      const parts = hashedPassword.split(':');
      expect(parts).toHaveLength(3);
      expect(parseInt(parts[0], 16)).toBe(100000); // iterations
      expect(parts[1]).toHaveLength(64); // salt (32 bytes = 64 hex chars)
      expect(parts[2]).toHaveLength(128); // hash (64 bytes = 128 hex chars)
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await service.hashPassword(password);
      const hash2 = await service.hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await service.hashPassword(password);
      
      const result = await service.comparePassword(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hashedPassword = await service.hashPassword(password);
      
      const result = await service.comparePassword(wrongPassword, hashedPassword);
      expect(result).toBe(false);
    });

    it('should return false for malformed hash', async () => {
      const password = 'TestPassword123!';
      const malformedHash = 'invalid:hash:format';
      
      const result = await service.comparePassword(password, malformedHash);
      expect(result).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate a strong password', () => {
      const strongPassword = 'StrongPass123!';
      const result = service.validatePassword(strongPassword);
      expect(result).toBe(true);
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'short', // too short
        'nouppercase123!', // no uppercase
        'NOLOWERCASE123!', // no lowercase
        'NoNumbers!', // no numbers
        'NoSpecial123', // no special characters
      ];

      weakPasswords.forEach(password => {
        const result = service.validatePassword(password);
        expect(result).toBe(false);
      });
    });
  });

  describe('generateSecurePassword', () => {
    it('should generate a password of specified length', () => {
      const length = 20;
      const password = service.generateSecurePassword(length);
      expect(password).toHaveLength(length);
    });

    it('should generate a password with default length', () => {
      const password = service.generateSecurePassword();
      expect(password).toHaveLength(16);
    });

    it('should generate a password with all required character types', () => {
      const password = service.generateSecurePassword(20);
      
      expect(/[A-Z]/.test(password)).toBe(true); // uppercase
      expect(/[a-z]/.test(password)).toBe(true); // lowercase
      expect(/\d/.test(password)).toBe(true); // numbers
      expect(/[!@#$%^&*]/.test(password)).toBe(true); // special chars
    });
  });
});
