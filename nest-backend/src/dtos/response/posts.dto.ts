import { Post } from '../../entities/post.entity'

export class PostsDTO {
  posts: Post[]

  totalPosts: number

  per_page: number
}
