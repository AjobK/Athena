import ControllerBase from '../interfaces/ControllerBase';
import * as express from 'express';
import PostService from '../service/postService';
const passport = require('passport');

require('../util/passport')(passport);

class PostController implements ControllerBase{
    public post = '/post'
    public router = express.Router()
    private postService: PostService

    constructor(){
        this.postService = new PostService();
        this.initRoutes();
    }

    public initRoutes(): void {
        this.router.get(this.post,
            // passport.authenticate('jwt', { session: false }),
            this.postService.getPosts);
        this.router.post(this.post, this.postService.createPost)
    }
}
export default PostController;