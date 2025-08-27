import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AuthServiceModule } from '@app/common';
import { User, UserSchema } from './entities/user.entity';
import { UserController } from './controllers/user.controller';
import { AuthController } from './controllers/auth.controller';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { JwtService } from './services/jwt.service';
import { PasswordService } from './services/password.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      cache: true,
      expandVariables: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
    AuthServiceModule,
  ],
  controllers: [UserController, AuthController],
  providers: [UserService, AuthService, JwtService, PasswordService],
})
export class AuthServiceModule {}
