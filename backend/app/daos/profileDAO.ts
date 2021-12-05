import DatabaseConnector from '../utils/databaseConnector'
import { Profile } from '../entities/profile'
import Attachment from '../entities/attachment'
import ProfileFollowedBy from '../entities/profile_followed_by'

class ProfileDAO {
  public async getFollowersCount(profileId: number): Promise<number> {
    const repositoryProfile = await DatabaseConnector.getRepository('ProfileFollowedBy')

    const amountOfFollowers = await repositoryProfile.count({ where: { profile: profileId } })

    return amountOfFollowers
  }

  public async getProfileByUsername(username: string): Promise<Profile> {
    const repositoryAccount = await DatabaseConnector.getRepository('Account')
    const account = await repositoryAccount.findOne({ where: { user_name: username }, relations: ['profile'] })

    return !account ? null : account.profile
  }

  public async getProfileAttachments(profileId: number): Promise<{ avatar: Attachment, banner: Attachment }> {
    const repositoryProfile = await DatabaseConnector.getRepository('Profile')
    const avatar = await repositoryProfile.findOne({ where: { id: profileId }, relations: ['avatar_attachment'] })
    const banner = await repositoryProfile.findOne({ where: { id: profileId }, relations: ['banner_attachment'] })

    return {
      avatar: avatar.avatar_attachment,
      banner: banner.banner_attachment
    }
  }

  public async getFollowersByProfileId(profileId: number): Promise<ProfileFollowedBy[]> {
    const repositoryProfile = await DatabaseConnector.getRepository('ProfileFollowedBy')

    const followers = await repositoryProfile.find({
      where: { profile: profileId },
      relations: ['follower', 'follower.avatar_attachment', 'follower.title']
    })

    return followers
  }

  public async getUserByEmail(email: string): Promise<Profile> {
    const repositoryAccount = await DatabaseConnector.getRepository('Account')
    const account = await repositoryAccount.findOne({ email: email })

    return account
  }

  public async saveProfile(u: Profile): Promise<Profile> {
    const repositoryProfile = await DatabaseConnector.getRepository('Profile')
    const profile = await repositoryProfile.save(u)

    return profile
  }

  public async follow(profileFollowedBy: ProfileFollowedBy): Promise<any> {
    const repository = await DatabaseConnector.getRepository('ProfileFollowedBy')

    const foundFollow = await repository.findOne(profileFollowedBy)

    if (!foundFollow)
      await repository.save(profileFollowedBy)
    else
      await repository.delete(profileFollowedBy)

    return !foundFollow
  }

  public async isFollowing(profileFollowedBy: ProfileFollowedBy): Promise<any> {
    const repository = await DatabaseConnector.getRepository('ProfileFollowedBy')

    const foundFollow = await repository.findOne(profileFollowedBy)

    return !!foundFollow
  }

  public async getFollowingByProfileId(profileId: number): Promise<ProfileFollowedBy[]> {
    const repository = await DatabaseConnector.getRepository('ProfileFollowedBy')

    const following = await repository.find({
      where: { follower: profileId },
      relations: ['profile', 'profile.avatar_attachment', 'profile.title']
    })

    return following
  }

  public async getFollowingCount(profileId: number): Promise<any> {
    const repository = await DatabaseConnector.getRepository('ProfileFollowedBy')

    const followingAmount = await repository.count({ where: { follower: profileId } })

    return followingAmount
  }
}

export default ProfileDAO
