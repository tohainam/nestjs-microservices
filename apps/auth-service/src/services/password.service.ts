import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class PasswordService {
  private readonly saltLength = 32; // 256 bits
  private readonly hashLength = 64; // 512 bits
  private readonly iterations = 100000; // PBKDF2 iterations
  private readonly algorithm = 'sha512';

  async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Generate a random salt
      const salt = crypto.randomBytes(this.saltLength);
      
      // Use PBKDF2 to hash the password
      crypto.pbkdf2(password, salt, this.iterations, this.hashLength, this.algorithm, (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Combine salt and hash with iterations count
        // Format: iterations:salt:hash (all in hex)
        const result = `${this.iterations.toString(16)}:${salt.toString('hex')}:${derivedKey.toString('hex')}`;
        resolve(result);
      });
    });
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        // Parse the stored hash format: iterations:salt:hash
        const parts = hashedPassword.split(':');
        if (parts.length !== 3) {
          resolve(false);
          return;
        }

        const iterations = parseInt(parts[0], 16);
        const salt = Buffer.from(parts[1], 'hex');
        const storedHash = parts[2];

        // Hash the provided password with the same parameters
        crypto.pbkdf2(password, salt, iterations, this.hashLength, this.algorithm, (err, derivedKey) => {
          if (err) {
            reject(err);
            return;
          }

          // Compare the hashes
          const providedHash = derivedKey.toString('hex');
          resolve(storedHash === providedHash);
        });
      } catch (error) {
        resolve(false);
      }
    });
  }

  validatePassword(password: string): boolean {
    // Basic password validation
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  }

  // Helper method to generate a secure random password
  generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one character from each required category
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Upper case
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lower case
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special char
    
    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password to avoid predictable patterns
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}
