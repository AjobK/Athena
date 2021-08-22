import React, { Component } from 'react'
import styles from './postBanner.scss'
import { inject, observer } from 'mobx-react'
import { Icon } from '..';
import { Link } from 'react-router-dom'
import PopUp from '../popUp';

@inject('store') @observer
class PostBanner extends Component {
  constructor (props) {
    super(props)

    this.state = {
      popUpOpen: false
    }
  }

  deletePost() {
    console.log("delete")
  }

  updatePopup() {
    this.setState({
      popUpOpen: true
    })
  }

  render() {
    const { author, isOwner } = this.props
    const content = {
      title: '',
      description: '',
      actions: [{
        title: 'confirm',
        action: this.deletePost,
        primary: true
      }],
      actions: [{
        title: 'cancel',
        action: this.deletePost,
        primary: false
      }]
    }

    return (
      <section className={`${styles.wrapper} ${isOwner ? styles.owner : ''}`}>
        <div className={styles.background} style={{ backgroundImage: `url(${author.bannerURL || ''})` }} />
        {this.props.isOwner &&
          <div className={styles.wrapperEditContainer}>
            <span className={styles.wrapperEdit}>
              <span className={styles.wrapperEditContent}>Click to edit</span> <Icon iconName={'Pen'} />
            </span>
          </div>
        }
        {this.props.store.profile.role != 'User' && 
        <div className={styles.backdrop} onClick={ this.updatePopup.bind(this) }>
          <p className={styles.bannerText}>
            Delete Post 
            <Icon className={styles.icon} iconName={ 'Trash' } />
          </p>
        </div> }
        {this.state.popUpOpen && <PopUp content={content}></PopUp>}
        <div className={styles.innerWrapper}>
          <div className={styles.info}>
            <Link to={`/profile/${author.name}`} className={styles.profileLink}>
              <div className={styles.infoInner}>
                <div className={styles.picture} style={{ backgroundImage: `url(${author.avatarURL || ''})` }} />
                <div className={styles.user_info}>
                  <h2 className={[styles.name].join(' ')}>{ author.name || ''}</h2>
                  <div className={styles.achieved}>
                    <span className={styles.level}>{ Number.isSafeInteger(author.level) ? author.level : '-1'}</span>
                    <h3 className={styles.role}>{ author.title || ''}</h3>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    )
  }
}

export default PostBanner
