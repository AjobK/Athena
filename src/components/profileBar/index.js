import React, { Component } from 'react'
import styles from './profilebar.scss'
import { Link } from 'react-router-dom'

class ProfileBar extends Component {
  render() {
    const { userName, userRole, level, levelPercentage } = this.props

    return (
      <section className={styles.profile}>
        <Link to={'/profile'}>
          <div className={styles.profilePicture}>
            <div className={styles.profileLevel}>
              <div className={styles.profileLevelNumber}>{level || Math.floor(Math.random() * 100)}</div>
            </div>
          </div>
        </Link>
        <div className={styles.profileInfo}>
          <div className={styles.profileInfoWrapper}>
            <h2 className={styles.profileInfoUserName}>{userName || 'Username'}</h2>
            <p className={styles.profileInfoUserRole}>{userRole || 'Beginner'}</p>
          </div>
          <div className={styles.level}>
            <div className={styles.levelProgress} style={{ width: (levelPercentage && `${levelPercentage}%` || '50%') }} />
          </div>
        </div>
      </section>
    )
  }
}

export default ProfileBar
