import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { PostRepository } from '../repositories/post.repository'
import { PostsDTO } from '../dtos/response/posts.dto'
import { Account } from '../entities/account.entity'
import { PostLikeRepository } from '../repositories/post_like.repository'
import { PostDetailedPayloadDTO } from '../dtos/post-detailed-payload.dto'
import { PostViewRepository } from '../repositories/post_view.repository'
import { PostViewDTO } from '../dtos/post-view.dto'
import { AccountRepository } from '../repositories/account.repository'
import { CreatePostDTO } from '../dtos/create-post.dto'
import { FileService } from './file.service'
import { Post } from '../entities/post.entity'
import { AttachmentRepository } from '../repositories/attachment.repository'
import { PostView } from '../entities/post_view.entity'
import { ArchivedPost } from '../entities/archivedPost.entity'
import { ArchivedPostRepository } from '../repositories/archived_post.repository'
import { Attachment } from '../entities/attachment.entity'
import { RolePermissionRepository } from '../repositories/role_permission.repository'
import { v4 as uuidv4 } from 'uuid'
import { ProfileRepository } from '../repositories/profile.repository'

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostRepository) private readonly postRepository: PostRepository,
    @InjectRepository(PostLikeRepository) private readonly postLikeRepository: PostLikeRepository,
    @InjectRepository(PostViewRepository) private readonly postViewRepository: PostViewRepository,
    @InjectRepository(AccountRepository) private readonly accountRepository: AccountRepository,
    @InjectRepository(AttachmentRepository) private readonly attachmentRepository: AttachmentRepository,
    @InjectRepository(ArchivedPostRepository) private readonly archivedPostRepository: ArchivedPostRepository,
    @InjectRepository(RolePermissionRepository) private readonly rolePermissionRepository: RolePermissionRepository,
    @InjectRepository(ProfileRepository) private readonly profileRepository: ProfileRepository,
    private readonly fileService: FileService,
  ) {
  }

  public async getPosts(skipSize: string): Promise<PostsDTO> {
    let posts
    const skipAmount = 6

    if (skipSize) {
      posts = await this.postRepository.getPosts(String(skipSize), skipAmount)

      if (posts.length === 0) {
        throw new NotFoundException('You`ve reached the last post')
      }

    } else {
      posts = await this.postRepository.getPosts('0', skipAmount)
    }

    for (const post of posts) {
      post.thumbnail = await this.getPostThumbnailURL(post.id)
    }

    const count = await this.postRepository.getAmountPosts()
    const message: PostsDTO = { posts: posts, totalPosts: count, per_page: skipAmount }

    return message
  }

  public async getPostByPath(path: string, account: Account | undefined, hostUrl: string): Promise<PostDetailedPayloadDTO> {
    let post = await this.postRepository.getPostByPath(path) as any

    if (!post) throw new NotFoundException(`No post found with path ${path}`)

    const attachments = await this.profileRepository.getProfileAttachments(post.profile.id)

    post.profile.avatar_attachment = attachments.avatar.path
    post.profile.banner_attachment = attachments.banner.path

    const postLikes = await this.postLikeRepository.getPostLikesById(post.id)
    const postLikesAmount = postLikes ? postLikes.length : 0

    let userLiked = false

    let isOwner = false

    if (account) {
      isOwner = post.profile.id === account.profile.id
      userLiked = await this.postLikeRepository.findIfLikeByPostAndProfile(post, account.profile)
    }

    const attachment = await this.postRepository.getPostAttachment(post.id)

    post = {
      ...post,
      // TODO, attachments have the server host url hardcoded prepended
      thumbnail: `${hostUrl}/${attachment.path}`
    }

    return { post, likes: { amount: postLikesAmount, userLiked }, isOwner }
  }

  public async getPostViewsByPath(postPath: string): Promise<PostViewDTO> {
    const post = await this.postRepository.getPostByPath(postPath)

    if (!post) throw new NotFoundException({ message: 'Post not found' })

    const postViewCount = await this.postViewRepository.getPostViewCount(post)

    return { views: postViewCount }
  }

  public async getOwnedPostsByUsername(username: string): Promise<any[]> {
    const account = await this.accountRepository.getAccountByUsername(username)

    if (!account) throw new NotFoundException([])

    const posts = await this.postRepository.getPostsByProfile(account.profile) as any[]

    for (const post of posts) {
      post.thumbnail = await this.getPostThumbnailURL(post.id)
    }

    return posts
  }

  public async addViewToPost(postPath: string, ipAddress: string): Promise<void> {
    const foundPost = await this.postRepository.getPostByPath(postPath)

    if (!foundPost) throw new NotFoundException({ message: 'Post not found' })

    const ipViewedPost = await this.postViewRepository.hasViewedPost(foundPost, ipAddress)

    if (ipViewedPost) return

    const postView = new PostView()
    postView.post = foundPost
    postView.ip = ipAddress

    await this.postViewRepository.addViewToPost(postView)
  }

  public async createPost(createPostDTO: CreatePostDTO, file: Express.Multer.File, user: Account): Promise<string> {
    let thumbnailAttachment
    const newPost = new Post()

    if (file) {
      const isImage = this.fileService.isImage(file)

      if (!isImage) throw new BadRequestException({ error: 'Only images are allowed' })

      thumbnailAttachment = await this.createThumbnailAttachment(file)
    } else {
      thumbnailAttachment = await this.attachmentRepository.getDefaultThumbnailAttachment()
    }

    newPost.title = createPostDTO.title
    newPost.description = createPostDTO.description
    newPost.content = createPostDTO.content
    newPost.published_at = new Date()
    newPost.created_at = new Date()
    newPost.thumbnail_attachment = thumbnailAttachment
    newPost.profile = user.profile
    newPost.path = uuidv4()

    await this.postRepository.createPost(newPost)

    return newPost.path
  }

  public async updatePost(path: string, createPostDTO: CreatePostDTO, display_name: string): Promise<void> {
    const post = await this.postRepository.getPostByPath(path)

    if (!post || display_name !== post.profile.display_name) {
      throw new ForbiddenException({
        message: 'The authorized requesting user does not have access to this resource'
      })
    }

    post.title = createPostDTO.title
    post.description = createPostDTO.description
    post.content = createPostDTO.content

    const result = await this.postRepository.updatePost(post)

    if (!result) throw new NotFoundException('Post was not found and could not be updated')
  }

  public async archivePost(path: string, user: Account): Promise<void> {
    const post = await this.postRepository.getPostByPath(path)

    if (!post || post.profile.display_name !== user.profile.display_name || !(await this.hasRemovePostPermission(user))) {
      throw new ForbiddenException({
        message: 'The authorized requesting user does not have access to this resource'
      })
    }

    const currentDate = Date.now()
    post.archived_at = currentDate

    const archivedPost = new ArchivedPost()
    archivedPost.archived_at = currentDate
    archivedPost.archivist = user

    await this.archivedPostRepository.saveArchivedPost(archivedPost)

    const newPost = await this.postRepository.updatePost(post)

    if (!newPost) throw new NotFoundException('Post was not found and could not be updated')
  }

  public async getDefaultThumbnailAttachment(): Promise<string> {
    const foundAttachment = await this.attachmentRepository.getDefaultThumbnailAttachment()

    if (!foundAttachment) throw new NotFoundException('Attachment not found')

    const attachmentURL = 'http://localhost:8000/' + foundAttachment.path

    return attachmentURL
  }

  public async updatePostThumbnail(path: string, file: Express.Multer.File, user: Account): Promise<string> {
    const post = await this.postRepository.getPostByPath(path)

    if (!post || user.profile.display_name !== post.profile.display_name) {
      throw new ForbiddenException({
        message: 'The authorized requesting user does not have access to this resource'
      })
    }

    const isImage = this.fileService.isImage(file)

    if (!isImage) throw new BadRequestException('Only images are allowed')

    const banner = await this.updateThumbnailAttachment(post, file)

    return 'http://localhost:8000/' + banner.path
  }

  private async createThumbnailAttachment(file: Express.Multer.File) {
    const location = await this.fileService.storeImage(file, 'post/thumbnail')

    const attachment = await this.convertThumbnailToAttachment(location)

    return await this.attachmentRepository.saveAttachment(attachment)
  }

  private async updateThumbnailAttachment(post: Post, file: Express.Multer.File): Promise<Attachment> {
    let attachment = await this.postRepository.getPostAttachment(post.id)
    const location = await this.fileService.storeImage(file, 'post/thumbnail')

    const typeDefaultPath = 'default/defaultThumbnail.jpg'

    if (attachment.path !== typeDefaultPath) {
      return await this.deleteThumbnailAttachment(attachment, location)
    }

    attachment = await this.convertThumbnailToAttachment(location)

    post.thumbnail_attachment = await this.attachmentRepository.saveAttachment(attachment)

    await this.postRepository.updatePost(post)

    return post.thumbnail_attachment
  }

  private async convertThumbnailToAttachment(location: string) {
    const dimensions = { width: +(800 * (16 / 9)).toFixed(), height: 800 }

    await this.fileService.convertImage(location, dimensions)

    const attachment = new Attachment()
    attachment.path = location

    return attachment
  }

  private async getPostThumbnailURL(postId: number): Promise<string> {
    const attachment = await this.postRepository.getPostAttachment(postId)

    return 'http://localhost:8000/' + attachment.path
  }

  private async deleteThumbnailAttachment(attachment: Attachment, location: string) {
    this.fileService.deleteImage(attachment.path)
    attachment.path = location

    return await this.attachmentRepository.saveAttachment(attachment)
  }

  private async hasRemovePostPermission(user: Account): Promise<boolean> {
    const role = await this.accountRepository.getAccountRole(user.id)
    const permissions = await this.rolePermissionRepository.getRolePermissionsByRole(role.id)

    let hasPermission = false

    if (permissions.some((permission) => permission.permission.name === 'REMOVE_POSTS')) {
      hasPermission = true
    }

    return hasPermission
  }
}
