import { Connection, createConnection } from 'typeorm';
import { account } from '../entity/account';
import post from '../entity/post';
import user from '../entity/user';

class DatabaseConnector{
    private static connection: Connection;

    // returns the post repository
    public static getRepositoryPost = async (): Promise<any> => {
        await DatabaseConnector.checkConnection();
        const repository = DatabaseConnector.connection.getRepository(post);
        return repository;
    }

    // returns the account repository
    public static getRepositoryAccount = async (): Promise<any> => {
        await DatabaseConnector.checkConnection();
        const repository = DatabaseConnector.connection.getRepository(account);
        return repository;
    }

    // returns the account repository
    public static getRepositoryUser = async (): Promise<any> => {
        await DatabaseConnector.checkConnection();
        const repository = DatabaseConnector.connection.getRepository(user);
        return repository;
    }

    private static checkConnection = async (): Promise<void> => {
        if(DatabaseConnector.connection == null){
            DatabaseConnector.connection = await createConnection();
        }
    }
}

export default DatabaseConnector;
