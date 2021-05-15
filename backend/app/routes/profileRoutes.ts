import * as express from 'express'
import ProfileController from '../controller/profileController'
import RoutesBase from '../interfaces/RoutesBase'
import FileService from '../util/fileService'

const auth = require('../middleware/isAuth.ts')

class ProfileRoutes implements RoutesBase {
    public profile = '/profile/:username?'
    public register = '/profile/register'
    public profilePicture = '/profile/picture'
    public router = express.Router()
    public follow = '/profile/follow/:username?'
    private profileController: ProfileController
    private upload

    constructor(){
        this.profileController = new ProfileController()
        this.upload = new FileService().getUpload()
        this.initRoutes()
    }

    public initRoutes(): void {
        this.router.post(this.register, this.profileController.register)
        this.router.put(this.profilePicture, auth, this.upload.single('file'), this.profileController.updateProfilePicture)
        this.router.put(this.profile, auth, this.profileController.updateProfile)
        this.router.get (this.profile, this.profileController.getProfile)
        this.router.post(this.follow, this.profileController.follow)
    }
}
export default ProfileRoutes
