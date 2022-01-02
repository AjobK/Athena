import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ProfileRepository } from '../repositories/profile.repository'
import { ProfileFollowedByRepository } from '../repositories/profile_followed_by.repository'
import { Title } from '../entities/title.entity'
import { ProfileFollowedBy } from '../entities/profile_followed_by.entity'
import { AccountRepository } from '../repositories/account.repository'
import { BanRepository } from '../repositories/ban.repository'
import { TitleRepository } from '../repositories/title.repository'
import { Account } from '../entities/account.entity'
import { RegisterDTO } from '../dtos/register.dto'
import { ConfigService } from '@nestjs/config'
import { RegisterPayloadDTO } from '../dtos/register-payload.dto'
import { Profile } from '../entities/profile.entity'
import { AttachmentRepository } from '../repositories/attachment.repository'
import { RoleRepository } from '../repositories/role.repository'
import { v4 as uuidv4 } from 'uuid'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { FileService } from './file.service'
import { Attachment } from '../entities/attachment.entity'
import { Multer } from 'multer'
import { JwtService } from '@nestjs/jwt'
import {JwtPayload} from "../interfaces/jwt-payload.interface";

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(ProfileRepository) private readonly profileRepository: ProfileRepository,
    @InjectRepository(AccountRepository) private readonly accountRepository: AccountRepository,
    @InjectRepository(BanRepository) private readonly banRepository: BanRepository,
    @InjectRepository(TitleRepository) private readonly titleRepository: TitleRepository,
    @InjectRepository(ProfileFollowedByRepository)
      private readonly profileFollowedByRepository: ProfileFollowedByRepository,
    @InjectRepository(AttachmentRepository) private readonly attachmentRepository: AttachmentRepository,
    @InjectRepository(RoleRepository) private readonly roleRepository: RoleRepository,
    private readonly configService: ConfigService,
    private readonly fileService: FileService,
    private readonly jwtService: JwtService,
  ) {
  }

  public async getFollowers(username: string): Promise<number[]> {
    const profile = await this.accountRepository.getProfileByUsername(username)

    if (!profile) throw new NotFoundException('Profile not found')

    const followersById = await this.profileFollowedByRepository.getFollowersByProfileId(profile.id)

    const followers = []

    followersById.forEach((entry) => {
      followers.push(entry.follower)
    })

    return followers
  }

  public async getProfile(username: string, user: Account | undefined): Promise<any> {
    const profile = await this.accountRepository.getProfileByUsername(username)

    if (!profile) throw new NotFoundException('Profile not found')

    const account = await this.accountRepository.getAccountByUsername(profile.display_name)

    const ban = await this.banRepository.checkIfUserIsBanned(account)

    if (ban) throw new ForbiddenException({ errors: [ban] })

    const title: Title = (await this.profileRepository.getTitleByUserId(profile.id)) || null

    const followerCount = await this.profileFollowedByRepository.getFollowersCount(profile.id)
    const followingCount = await this.profileFollowedByRepository.getFollowingCount(profile.id)

    let following = false
    let followsYou = false
    const isOwner = user?.user_name === username

    if (!isOwner && user) {
      const currentProfile = new ProfileFollowedBy()
      const loggedInProfile = new ProfileFollowedBy()

      const followingProfile = await this.accountRepository.getProfileByUsername(username)

      currentProfile.follower = followingProfile.id
      currentProfile.profile = profile.id

      loggedInProfile.follower = profile.id
      loggedInProfile.profile = followingProfile.id

      following = await this.profileFollowedByRepository.isFollowing(currentProfile)
      followsYou = await this.profileFollowedByRepository.isFollowing(loggedInProfile)
    }

    const payload = {
      isOwner: isOwner,
      following: following,
      followsYou: followsYou,
      username: username,
      title: title ? title.name : 'Title not found...',
      description: profile.description,
      followerCount,
      followingCount,
    }

    const attachments = await this.profileRepository.getProfileAttachments(profile.id)

    if (attachments.avatar) payload['avatar'] = 'http://localhost:8000/' + attachments.avatar.path

    if (attachments.banner) payload['banner'] = 'http://localhost:8000/' + attachments.banner.path

    return {
      profile: payload,
    }
  }

  public async register(registerDTO: RegisterDTO, ip: string): Promise<RegisterPayloadDTO> {
    if (registerDTO.email.endsWith('@seaqull.com')) throw new UnauthorizedException('No permission to use this e-mail')

    const credentialsInUse = await this.accountRepository.accountAlreadyExists(registerDTO.email, registerDTO.username)

    if (credentialsInUse) throw new UnauthorizedException('Account with this email or username is already in use')

    const createAccount = await this.saveProfile(registerDTO, ip)

    const payload: JwtPayload = {
      role_id: createAccount.role.id,
      user_name: createAccount.user_name,
      expiration: Date.now() + parseInt(this.configService.get('JWT_EXPIRATION')),
    }

    const token = this.jwtService.sign(payload)

    return {
      role: createAccount.role,
      profile: createAccount.profile,
      username: createAccount.user_name,
      email: createAccount.email,
      token,
    }
  }

  public async follow(profile: Profile, toBeFollowedUsername: string): Promise<boolean> {
    const follower = profile
    const profileToBeFollowed = await this.accountRepository.getProfileByUsername(toBeFollowedUsername)

    if (follower.id == profileToBeFollowed.id) throw new ForbiddenException('Not allowed to follow yourself')

    const profileFollowedBy: ProfileFollowedBy = new ProfileFollowedBy()
    profileFollowedBy.follower = follower.id
    profileFollowedBy.profile = profileToBeFollowed.id

    const followedProfile = await this.profileFollowedByRepository.follow(profileFollowedBy)

    return followedProfile
  }

  public async updateProfileAvatar(file: Express.Multer.File, user_name: string): Promise<Attachment> {
    const isImage = this.fileService.isImage(file)

    if (!isImage) throw new BadRequestException('Only images are allowed')

    const avatar = this.updateAttachment(file, user_name, 'avatar')

    return avatar
  }

  public async updateProfileBanner(file: Express.Multer.File, user_name: string): Promise<Attachment> {
    const isImage = this.fileService.isImage(file)

    if (!isImage) throw new BadRequestException('Only images are allowed')

    const banner = this.updateAttachment(file, user_name, 'banner')

    return banner
  }

  private async saveProfile(registerDTO: RegisterDTO, ip: string): Promise<Account> {
    let newProfile = new Profile()
    newProfile.avatar_attachment = await this.attachmentRepository.getDefaultAvatarAttachment()
    newProfile.banner_attachment = await this.attachmentRepository.getDefaultBannerAttachment()
    newProfile.title = await this.titleRepository.getTitleByTitleId(1)
    newProfile.display_name = registerDTO.username
    newProfile.custom_path = uuidv4()
    newProfile.rows_scrolled = 0
    newProfile.description = 'Welcome to my profile!'
    newProfile = await this.profileRepository.saveProfile(newProfile)

    const acc = new Account()
    acc.last_ip = ip
    acc.profile = newProfile
    acc.email = registerDTO.email
    acc.password = await bcrypt.hash(registerDTO.password, 10)
    acc.user_name = registerDTO.username
    acc.role = await this.roleRepository.getRoleById(1)

    const createdAccount = await this.accountRepository.saveAccount(acc)

    return createdAccount
  }

  private async updateAttachment(file: Express.Multer.File, username: string, type: string): Promise<any> {
    const profile = await this.accountRepository.getProfileByUsername(username)
    const attachments = await this.profileRepository.getProfileAttachments(profile.id)

    let attachment = attachments[type]
    let dimensions
    let typeDefaultPath = 'default/'
    let filePath

    if (type === 'avatar') {
      dimensions = 800
      filePath = 'profile/avatar'
      typeDefaultPath += 'defaultAvatar.png'
    } else if (type === 'banner') {
      dimensions = { width: +(800 * (16 / 9)).toFixed(), height: 800 }
      filePath = 'profile/banner'
      typeDefaultPath += 'defaultBanner.jpg'
    }

    const location = await this.fileService.storeImage(file, filePath)
    await this.fileService.convertImage(location, dimensions)

    if (attachment.path !== typeDefaultPath) {
      this.fileService.deleteImage(attachment.path)
      attachment.path = location

      return await this.attachmentRepository.saveAttachment(attachment)
    }

    let typeField
    if (type === 'avatar') typeField = 'avatar_attachment'
    else if (type === 'banner') typeField = 'banner_attachment'

    attachment = new Attachment()
    attachment.path = location
    profile[typeField] = await this.attachmentRepository.saveAttachment(attachment)
    await this.profileRepository.saveProfile(profile)

    return profile[typeField]
  }

  public async updateProfile(updateUser: any): Promise<void> {
    const profile = await this.accountRepository.getProfileByUsername(updateUser.username)

    for (let i = 0; i < Object.keys(updateUser).length; i++) {
      profile[Object.keys(updateUser)[i]] = updateUser[Object.keys(updateUser)[i]]
    }

    await this.profileRepository.saveProfile(profile)
  }
}
