import React, { Component } from 'react'
import styles from './profileBanner.scss'
import { inject, observer } from 'mobx-react'
import { Icon, Cropper } from '..'

@inject('store') @observer
class ProfileBanner extends Component {
  constructor (props) {
    super(props)

    this.state = {
      upBanner: null,
      draggingOverBanner: false,
    }
  }

  onEditBanner = (input) => {
    this.handleInput(input, 'upBanner')
    this.onBannerDragLeave()
  }

  banUser() {
    this.setState({ banUser: true })
  }

  handleInput = (input, stateVar) => {
    input.value = ''
    const files = input?.target?.files

    if (files.length > 0) {
      this.setScrollEnabled(false)
      const reader = new FileReader()

      reader.addEventListener('load', () => {
        this.setState({
          [stateVar]: reader.result
        })
      })
      reader.readAsDataURL(files[0])
    }
  }

  onBannerDragEnter = () => {
    this.setState({
      draggingOverBanner: true
    })
  }

  onBannerDragLeave = () => {
    this.setState({
      draggingOverBanner: false
    })
  }

  changeBanner = (newBanner) => {
    this.props.user.banner = newBanner
  }

  closePopup = () => {
    this.setScrollEnabled(true)
    this.setState({
      upAvatar: null,
      upBanner: null,
      banUser: false
    })
  }

  setScrollEnabled = (scrollEnabled) => {
    document.body.style.overflow = scrollEnabled ? 'unset' : 'hidden'
  }

  render() {
    const user = this.props.user
    const role = this.props.role

    return (
      <section className={ styles.wrapper }>
        <div className={ styles.banner }>
          <div className={ styles.bannerImage } style={ { backgroundImage: `url(${ user.banner })` } } />
          { this.props.owner && (
            <div
              className={
                `${ styles.bannerEdit } ${ this.state.draggingOverBanner ? styles.bannerEditDraggingOver : '' }`
              }
            >
              <div className={ styles.bannerEditActionBtn }>
                <p className={ styles.bannerEditActionBtnText }>
                  <span>EDIT BANNER</span>
                  <Icon iconName={ 'Pen' } className={ styles.bannerEditActionBtnIcon } />
                </p>
              </div>
              <input
                type='file' accept='image/png, image/jpeg' value={ '' }
                onChange={ this.onEditBanner }
                onDragEnter={ this.onBannerDragEnter }
                onDragLeave={ this.onBannerDragLeave }
              />
            </div>
          )}
          { role != 'User' && !this.props.owner && this.props.store.profile.loggedIn ? (
            <div
              onDragEnter={ this.onBannerDragEnter }
              onDragLeave={ this.onBannerDragLeave }
              className={
                `${ styles.bannerEdit } ${ this.state.draggingOverBanner ? styles.bannerEditDraggingOver : '' }`
              }
            >
              <input
                type='submit'
                onChange={ this.onEditBanner }
                onDragEnter={ this.onBannerDragEnter }
                onDragLeave={ this.onBannerDragLeave }
                onClick={ this.banUser.bind(this) }
              />
            </div>
          ) : ''}
        </div>

        { this.state.upBanner && (
          <Cropper
            inputType={ 'banner' }
            img={ this.state.upBanner }
            closeCropper={ this.closePopup }
            changeImage={ this.changeBanner }
          />
        )}
      </section>
    )
  }
}

export default ProfileBanner
