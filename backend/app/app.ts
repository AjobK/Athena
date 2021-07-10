import * as cors from 'cors'
import * as bodyParser from 'body-parser'

import serverConstructor from './serverConstructor'
import PostRoutes from './routes/postRoutes'
import AuthorizationRoutes from './routes/authorizationRoutes'
import CommentRoutes from './routes/commentRoutes'
import ProfileRoutes from './routes/profileRoutes'
import RoleRoutes from './routes/roleRoute'
const cookieParser = require('cookie-parser')

const { FRONTEND_URL } = process.env

const backend = new serverConstructor({
    port: 8000,
    routes: [
        new PostRoutes(),
        new AuthorizationRoutes(),
        new CommentRoutes(),
        new ProfileRoutes(),
        new RoleRoutes()
    ],
    middleWares: [
        cookieParser(),
        bodyParser.json(),
        bodyParser.urlencoded({ extended: true }),
        cors({
            origin: [FRONTEND_URL, 'http://localhost:8080', 'http://localhost:3000'],
            credentials: true
        }),
    ]
})

export default backend