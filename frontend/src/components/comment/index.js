import React, { Component } from 'react'
import styles from './comment.scss'
import { observer, inject } from 'mobx-react'
import { Link } from 'react-router-dom'
import { Editor, EditorState, convertFromRaw } from 'draft-js'
import { CommentForm, CommentChildren, Icon, Dialog } from '../'

import TimeUtil from '../../util/timeUtil'
import ColorUtil from '../../util/colorUtil'
import axios from 'axios'

@inject('store')
@observer
class Comment extends Component {
  constructor(props) {
    super(props)
    this.state = {
      editorState:
        props.comment.content != null
          ? EditorState.createWithContent(convertFromRaw(JSON.parse(props.comment.content)))
          : EditorState.createEmpty(),
      isReplying: false,
      showReplies: false,
      isDeleting: false,
    }

    if (this.props.comment && this.props.comment.parent_comment_id) {
      this.isReply = true
    }
  }

  displayAvatar = () => {
    const { defaultData } = this.props.store
    const { avatar_attachment, display_name } = this.props.comment.profile

    if (!this.isReply) {
      return (
        <div className={ styles.comment__avatar }>
          <img
            src={
              avatar_attachment.path
                ? `${defaultData.backendUrlBase}/${avatar_attachment.path}`
                : require('../../static/dummy/user/profile.jpg')
            }
            className={ styles.comment__avatarPicture }
            style={ { backgroundColor: ColorUtil.getUniqueColorBasedOnString(display_name) } }
          />
        </div>
      )
    }
  }

  displayCommentForm = () => {
    if (!this.isReply && this.state.isReplying) {
      return (
        <div className={ styles.comment__replyForm }>
          <CommentForm type="reply" parent_comment={ this.props.comment.id } onCommentAdd={ this.onReplyAdd } />
        </div>
      )
    }
  }

  onReplyAdd = () => {
    this.props.onReplyAdd()
    this.setState({ showReplies: true })
  }

  onReplyClick = () => {
    this.setState({ isReplying: !this.state.isReplying })
  }

  onDeleteClick = () => {
    this.setState({ isDeleting: true })
  }

  onDeleteConfirm = () => {
    const url = `http://localhost:8000/api/comment/${this.props.comment.id}`

    axios
      .delete(url, { withCredentials: true })
      .then((_res) => {
        this.props.onReplyAdd()
      })
      .catch((err) => {
        console.log(err)
      })
  }

  onDeleteCancelClick = () => {
    this.setState({ isDeleting: false })
  }

  displayReplyButton = () => {
    if (!this.isReply) {
      return (
        <div className={ styles.comment__replyButton }>
          <Icon iconName={ 'Reply' } className={ styles.comment__replyButtonIcon } onClick={ this.onReplyClick } />
        </div>
      )
    }
  }

  render() {
    const { comment } = this.props
    const { profile } = this.props.store
    const { showReplies, isReplying } = this.state

    if (comment) {
      return (
        <article className={ `${styles.comment} ${this.isReply && styles.reply}` }>
          <div className={ `${styles.comment__body} ${isReplying ? styles.isReplying : ''}` }>
            <Link to={ `/profile/${comment.profile.display_name}` }>{this.displayAvatar()}</Link>
            <div className={ styles.comment__main }>
              <div className={ styles.comment_content }>
                <div className={ styles.comment__header }>
                  <div className={ styles.comment__headerAuthor }>
                    <Link to={ `/profile/${comment.profile.display_name}` } className={ styles.comment__headerAuthor }>
                      {comment.profile.display_name}
                    </Link>
                  </div>
                  <div className={ styles.comment__headerPublishedTime }>
                    {TimeUtil.timeAgo(new Date(comment.created_at))}
                  </div>
                </div>
                <div className={ styles.comment__content }>
                  <Editor editorState={ this.state.editorState } readOnly={ true } />
                </div>
              </div>
              <div className={ styles.comment__interactive }>
                {comment.children && comment.children.length > 0 && (
                  <>
                    <button
                      onClick={ () => this.setState({ showReplies: !showReplies }) }
                      className={ showReplies ? styles.showReplies : '' }
                    >
                      {comment.children.length} repl{comment.children.length > 1 ? 'ies' : 'y'}
                      <span>{/* Underline animation */}</span>
                    </button>
                    <span className={ styles.seperator }></span>
                  </>
                )}
                {profile.loggedIn && comment.profile.display_name === profile.display_name && (
                  <>
                    <Icon
                      iconName={ 'Trash' }
                      className={ styles.comment__deleteButtonIcon }
                      onClick={ this.onDeleteClick }
                    />
                    {!this.isReply && <span className={ styles.seperator }></span>}
                  </>
                )}
                {profile.loggedIn && this.displayReplyButton()}
              </div>
            </div>
          </div>
          {profile.loggedIn && this.displayCommentForm()}
          {showReplies && <CommentChildren commentChildren={ comment.children } />}
          {this.state.isDeleting && (
            <Dialog
              header="Deleting comment"
              body="Are you sure you want to delete this comment?"
              onConfirmCallback={ this.onDeleteConfirm }
              onCloseCallback={ this.onDeleteCancelClick }
            />
          )}
        </article>
      )
    }
  }
}

export default Comment
