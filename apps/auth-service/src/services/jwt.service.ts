import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  userId: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface JwtVerifyResult {
  userId: string;
  username: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN'),
    });
  }

  generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow<string>(
        'JWT_REFRESH_EXPIRES_IN',
      ),
    });
  }

  verifyAccessToken(token: string): JwtVerifyResult | null {
    try {
      return this.jwtService.verify<JwtVerifyResult>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
    } catch {
      return null;
    }
  }

  verifyRefreshToken(token: string): JwtVerifyResult | null {
    try {
      return this.jwtService.verify<JwtVerifyResult>(token, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      return null;
    }
  }

  decodeToken(token: string): JwtVerifyResult | null {
    try {
      return this.jwtService.decode<JwtVerifyResult>(token);
    } catch {
      return null;
    }
  }
}
