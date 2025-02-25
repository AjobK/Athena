import {
  Body,
  Controller,
  ForbiddenException,
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

    const account = await this.authorizationService.getAccountProfileAndRoleByEmail(loginDTO.email)

    if (!account) throw new ForbiddenException({ errors: ['Incorrect email or password'] })

    const loginResponse = await this.authorizationService.login(account, loginDTO.password)

    if (req.cookies['token']) res.clearCookie('token')

    this.setJWTCookieHeader(res, loginResponse.token)

    res.status(200).json({
      user: loginResponse.account
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
