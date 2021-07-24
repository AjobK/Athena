import React from 'react'
import App from '../App'
import { observer, inject } from 'mobx-react'
import { Standard, Section } from '../../layouts'
import { PostBanner, PostContent, Button, Icon, PostLike, CommentSection } from '../../components'
import { withRouter } from 'react-router-dom'
import Axios from 'axios'
import styles from './post.scss'
import { convertFromRaw } from 'draft-js'

@inject('store') @observer
class Post extends App {
    constructor(props) {
        super(props)

        this.post = {
            title: '',
            description: '',
            content: '',
            path: '',
            likes: {
                amount: 0,
                userLiked: false
            }
        }

        this.state = {
            isOwner: true,
            isEditing: true,
            author: {
                name: '',
                bannerURL: '',
                avatarURL: '',
                path: '/profile/',
                title: ''
            },
            loaded: false,
            post: this.post
        }
    }

    loadArticle = () => {
        let path = window.location.pathname.split('/').filter(i => i != '').pop()

        const { defaultData } = this.props.store

        Axios.get(`${defaultData.backendUrl}/post/${path}`, {withCredentials: true})
        .then(res => {

            const { post, likes, isOwner } = res.data

            this.post = {
                title: post.title,
                content: post.content,
                description: post.description,
                path: path,
                likes: {
                    amount: likes.amount,
                    userLiked: likes.userLiked
                }
            }

            try {
                this.post = {
                    title: convertFromRaw(JSON.parse(post.title)),
                    content: convertFromRaw(JSON.parse(post.content)),
                    description: '',
                    path: path,
                    likes: {
                        amount: likes.amount,
                        userLiked: likes.userLiked
                    }
                }
            } catch (e) {
                this.post = {
                    title: post.title,
                    content: post.content,
                    description: post.description,
                    path: path,
                    likes: {
                        amount: likes.amount,
                        userLiked: likes.userLiked
                    }
                }
            }

            let author = {
                name: post.profile.display_name,
                bannerURL: '/src/static/dummy/user/banner.jpg',
                avatarURL: post.profile.avatar_attachment 
                    ? `${defaultData.backendUrlBase}/${post.profile.avatar_attachment}`
                    : '/src/static/dummy/user/profile.jpg',
                path: `/profile/${post.profile.display_name}`,
                title: post.profile.title || 'No title'
            }

            this.setState({
                post: this.post,
                loaded: true,
                isOwner: isOwner,
                isEditing: true,
                author: author
            })
        })
    }

    loadAuthor = () => {
        /* TODO
            display_name doesn't work for some reason (probably because I don't understand store
            load avatar
         */
        const storeProfile = this.props.store.profile
        const storeUser = this.props.store.user
        this.setState({
            author: {
                name: storeProfile.display_name,
                bannerURL: storeUser.banner,
                avatarURL: '/src/static/dummy/user/profile.jpg',
                title: 'Default Title'
            }
        })
    }

    toggleLike = () => {
        // Toggles liked state for all like components
        let newState = this.state

        // Increment/decrement likes locally
        let newLikesAmount
        if (this.state.post.likes.userLiked && newState.post.likes.amount > 0) {
            newLikesAmount = this.state.post.likes.amount - 1
        } else {
            newLikesAmount = this.state.post.likes.amount + 1
        }
        newState.post.likes.amount = newLikesAmount
        this.state.post.likes.userLiked = !this.state.post.likes.userLiked

        this.setState(newState)
    }

    componentDidMount() {
        if (!this.props.new)
            return this.loadArticle()
        return this.loadAuthor()
    }

    sendToDB(path=null) {
        Axios.defaults.baseURL = this.props.store.defaultData.backendUrl

        const payload = {
            title: this.state.post.title,
            description: 'None',
            content: this.state.post.content
        }

        if (!path) {
            Axios.post('/post', payload, { withCredentials: true })
            .then(res => {
                this.props.history.push('/')
            })
        } else if (typeof path == 'string') {
            Axios.put(`/post/${path}`, payload, { withCredentials: true })
            .then(res => {
                this.props.history.push('/profile')
            })
        }
    }

    render() {
        // Values change based on initial response from server
        const { isEditing, isOwner, post, loaded, author } = this.state

        if (!loaded && !this.props.new) return (<h1>Not loaded</h1>)

        return (
            <Standard className={[styles.stdBgWhite]}>
                <PostBanner author={author} isOwner={isOwner} />
                <Section noTitle>
                { !this.props.new &&
                    <div className={styles.likePostWrapper}>
                        <PostLike
                            likesAmount={this.state.post.likes.amount || 0}
                            liked={this.state.post.likes.userLiked}
                            toggleLike={this.toggleLike}
                            isOwner={isOwner}
                        />
                    </div>
                }
                <div className={styles.renderWrapper}>
                <PostContent
                    type={'title'}
                    // Saves post title with draftJS content
                    callBackSaveData={(data) => {
                        this.post.title = data

                        this.setState({ post: this.post })
                    }}
                    readOnly={!isOwner || !isEditing}
                    value={post.title} // Initial no content, should be prefilled by API
                />
                <PostContent
                    type={'content'}
                    // Saves post content with draftJS content
                    callBackSaveData={(data) => {
                        this.post.content = data

                        this.setState({ post: this.post })
                    }}
                    readOnly={!isOwner || !isEditing}
                    value={post.content} // Initial no content, should be prefilled by API
                />
                </div>
                {
                    isOwner && this.props.new &&
                    <Button
                        className={[styles.publishButton, /* isPublished ? styles.published : */''].join(' ')}
                        value={'Create'}
                        onClick={() => this.sendToDB()}
                    />
                }
                {
                    isOwner && isEditing && !this.props.new &&
                    <Button
                        className={[styles.publishButton, /* isPublished ? styles.published : */''].join(' ')}
                        value={'Update'}
                        onClick={() => this.sendToDB(this.post.path)}
                    />
                }
                </Section>
                { !this.props.new && <CommentSection/> }
            </Standard>
        )
    }
}

export default withRouter(Post)
