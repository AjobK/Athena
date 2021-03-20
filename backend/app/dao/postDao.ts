import DatabaseConnector from '../util/databaseConnector'
import {Post} from '../entity/post'
import {PostLike} from '../entity/post_like'
import Profile from "../entity/profile";

class PostDAO {
    public async getPosts(skipSize: string, amount: number): Promise<Post[]> {
        const repository = await DatabaseConnector.getRepository('Post')
        const skipAmount = parseInt(skipSize) * amount;
        const postList = repository.find({ take : amount, skip: skipAmount })
        return postList
    }

    public async getAmountPosts(): Promise<number>{
        const repository = await DatabaseConnector.getRepository('Post')
        return await repository.count()
    }

    public async getPostByPath(path: string): Promise<Post> {
        const repository = await DatabaseConnector.getRepository('Post')
        const foundPost = await repository.findOne({ path: path })

        return foundPost
    }

    public async createPost(newPost: Post): Promise<any> {
        const repository = await DatabaseConnector.getRepository('Post')
        return repository.save(newPost)
    }

    public async likePost(like: PostLike): Promise<any> {
        const repository = await DatabaseConnector.getRepository('PostLike')
        return await repository.save(like)
    }

    public async unlikePost(like: PostLike): Promise<any> {
        const repository = await DatabaseConnector.getRepository('PostLike')
        return await repository.delete(like)
    }

    public async getPostLikesById(id: number): Promise<any> {
        if (!id)
            return null
        const repository = await DatabaseConnector.getRepository('PostLike')
        return await repository.find({ where: {post: id}, relations: ['post', 'profile'] })
    }

    public async findLikeByPostAndProfile(post: Post, profile: Profile): Promise<any> {
        if (!profile || !post)
            return false
        const repository = await DatabaseConnector.getRepository('PostLike')
        return await repository.findOne({ where: {post: post.id, profile: profile.id}, relations: ['post', 'profile'] })
    }
}
export default PostDAO
