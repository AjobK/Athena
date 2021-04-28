import DatabaseConnector from '../service/databaseConnector'
import { Account } from '../entity/account'

class AccountDAO {
    public async getAccountByUsername( username:string ): Promise<Account> {
        const repository = await DatabaseConnector.getRepository('Account')
        const account = await repository.createQueryBuilder('account')
            .leftJoinAndSelect('account.profile', 'profile')
            .where('account.user_name = :user_name', { user_name: username })
            .getOne()
        return account
    }

    public async saveAccount(acc: Account): Promise<Account> {
        const repository = await DatabaseConnector.getRepository('Account')
        const createdAccount = await repository.save(acc)
        return createdAccount
    }

    public async updateAccount(acc: Account): Promise<void> {
        const repository = await DatabaseConnector.getRepository('Account')
        await repository.save(acc)
    }

    public async getAccountIdByUsername(username: string): Promise<number> {
        const repositoryAccount = await DatabaseConnector.getRepository('Account')
        const account = await repositoryAccount.findOne({ user_name: username })

        return account.id || -1
    }
}
export default AccountDAO
