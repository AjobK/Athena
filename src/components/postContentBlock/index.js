import React, { Component } from 'react'
import styles from './PostContentBlock.scss'
import { PostEditHeading } from '..';
import { inject, observer } from 'mobx-react'

@inject('store') @observer
class PostContentBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      editing: false
    }
  }

  edit = () => {
    this.setState({
      editing: true
    })
  }

  quitEdit = () => {
    this.setState({
      editing: false
    })
  }

  render() {
    const { user } = this.props.store
    const { children, heading, className, onClick } = this.props

    console.log(this.props.callBackItemRemoval)

    return (
      <section className={styles.paragraphWrapper} onClick={onClick}>
        {user.loggedIn && <PostEditHeading editing={this.state.editing} heading={heading} />}
        <span> remove </span>
        <div className={[styles.paragraph, ...className || ''].join(' ')} onFocus={this.edit} onBlur={this.quitEdit}>
          {
            children || <p> NO CONTENT </p>
          }
        </div>
      </section>
    )
  }
}

export default PostContentBlock
