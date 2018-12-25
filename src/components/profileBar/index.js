import React, { Component } from 'react'
import styles from './profilebar.scss'
import generateRandomWord from 'random-words'

class ProfileBar extends Component {
    constructor (props) {
        super(props)
    }
    render() {
        const { userName, userRole, level, levelPercentage } = this.props
        return (
            <section className={styles.profile}>
                <div className={styles.profilePicture}>
                    <div className={styles.profileLevel}>
                        <div className={styles.profileLevelNumber}>{level || Math.floor(Math.random() * 100)}</div>
                    </div>
                </div>
                <div className={styles.profileInfo}>
                    <h2 className={styles.profileInfoUserName}>{userName || generateRandomWord(2).join('') + Math.floor(Math.random() * 10)}</h2>
                    <p className={styles.profileInfoUserRole}>{userRole || 'Beginner'}</p>
                </div>
                <div className={styles.level}>
                    <div className={styles.levelProgress} style={{ width: `${levelPercentage}%` || '50%' }} />
                </div>
            </section>
        )
    }
}

export default ProfileBar
