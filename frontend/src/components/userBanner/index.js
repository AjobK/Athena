import React, { Component } from 'react'
import styles from './userBanner.scss'
import { inject, observer } from 'mobx-react'
import { Icon, AvatarUpload } from '..'
import Axios from 'axios'
import ColorUtil from '../../util/colorUtil'

@inject('store') @observer
class UserBanner extends Component {
  constructor (props) {
    super(props)

    this.state = {
      upAvatar: null,
      draggingOver: false,
      following: this.props.user.following || false
    }
  }

  onEditAvatar = (input) => {
    input.value = ''

    if (input.target.files && input.target.files.length > 0) {
      const reader = new FileReader()

      reader.addEventListener('load', () => {
        this.setState({
          upAvatar: reader.result
        })
      })
      reader.readAsDataURL(input.target.files[0])
    }

    this.onAvatarDragLeave()
  }

  onAvatarDragEnter = () => {
    this.setState({
      draggingOver: true
    })
  }

  onAvatarDragLeave = () => {
    this.setState({
      draggingOver: false
    })
  }

  changeAvatar = (newAvatar) => {
    this.props.user.picture = newAvatar
  }

  closeAvatarUpload = () => {
    this.setState({
      upAvatar: null
    })
  }

  follow = () => {
    const username = window.location.pathname.split('/').filter(i => i != '').pop()

    Axios.post(`${this.props.store.defaultData.backendUrl}/profile/follow/${username}`, {}, { withCredentials: true })
    .then((res) => {
      this.setState({ following: res.data.following || false })
    })
    .catch(err => {
        console.log('Something went wrong')
    })
  }

  render() {
    const { user, profile } = this.props

    let fontSize = ''

    if (user.username.length >= 22) {
      fontSize = styles.nameSmall
    } else if (user.username.length >= 14) {
      fontSize = styles.nameMedium
    } else if (user.username.length >= 8) {
      fontSize = styles.nameLarge
    }

    const uniqueAvatarColorBasedOnHash = ColorUtil.getUniqueColorBasedOnString(user.username)

    return (
      <section className={ styles.wrapper }>
        <div className={ styles.innerWrapper }>
          <div className={ styles.picture } style={{ backgroundImage: `url(${user.picture})`, backgroundColor: uniqueAvatarColorBasedOnHash }}>
            { this.props.owner && (
                <span className={ `${ styles.pictureEdit } ${ this.state.draggingOver ? styles.pictureDraggingOver : ''}` }>
                  <Icon iconName={ 'Pen' } />
                  <input
                      type="file" accept="image/png, image/jpeg" value={''}
                      onChange={ this.onEditAvatar } onDragEnter={ this.onAvatarDragEnter } onDragLeave={ this.onAvatarDragLeave }
                      style={{ backgroundImage: `url(${ user.picture })`, backgroundColor: uniqueAvatarColorBasedOnHash }}
                  />
                </span>
            )}
            { this.props.store.profile.loggedIn && !user.isOwner &&
              <button className={ `${ styles.follow } ${this.state.following ? styles.replied : ''}` } onClick={ this.follow }>
                <p>{ this.state.following ? 'unfollow' : 'follow' }</p>
                <Icon iconName={ this.state.following ? 'Check' : 'Reply' } classNames={ styles.replyIcon } />
              </button>
            }
          </div>
          <div className={ styles.info }>
            <h2 className={ [styles.name, fontSize].join(' ') }>{ user.username || '' }</h2>
            <div className={ styles.achieved }>
              <h3 className={ styles.role }>{ user.title || '' }</h3>
            </div>
          </div>
        </div>
        <div className={ styles.background } style={{ backgroundImage: `url(${ user.banner })` }} />
        { this.state.upAvatar && (
            <AvatarUpload img={ this.state.upAvatar } closeAvatarUpload={ this.closeAvatarUpload } changeAvatar={ this.changeAvatar }/>
        )}
      </section>
    )
  }
}

export default UserBanner
