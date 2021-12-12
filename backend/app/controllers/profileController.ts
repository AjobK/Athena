import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import isEmail from 'validator/lib/isEmail'
import * as bcrypt from 'bcrypt'
import Account from '../entities/account'
import Profile from '../entities/profile'
import Title from '../entities/title'
import RoleDao from '../daos/roleDAO'
import ProfileDAO from '../daos/profileDAO'
import TitleDAO from '../daos/titleDAO'
import AccountDAO from '../daos/accountDAO'
import attachmentDAO from '../daos/attachmentDAO'
import FileService from '../utils/fileService'
import Attachment from '../entities/attachment'
import ProfileFollowedBy from '../entities/profile_followed_by'
import BanService from '../utils/banService'
import CaptchaService from '../utils/captchaService'

const jwt = require('jsonwebtoken')

const matches = require('validator/lib/matches')

const isLength = require('validator/lib/isLength')

const expirationtimeInMs = process.env.JWT_EXPIRATION_TIME
const { SECURE } = process.env

const BANNER = 'banner'
const AVATAR = 'avatar'

class ProfileController {
  private dao: ProfileDAO
  private titleDAO: TitleDAO
  private accountDAO: AccountDAO
  private roleDAO: RoleDao
  private attachmentDAO: attachmentDAO
  private fileService: FileService
  private banService: BanService

  constructor() {
    this.dao = new ProfileDAO()
    this.titleDAO = new TitleDAO()
    this.accountDAO = new AccountDAO()
    this.roleDAO = new RoleDao()
    this.attachmentDAO = new attachmentDAO()
    this.fileService = new FileService()
    this.banService = new BanService()
  }

  public getFollowers = async (req: Request, res: Response): Promise<Response> => {
    const receivedUsername = this.getUsernameFromToken(req)

    if (!receivedUsername) {
      res.status(404).json({ error: 'No username was given' })
    }

    const profile = await this.dao.getProfileByUsername(receivedUsername)
    const followersById = await this.dao.getFollowersByProfileId(profile.id)

    const payload = {
      followers: []
    }

    followersById.forEach((entry) => {
      payload.followers.push(entry.follower)
    })

    if (payload.followers.length < 1) {
      return res.status(204).json(payload)
    }

    return res.status(200).json(payload)
  }

  public getFollowing = async (req: Request, res: Response): Promise<Response> => {
    const receivedUsername = this.getUsernameFromToken(req)

    if (!receivedUsername) {
      res.status(404).json({ error: 'No username was given' })
    }

    const profile = await this.dao.getProfileByUsername(receivedUsername)
    const followingById = await this.dao.getFollowingByProfileId(profile.id)

    const payload = followingById.map((entry) => entry.profile)

    if (payload.length < 1) {
      return res.status(204)
    }

    return res.status(200).json(payload)
  }

  private getUsernameFromToken = (req: Request) => {
    const { token } = req.cookies
    let decodedToken: any

    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
      decodedToken = null
    }

    const receivedUsername = req.params.username

    return receivedUsername || decodedToken?.username
  }

  public updateProfile = async (req: any, res: Response): Promise<Response> => {
    const updateUser = req.body

    if (req.decoded.username != updateUser.username) {
      return res.status(401).json({ error: 'Unauthorized' })
    } else if (req.decoded.username && req.file) {
      return await this.updateProfile(req.decoded.username, req.file)
    }

    const profile = await this.dao.getProfileByUsername(updateUser.username)

    for (let i = 0; i < Object.keys(updateUser).length; i++) {
      profile[Object.keys(updateUser)[i]] = updateUser[Object.keys(updateUser)[i]]
    }

    await this.dao.saveProfile(profile)

    return res.status(200).json({ message: 'Succes' })
  }

  public updateProfileAvatar = async (req: any, res: Response): Promise<Response> => {
    const isImage = await this.fileService.isImage(req.file)

    if (!isImage) {
      return res.status(400).json({ error: 'Only images are allowed' })
    } else {
      const avatar = await this.updateAttachment(req.decoded.username, req.file, AVATAR)

      return res.status(200).json({ message: 'success', url: 'http://localhost:8000/' + avatar.path })
    }
  }

  public updateProfileBanner = async (req: any, res: Response): Promise<Response> => {
    const isImage = await this.fileService.isImage(req.file)

    if (!isImage) {
      return res.status(400).json({ error: 'Only images are allowed' })
    } else {
      const banner = await this.updateAttachment(req.decoded.username, req.file, BANNER)

      return res.status(200).json({ message: 'success', url: 'http://localhost:8000/' + banner.path })
    }
  }

  public getProfile = async (req: Request, res: Response): Promise<Response> => {
    const { token } = req.cookies
    let decodedToken: any

    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
      decodedToken = null
    }

    let receivedUsername = req.params.username

    if (!receivedUsername) {
      if (decodedToken && decodedToken.username) {
        receivedUsername = decodedToken.username
      } else {
        return res.status(404).json({ error: 'No username was given' })
      }
    }

    const profile = await this.dao.getProfileByUsername(receivedUsername)

    if (!profile) return res.status(404).json({ message: 'User not found' })

    const account = await this.accountDAO.getAccountByUsername(profile.display_name)
    const ban = await this.banService.checkIfUserIsBanned(account)

    if (ban) return res.status(403).json({ errors: [ban] })

    const title: Title = (await this.titleDAO.getTitleByUserId(profile.id)) || null

    const followerCount = await this.dao.getFollowersCount(profile.id)
    const followingCount = await this.dao.getFollowingCount(profile.id)

    let isOwner = false

    if (receivedUsername && decodedToken) isOwner = receivedUsername == decodedToken.username

    let following = false
    let followsYou = false

    if (!isOwner && decodedToken && decodedToken.username) {
      const currentProfile: ProfileFollowedBy = new ProfileFollowedBy()
      const loggedInProfile: ProfileFollowedBy = new ProfileFollowedBy()

      const followingProfile = await this.dao.getProfileByUsername(decodedToken.username)

      currentProfile.follower = followingProfile.id
      currentProfile.profile = profile.id

      loggedInProfile.follower = profile.id
      loggedInProfile.profile = followingProfile.id

      following = await this.dao.isFollowing(currentProfile)
      followsYou = await this.dao.isFollowing(loggedInProfile)
    }

    const payload = {
      isOwner: isOwner,
      following: following,
      followsYou: followsYou,
      username: receivedUsername,
      title: title ? title.name : 'Title not found...',
      description: profile.description,
      followerCount,
      followingCount
    }
    const attachments = await this.dao.getProfileAttachments(profile.id)

    if (attachments.avatar) payload['avatar'] = 'http://localhost:8000/' + attachments.avatar.path

    if (attachments.banner) payload['banner'] = 'http://localhost:8000/' + attachments.banner.path

    return res.status(200).json({ profile: payload })
  }

  public register = async (req: any, res: Response): Promise<Response> => {
    const { username, email, password, captcha } = req.body

    const errors = {
      username: [],
      email: [],
      password: [],
      captcha: [],
    }

    const isUsernameNotValid = await this.checkValidUsername(username)

    if (isUsernameNotValid) {
      errors.username = [isUsernameNotValid]
    }

    const isEmailNotValid = await this.checkValidEmail(email)

    if (isEmailNotValid) {
      errors.email = [isEmailNotValid]
    }

    const passwordStrengthErrors = this.getPasswordStrengthErrors(password)

    errors.password = passwordStrengthErrors

    const isCaptchaValid = await CaptchaService.verifyHCaptcha(captcha)

    if (!isCaptchaValid) {
      errors.captcha = ['We couldn\'t verify that you\'re not a robot.']
    }

    if (isUsernameNotValid || isEmailNotValid || !isCaptchaValid || passwordStrengthErrors.length > 0) {
      return res.status(401).json({ errors: errors })
    }

    const createAccount = await this.saveProfile(req)

    const newAccount = this.cleanAccount(createAccount)

    const payload = {
      role: createAccount.role.id,
      username: createAccount.user_name,
      expiration: Date.now() + parseInt(expirationtimeInMs),
    }

    if (req.cookies['token']) res.clearCookie('token')

    const token = jwt.sign(JSON.stringify(payload), process.env.JWT_SECRET)

    res.setHeader(
      'Set-Cookie',
      `token=${token}; HttpOnly; ${SECURE == 'true' ? 'Secure;' : ''} expires=${+new Date(
        new Date().getTime() + 86409000
      ).toUTCString()}; path=/`
    )

    res.status(200).json({
      user: newAccount
    })
    res.send()

    return res
  }

  public follow = async (req: Request, res: Response): Promise<Response> => {
    const { token } = req.cookies
    let decodedToken: any

    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
      decodedToken = null

      return res.status(401).json({ error: 'Unauthorized' })
    }

    let follower: Profile | null = null

    if (decodedToken && decodedToken.username) {
      follower = await this.dao.getProfileByUsername(decodedToken.username)
    } else {
      return res.status(404).json({ error: 'No username to follow was given' })
    }

    let profile: Profile | null = null

    if (req.params.username) profile = await this.dao.getProfileByUsername(req.params.username)

    if (!follower || !profile)
      return res.status(422).json({ error: 'No profile to follow or follower found in request' })

    if (follower.id == profile.id) return res.status(422).json({ error: 'Following yourself is not possible' })

    const profileFollowedBy: ProfileFollowedBy = new ProfileFollowedBy()
    profileFollowedBy.follower = follower.id
    profileFollowedBy.profile = profile.id

    const followedProfile = await this.dao.follow(profileFollowedBy)

    return res
      .status(200)
      .json({ message: `Succesfully ${followedProfile ? '' : 'un'}followed profile`, following: followedProfile })
  }

  private updateAttachment = async (username, file, type): Promise<any> => {
    const profile = await this.dao.getProfileByUsername(username)
    const attachments = await this.dao.getProfileAttachments(profile.id)

    let attachment = attachments[type]
    let dimensions
    let typeDefaultPath = 'default/'
    let filePath

    if (type === AVATAR) {
      dimensions = 800
      filePath = 'profile/avatar'
      typeDefaultPath += 'defaultAvatar.png'
    } else if (type === BANNER) {
      dimensions = { width: +(800 * (16 / 9)).toFixed(), height: 800 }
      filePath = 'profile/banner'
      typeDefaultPath += 'defaultBanner.jpg'
    }

    const location = await this.fileService.storeImage(file, filePath)
    await this.fileService.convertImage(location, dimensions)

    if (attachment.path !== typeDefaultPath) {
      this.fileService.deleteImage(attachment.path)
      attachment.path = location

      return await this.attachmentDAO.saveAttachment(attachment)
    }

    let typeField
    if (type === AVATAR) typeField = 'avatar_attachment'
    else if (type === BANNER) typeField = 'banner_attachment'

    attachment = new Attachment()
    attachment.path = location
    profile[typeField] = await this.attachmentDAO.saveAttachment(attachment)
    await this.dao.saveProfile(profile)

    return profile[typeField]
  }

  private async checkValidUsername(username: string): Promise<string> {
    if (!matches(username, '^[a-zA-Z0-9_.-]*$')) {
      return 'Invalid characters in username'
    } else if (username.length < 4) {
      return 'Username too short'
    }

    const isUsernameTaken = await this.dao.getProfileByUsername(username)

    if (isUsernameTaken) {
      return 'Username not available'
    }

    return null
  }

  // todo verify email by sending an email to user
  private async checkValidEmail(email: string): Promise<string> {
    if (!isEmail(email)) {
      return 'Invalid email adress'
    }

    if (email.endsWith('@seaqull.com')) {
      return 'No permission to use this e-mail'
    }

    const isEmailTaken = await this.dao.getUserByEmail(email)

    if (isEmailTaken) {
      return 'Email not available'
    }

    return null
  }

  private getPasswordStrengthErrors(password: string): Array<string> {
    const errors = []

    if (!isLength(password, { min: 8, max: 20 })) errors.push('Must be between 8 and 20 characters long')

    if (password.search(/[A-Z]/) < 1 && password.search(/[a-z]/) < 1) errors.push('Lowercase and uppercase letters')

    if (password.search(/\d/) < 0) errors.push('Atleast one numeric character')

    return errors
  }

  private async saveProfile(req: Request): Promise<Account> {
    const u = req.body

    let newProfile = new Profile()
    newProfile.avatar_attachment = await this.attachmentDAO.getDefaultAvatarAttachment()
    newProfile.banner_attachment = await this.attachmentDAO.getDefaultBannerAttachment()
    newProfile.title = await this.titleDAO.getTitleByTitleId(1)
    newProfile.display_name = u.username
    newProfile.custom_path = uuidv4()
    newProfile.rows_scrolled = 0
    newProfile.description = 'Welcome to my profile!'
    newProfile = await this.dao.saveProfile(newProfile)

    const acc = new Account()
    acc.last_ip = req.ip
    acc.profile = newProfile
    acc.email = u.email
    acc.password = await bcrypt.hash(u.password, 10)
    acc.user_name = u.username
    acc.role = await this.roleDAO.getRoleById(1)

    const createdAccount = await this.accountDAO.saveAccount(acc)

    return createdAccount
  }

  private cleanAccount = (account: Account): Account => {
    /** TODO: (Ajob) This REALLY needs to be fixed.
    / *       If we were to add more fields with sensitive
    / *       information, it is easy to forget to add in the
    / *       delete list. Whitelist instead of blocklist.
    / * */
    delete account.password
    delete account.changed_pw_at
    delete account.login_attempts_counts
    delete account.last_ip
    delete account.locked_to

    return account
  }
}

export default ProfileController
