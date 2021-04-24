import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Link } from 'react-router-dom'
import Axios from 'axios'

import styles from './commentSection.scss'

import { Section } from '../../layouts'
import { Comment } from '../'
import { CommentForm } from '../'
@inject('store') @observer
class CommentSection extends Component {
    constructor(props) {
        super(props)
        this.state = { comments: []}
    }

    loadComments() {
        let path = window.location.pathname.split('/').filter(i => i != '').pop()
        const url = `http://localhost:8000/api/comment/${path}`

        Axios.get(url)
        .then(response => {
            // TODO: Forces rerender, but is not the best way to do it... Lack for a better solution
            this.setState({ comments: [] }, () => {
                this.setState({ comments: this.nestComments(response.data) })
            })
        }).catch((err) => {
            console.log(err)
        })
    }

    componentDidMount() {
        this.loadComments()
    }

    onCommentAdd = () => {
        this.loadComments()
    }

    displayCommentForm = () => {
        const { user, profile } = this.props.store
        
        if (profile.loggedIn) {
            return (
                <CommentForm onCommentAdd={this.onCommentAdd} />
            )
        }

        return (
            <p>Please <Link to='/login' className={styles.commentSection__highlightedLink}>log in</Link> to comment to this post</p>
        )
    }

    nestComments = (commentList) => {
        let commentMap = {}
        commentList.forEach((comment) => {
            commentMap[comment.id] = comment
        })

        if (commentList.length > 0) {
            commentList.forEach(comment => {
                if (comment.parent_comment_id !== null) {
                    const parent = commentMap[comment.parent_comment_id]

                    parent.children ? parent.children.push(comment) : parent.children = [comment]
                }
            })
        }

        let filteredComments = commentList.filter(comment => {
            return comment.parent_comment_id === null
        })

        return filteredComments
    }

    render() {
        return (
            <div className={styles.commentSection}>
                <Section noTitle>
                    { this.displayCommentForm() }
                    { this.state.comments && this.state.comments.length > 0
                        ? this.state.comments.map((comment) => (
                            <Comment key={comment.id} comment={comment} onReplyAdd={this.onCommentAdd} />
                        ))
                        : <p>No comments</p>
                    }
                </Section>
            </div>
        )
    }
}

export default CommentSection
