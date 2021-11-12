import { EntityRepository, Repository } from 'typeorm'
import { PostView } from '../entities/post_view.entity'

@EntityRepository(PostView)
export class PostViewRepository extends Repository<PostView> {

}
