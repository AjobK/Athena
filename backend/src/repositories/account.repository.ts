import { EntityRepository, Repository } from 'typeorm'
import { Account } from '../entities/account.entity'
import { Profile } from '../entities/profile.entity'
import { Role } from '../entities/role.entity'

@EntityRepository(Account)
export class AccountRepository extends Repository<Account> {

  public async getProfileByUsername(username: string): Promise<Profile> {
    const account = await this.findOne({ where: { user_name: username }, relations: ['profile'] })

    return account?.profile
  }

  public async getAccountByUsername(username: string): Promise<Account> {
    const account = await this.createQueryBuilder('account')
      .leftJoinAndSelect('account.profile', 'profile')
      .leftJoinAndSelect('profile.avatar_attachment', 'attachment')
      .leftJoinAndSelect('profile.title', 'title')
      .where('account.user_name = :user_name', { user_name: username })
      .getOne()

    return account
  }

  public async getAccountByEmail(email: string): Promise<Account> {
    return await this.createQueryBuilder('account')
      .leftJoinAndSelect('account.profile', 'profile')
      .leftJoinAndSelect('profile.avatar_attachment', 'attachment')
      .leftJoinAndSelect('profile.title', 'title')
      .where('account.email = :email', { email: email })
      .getOne()
  }

  public async getAccountProfileAndRoleByEmail(email: string): Promise<Account> {
    return this.findOne({ where: { email: email }, relations: ['profile', 'role'] })
  }

  public async getAccountProfileAndRoleByUsername(username: string): Promise<Account> {
    const account = this.findOne({ where: { user_name: username }, relations: ['profile', 'role'] })

    return account
  }

  public async getAccountRoleIdByUsername(username: string): Promise<number> {
    const role = await this.createQueryBuilder('account')
      .leftJoinAndSelect('account.role', 'role')
      .select(['account.role'])
      .where('account.user_name = :user_name', { user_name: username })
      .getRawOne()

    return role.role_id
  }

  public async saveAccount(acc: Account): Promise<Account> {
    return await this.save(acc)
  }

  public async lockAccount(account: Account): Promise<number> {
    account.login_attempts_counts = 0
    account.locked_to = Date.now() + 30000

    await this.updateAccount(account)

    return Math.floor((account.locked_to - Date.now()) / 1000)
  }

  public async updateAccount(account: Account): Promise<void> {
    await this.save(account)
  }

  public async accountAlreadyExists(email: string, user_name: string): Promise<boolean> {
    const usernameInUse = await this.findOne({ where: { user_name } })
    const emailInUse = await this.findOne({ where: { email } })

    return !!(usernameInUse || emailInUse)
  }

  public async getAccountRole(id: number): Promise<Role> {
    const account = await this.findOne(id, { relations: ['role'] })

    if (!account) return undefined

    return account.role
  }
}
