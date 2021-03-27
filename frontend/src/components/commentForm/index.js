import React, { Component } from 'react'
import Axios from 'axios'
import styles from './commentForm.scss'

import { CommentEditor } from '../'

class CommentForm extends Component {

    constructor(props) {
        super(props)

        this.comment = {
            path: window.location.pathname.split('/').filter(i => i != '').pop(),
            content: null
        }

        this.state = {
            comment: this.comment
        }
    }

    onCommentSubmit = () => {
        const url = `http://localhost:8000/api/comment/`

        Axios.post(url, this.state.comment, {withCredentials: true}).then(response => {
            this.resetComment()
            this.props.onCommentAdd()
        }).catch(err => {
            //TODO: handle error
        })
    }

    resetComment = () => {
        this.comment.content = null
        this.setState({ comment: this.comment })
    }

    render() {
        return (
            <div className="commentForm">
                <CommentEditor 
                    onCommentChangeCallback={(data) => {
                        this.comment.content = data.blocks[0].text

                        this.setState({ comment: this.comment })
                    }}
                    value={this.state.comment.content} 
                />
                <button type="button" onClick={this.onCommentSubmit}>Save</button>
            </div>
        )
    }
}

export default CommentForm;
