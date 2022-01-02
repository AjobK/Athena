import { Request, Response } from 'express'
import PostDAO from '../daos/postDAO'
import Post from '../entities/post'
import { v4 as uuidv4 } from 'uuid'
import AccountDAO from '../daos/accountDAO'
import PostLike from '../entities/post_like'
import Profile from '../entities/profile'
import ProfileDAO from '../daos/profileDAO'
import AttachmentDAO from '../daos/attachmentDAO'
import ArchivedPost from '../entities/archivedPost'
import ArchivedPostDAO from '../daos/archivedPostDAO'
import NetworkService from '../utils/networkService'
import PostView from '../entities/post_view'
import FileService from '../utils/fileService'
import Attachment from '../entities/attachment'

const jwt = require('jsonwebtoken')

class PostController {
  private dao: PostDAO
  private profileDAO: ProfileDAO
  private accountDAO: AccountDAO
  private archivedPostDao: ArchivedPostDAO
  private attachmentDAO: AttachmentDAO
  private fileService: FileService

  constructor() {
    this.dao = new PostDAO()
    this.profileDAO = new ProfileDAO()
    this.accountDAO = new AccountDAO()
    this.archivedPostDao = new ArchivedPostDAO()
    this.attachmentDAO = new AttachmentDAO()
    this.fileService = new FileService()
  }

  public getPosts = async (req: Request, res: Response): Promise<Response> => {
    const amount = 6
    const totalPosts = await this.dao.getAmountPosts()
    const totalPages = Math.ceil(totalPosts / amount)

    let posts = []
    let page = +req.query?.page

    if (isNaN(+page) || +page < 0)
      return res.status(422).json({
        message: 'Invalid page number'
      })

    page = ~~page
    posts = await this.dao.getPosts(+page, amount)

    const message = {
      currentPage: +page,
      totalPages: totalPages,
      postsPerPage: amount,
      posts: posts
    }

    return res.status(200).json(message)
  }

  public getOwnedPosts = async (req: Request, res: Response): Promise<Response> => {
    let posts = []
    let account = null

    try {
      account = await new AccountDAO().getAccountByUsername(req.params.username)
    } catch (e) {
      return res.status(404).json([])
    }

    posts = await this.dao.getOwnedPosts(account.profile)

    for (const post of posts) {
      post.thumbnail = await this.getPostThumbnailURL(post.id)
    }

    return res.status(200).json(posts)
  }

  public getPostByPath = async (req: Request, res: Response): Promise<any> => {
    const response = {
      post: null,
      likes: {
        amount: 0,
        userLiked: false
      },
      isOwner: false,
    }

    const foundPost = await this.dao.getPostByPath(req.params.path)

    if (!foundPost)
      return res.status(404).json({ 'message': 'No post found on that path' })

    const { JWT_SECRET } = process.env
    let decodedId

    try {
      const decodedToken = jwt.verify(req.cookies.token, JWT_SECRET)
      const account = await new AccountDAO().getAccountByUsername(decodedToken.username)
      decodedId = account.profile.id
    } catch (e) {
      decodedId = -1
    }

    const foundLikes = await this.dao.getPostLikesById(foundPost.id)
    const postLikesAmount = foundLikes ? foundLikes.length : 0
    const profile = await this.fetchProfile(req)
    const userLiked = !!(await this.dao.findLikeByPostAndProfile(foundPost, profile || null))

    response.post = {
      ...foundPost,
      thumbnail: await this.getPostThumbnailURL(foundPost.id)
    }
    response.likes = {
      amount: postLikesAmount,
      userLiked: userLiked
    }
    response.isOwner = foundPost.profile.id == decodedId

    return res.status(200).json(response)
  }

  public createPost = async (req: any, res: Response): Promise<Response> => {
    const { JWT_SECRET } = process.env
    const newPost = new Post()
    const { title, description, content } = req.body
    let thumbnailAttachment = null

    newPost.path = uuidv4()

    if (req.file) {
      const isImage = await this.fileService.isImage(req.file)

      if (!isImage) {
        return res.status(400).json({ error: 'Only images are allowed' })
      }

      thumbnailAttachment = await this.createThumbnailAttachment(newPost.path, req.file)
    } else {
      thumbnailAttachment = await this.attachmentDAO.getDefaultThumbnailAttachment()
    }

    newPost.title = title
    newPost.description = description
    newPost.content = content
    newPost.published_at = new Date()
    newPost.created_at = new Date()
    newPost.thumbnail_attachment = thumbnailAttachment

    const decodedToken = jwt.verify(req.cookies.token, JWT_SECRET)

    if (decodedToken.username != null) {
      const profile = await this.profileDAO.getProfileByUsername(decodedToken.username)
      newPost.profile = profile

      await this.dao.createPost(newPost)
    } else {
      return res.status(200).json({ message: 'Invalid jwt' })
    }

    return res.status(200).json({
      message: 'Post added!',
      path: newPost.path
    })
  }

  public updatePost = async (req: Request, res: Response): Promise<any> => {
    const post = await this.dao.getPostByPath(req.params.path)
    const { JWT_SECRET } = process.env
    const { title, description, content } = req.body

    post.title = title
    post.description = description
    post.content = content

    const decodedToken = jwt.verify(req.cookies.token, JWT_SECRET)

    if (post.profile.display_name != decodedToken.username)
      return res.status(405).json({ 'error': 'Not allowed' })

    if (!post)
      return res.status(404).json({ 'message': 'Post not found' })

    const updatedPost = await this.dao.updatePost(post)

    if (!updatedPost)
      return res.status(404).json({ 'message': 'Could not update post' })

    return res.status(200).json({ 'message': 'Post has been updated!' })
  }

  public likePost = async (req: Request, res: Response): Promise<Response> => {
    const profile = await this.fetchProfile(req)
    const foundPost = await this.dao.getPostByPath(req.params.path)

    if (profile.id === foundPost.profile.id)
      return res.status(400).json({ 'error': 'Post owners cannot like their posts.' })

    const postLike = new PostLike()
    postLike.profile = profile
    postLike.post = foundPost
    postLike.liked_at = new Date()

    try {
      await this.dao.likePost(postLike)

      return res.status(200).json({ 'message': 'Post liked!' })
    } catch (e) {
      return res.status(400).json({ 'error': 'Post could not be liked.' })
    }
  }

  public unlikePost = async (req: Request, res: Response): Promise<Response> => {
    const profile = await this.fetchProfile(req)
    const foundPost = await this.dao.getPostByPath(req.params.path)

    const foundLike = await this.dao.findLikeByPostAndProfile(foundPost, profile)

    const removedLike = foundLike ? await this.dao.unlikePost(foundLike) : null

    if (removedLike && removedLike.affected > 0) {
      return res.status(200).json({ 'message': 'Like removed!' })
    } else {
      return res.status(404).json({ 'message': 'Like to remove could not be found' })
    }
  }

  public getPostLikes = async (req: Request, res: Response): Promise<any> => {
    const foundPost = await this.dao.getPostByPath(req.params.path)
    const foundLikes = await this.dao.getPostLikesById(foundPost.id)

    if (req.params.path && foundLikes)
      return res.status(200).json(foundLikes.reverse())
    else
      return res.status(204).json([])
  }

  public getRecentUserLikes = async (req: Request, res: Response): Promise<any> => {
    const foundUser = await this.profileDAO.getProfileByUsername(req.params.username)
    const foundLikes = await this.dao.getRecentUserLikesByProfileId(foundUser.id, 8)

    if (req.params.username && foundLikes) {
      const likes = []

      foundLikes.forEach((like) => {
        likes.push(like.post)
      })

      return res.status(200).json(likes)
    } else {
      return res.status(404).json({ 'message': 'No likes found for that username' })
    }
  }

  public addViewToPost = async (req: Request, res: Response): Promise<any> => {
    const foundPost = await this.dao.getPostByPath(req.body.path)

    if (!foundPost) {
      return res.status(404).json({ 'message': 'Post not found' })
    }

    const ip = NetworkService.getUserIp(req)

    const postView = new PostView()
    postView.post = foundPost
    postView.ip = ip

    await this.dao.addViewToPost(postView)

    return res.status(200).json({ 'message': 'Post viewed' })
  }

  public getPostViewCount = async (req: Request, res: Response): Promise<any> => {
    const foundPost = await this.dao.getPostByPath(req.params.path)

    if (!foundPost) {
      return res.status(404).json({ 'message': 'Post not found' })
    }

    const viewCount = await this.dao.getPostViewCount(foundPost)

    return res.status(200).json({ 'views': viewCount })
  }

  public archivePost = async (req: any, res: Response): Promise<any> => {
    const post = await this.dao.getPostByPath(req.params.path)

    if (!post) return res.status(404).json({ error: 'Not found' })

    const currentDate = Date.now()
    post.archived_at = currentDate

    const user = await this.accountDAO.getAccountByUsername(req.decoded.username)

    if (!user) {
      return res.status(400).json({ error: ['User not found'] })
    }

    const archivedPost = new ArchivedPost()
    archivedPost.archived_at = currentDate
    archivedPost.archivist = user

    await this.archivedPostDao.saveArchivedPost(archivedPost)

    const newPost = await this.dao.updatePost(post)
    if (!newPost) return res.status(500).json({ error: 'Could not archive post' })

    return res.status(200).json({ message: 'Post archived!' })
  }

  public getPostDefaultThumbnailURL = async (req: Request, res: Response): Promise<any> => {
    const foundAttachment = await this.attachmentDAO.getDefaultThumbnailAttachment()

    if (!foundAttachment) {
      return res.status(404).json({ 'message': 'Attachment not found' })
    }

    const attachmentURL = 'http://localhost:8000/' + foundAttachment.path

    return res.status(200).json({ 'thumbnail': attachmentURL })
  }

  public updatePostThumbnail = async (req: any, res: Response): Promise<Response> => {
    const isImage = await this.fileService.isImage(req.file)

    if (!isImage) {
      return res.status(400).json({ error: 'Only images are allowed' })
    } else {
      const banner = await this.updateThumbnailAttachment(req.params.path, req.file)

      return res.status(200).json({ message: 'success', url: 'http://localhost:8000/' + banner.path })
    }
  }

  // TODO Move to another file?
  private fetchProfile = async (req: Request): Promise<Profile> => {
    const { token } = req.cookies

    if (token) {
      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

        return await this.profileDAO.getProfileByUsername(decodedToken.username)
      } catch (err) {
        return null
      }
    }

    return null
  }

  private updateThumbnailAttachment = async (postPath, file): Promise<any> => {
    const post = await this.dao.getPostByPath(postPath)
    let attachment = await this.dao.getPostAttachment(post.id)
    const location = await this.fileService.storeImage(file, 'post/thumbnail')

    const typeDefaultPath = 'default/defaultThumbnail.jpg'

    if (attachment.path !== typeDefaultPath) {
      return await this.deleteThumbnailAttachment(attachment, location)
    }

    attachment = await this.convertThumbnailToAttachment(location)

    post.thumbnail_attachment = await this.attachmentDAO.saveAttachment(attachment)

    await this.dao.updatePost(post)

    return post.thumbnail_attachment
  }

  private createThumbnailAttachment = async (postPath, file): Promise<any> => {
    const location = await this.fileService.storeImage(file, 'post/thumbnail')

    const attachment = await this.convertThumbnailToAttachment(location)

    return await this.attachmentDAO.saveAttachment(attachment)
  }

  private deleteThumbnailAttachment = async (attachment: Attachment, location: string) => {
    this.fileService.deleteImage(attachment.path)
    attachment.path = location

    return await this.attachmentDAO.saveAttachment(attachment)
  }

  private getPostThumbnailURL = async (postId: number) => {
    const attachment = await this.dao.getPostAttachment(postId)

    return 'http://localhost:8000/' + attachment.path
  }

  private convertThumbnailToAttachment = async (location) => {
    const dimensions = { width: +(800 * (16 / 9)).toFixed(), height: 800 }

    await this.fileService.convertImage(location, dimensions)

    const attachment = new Attachment()
    attachment.path = location

    return attachment
  }
}

export default PostController
