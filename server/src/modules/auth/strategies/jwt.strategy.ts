import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'lingoshid-secret-key'),
    });
  }

  async validate(payload: any) {
    const user: any = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      firstName: payload.firstName,
      lastName: payload.lastName
    };

    // Add role-specific IDs if present in payload
    if (payload.studentId) {
      user.studentId = payload.studentId;
    }
    if (payload.teacherId) {
      user.teacherId = payload.teacherId;
    }
    if (payload.parentId) {
      user.parentId = payload.parentId;
    }

    return user;
  }
}