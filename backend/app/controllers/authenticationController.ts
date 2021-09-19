import { Request, Response } from 'express'
import AccountDAO from '../daos/accountDAO'
import RoleDAO from '../daos/roleDAO'
import * as bcrypt from 'bcrypt'
import { Account } from '../entities/account'
import BanService from '../utils/banService'
import ReCaptchaService from '../utils/ReCaptchaService'

const jwt = require('jsonwebtoken')

const expirationtimeInMs = process.env.JWT_EXPIRATION_TIME

require('dotenv').config()
const { SECURE } = process.env

class AuthenticationController {
    private accountDAO: AccountDAO
    private roleDAO: RoleDAO
    private banService: BanService
    private reCaptchaService: ReCaptchaService;

    constructor() {
      this.accountDAO = new AccountDAO()
      this.roleDAO = new RoleDAO()
      this.banService = new BanService()
      this.reCaptchaService = new ReCaptchaService()
    }

  public loginVerify = async (req: Request, res: Response): Promise<any> => {
    if (!req.cookies || !req.cookies.token) return res.status(401).json({ loggedIn: false })

    try {
      const account = await this.accountDAO.getAccountByUsername(
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).username
      )

      const profile = account.profile

      const role = await this.roleDAO.getRoleByUser(profile.display_name)

      profile['role'] = role.name

      return res.status(200).json({ loggedIn: true, profile: profile })
    } catch (error) {
      return res.status(401).send({ loggedIn: false })
    }
  }

  public login = async (req: Request, res: Response): Promise<any> => {
    const { username, password, recaptcha } = req.body

    let account = await this.accountDAO.getAccountByUsername(username)

    if (typeof username != 'string' || typeof username != 'string') return res.status(400).json({ loggedIn: false })

    if (account == null)
      return res.status(403).json({ errors: ['Incorrect username or password'] })

    if (account.locked_to - Date.now() > 0) {
      return res.status(403).send({
        errors: ['Too many login attempts'],
        remainingTime:  Math.floor((account.locked_to - Date.now()) / 1000)
      })
    } else {
      const isRecaptchaValid = await this.reCaptchaService.isCaptchaValid(recaptcha)

      if (isRecaptchaValid) {
        return res.status(400).json({ errors: ['ReCaptcha invalid'] })
      }

      if (req.cookies['token']) res.clearCookie('token')

      const validation = this.validateAccountRequest(account, username, password)

      if (validation != null) return res.status(400).send(validation)

      const ban = await this.banService.checkIfUserIsBanned(account)

      if (ban) {
        return res.status(403).json({ errors: [ban] })
      }

      const role = await this.roleDAO.getRoleByUser(username)
      const payload = {
        role: role.id,
        username: username,
        expiration: Date.now() + parseInt(expirationtimeInMs),
      }

      const token = jwt.sign(JSON.stringify(payload), process.env.JWT_SECRET)

      account = this.cleanAccount(account)

      res.setHeader(
        'Set-Cookie',
        `token=${token}; HttpOnly; ${SECURE == 'true' ? 'Secure;' : ''} expires=${+new Date(
          new Date().getTime() + 86409000
        ).toUTCString()}; path=/`
      )
      res.status(200).json({ ...account, loggedIn: true })
      res.send()
    }
  }

  private validateAccountRequest = (account: Account, username, password): any => {
    try {
      if (username === account.user_name) {
        if (!bcrypt.compareSync(password, account.password)) {
          if (account.login_attempts_counts != 2) {
            account.login_attempts_counts++
            this.accountDAO.updateAccount(account)

            return { errors: ['Incorrect username or password'] }
          } else {
            account.login_attempts_counts = null
            account.locked_to = Date.now() + 30000
            this.accountDAO.updateAccount(account)
            const remainingTime = Math.floor((account.locked_to - Date.now()) / 1000)

            return { errors: ['Too many login attempts'], remainingTime: remainingTime }
          }
        } else {
          return null
        }
      } else {
        return { errors: ['Incorrect username or password'] }
      }
    } catch (error) {
      return { errors: ['Incorrect username or password'] }
    }
  }

  private cleanAccount = (account: Account): Account => {
    delete account.password
    delete account.changed_pw_at
    delete account.login_attempts_counts
    delete account.last_ip
    delete account.locked_to

    return account
  }

  public logout = (req: Request, res: Response): void => {
    if (req.cookies['token']) {
      res.clearCookie('token').status(200).json({
        message: 'You have logged out',
      })
    } else {
      res.status(401).json({
        error: 'Invalid jwt',
      })
    }
  }
}

export default AuthenticationController
