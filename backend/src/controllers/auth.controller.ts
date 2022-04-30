import {
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { AuthService } from '../services/auth.service'
import { LoginDTO } from '../dtos/login.dto'
import { Profile } from '../entities/profile.entity'
import { CaptchaService } from '../services/captcha.service'
import { AllowAny } from '../decorators/allow-any.decorator'
import { VerifyPayloadDTO } from '../dtos/verify-payload.dto'

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(
    private readonly authorizationService: AuthService,
    private readonly captchaService: CaptchaService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/logout')
  public logout(@Req() req: Request, @Res() res: Response): Promise<string> {
    if (req.cookies['token']) {
      res.clearCookie('token').status(200).json({
        message: 'Succesfully logged out'
      })

      return
    }

    throw new UnauthorizedException('Invalid JWT')
  }

  @Get('/login-verify')
  @AllowAny()
  public async loginVerify(@Req() req: Request): Promise<{ profile: Profile, loggedIn: boolean }> {
    if (!req.cookies?.token) throw new UnauthorizedException({ loggedIn: false })

    try {
      const profile = await this.authorizationService.loginVerify(req.cookies.token)

      return {
        profile,
        loggedIn: true,
      }
    } catch {
      throw new UnauthorizedException({ loggedIn: false })
    }
  }

  @Post('/login')
  @AllowAny()
  public async login(@Req() req: Request, @Res() res: Response, @Body() loginDTO: LoginDTO): Promise<any> {
    const isCaptchaValid = await this.captchaService.verifyHCaptcha(loginDTO.captcha)

    if (!isCaptchaValid) throw new ForbiddenException('We could not verify that you are not a robot')

    const account = await this.authorizationService.getAccountByUsername(loginDTO.username)

    if (!account) throw new ForbiddenException({ errors: ['Incorrect username or password'] })

    const loginResponse = await this.authorizationService.login(account, loginDTO.password)

    if (req.cookies['token']) res.clearCookie('token')

    this.setJWTCookieHeader(res, loginResponse.token)

    res.status(200).json({
      user: loginResponse.account
    })

    res.send()
  }

  @Post('/account-verify/:code')
  @AllowAny()
  public async accountVerify(@Req() req: Request, @Res() res: Response): Promise<any> {
    const payload = await this.authorizationService.verifyAccount(req.params.code)

    if (!payload) throw new NotFoundException({ errors: ['The verification code is invalid'] })

    res.setHeader(
      'Set-Cookie',
      `token=${ payload.token }; HttpOnly; ${
        this.configService.get('SECURE') == 'true' ? 'secure;' : ''
      } expires=${ +new Date(new Date().getTime() + 86409000).toUTCString() }; path=/`
    )

    const publicPayload: VerifyPayloadDTO = {
      role: payload.role,
      profile: payload.profile,
      username: payload.username,
      email: payload.email,
    }

    res.status(200).json({
      user: publicPayload
    })

    res.send()
  }

  private setJWTCookieHeader(res: Response, token: string): Response {
    res.setHeader(
      'Set-Cookie',
      `token=${ token }; HttpOnly; ${ this.configService.get('SECURE') == 'true' ? 'Secure;' : '' } expires=${
        +new Date(new Date().getTime() + 86409000).toUTCString()}; path=/`
    )

    return res
  }
}
