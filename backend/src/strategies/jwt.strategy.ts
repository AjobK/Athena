import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtPayload } from '../interfaces/jwt-payload.interface'
import { Account } from '../entities/account.entity'
import { AuthService } from '../services/auth.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authorizationService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request.cookies?.token
        },
      ]),
    })
  }

  public async validate(payload: JwtPayload): Promise<Account> {
    const { email } = payload

    const account = await this.authorizationService.getAccountByEmail(email)

    if (!account) {
      throw new UnauthorizedException('Missing or invalid token')
    }

    return account
  }
}
