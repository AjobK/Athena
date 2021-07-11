import React, { Component } from 'react'
import styles from './profilebar.scss'
import { Link } from 'react-router-dom'
import { inject, observer } from 'mobx-react'

@inject('store') @observer
class ProfileBar extends Component {
  render() {
    const { picture, name, role } = this.props

    return (
      <section className={ styles.profile }>
        <Link to={ '/profile' }>
          <div className={ styles.profilePicture } style={{ backgroundImage: `url('${ picture }')` }}></div>
        </Link>
        <div className={ styles.profileInfo }>
          <div className={ styles.profileInfoWrapper }>
            <h2 className={ styles.profileInfoUserName }>{ name || 'Username' }</h2>
            <p className={ styles.profileInfoUserRole }>{ role || 'Developer' }</p>
          </div>
        </div>
      </section>
    )
  }
}

export default ProfileBar