import React, { Component } from 'react'
import styles from './userBanner.scss'
import { inject, observer } from 'mobx-react';

@inject('store') @observer
class UserBanner extends Component {
	render() {
		const { user } = this.props.store

		return (
			<section className={styles.wrapper}>
				<div className={styles.innerWrapper}>
					<div className={styles.picture} style={{backgroundImage: `url(${user.picture})` }} />
					<div className={styles.info}>
						<h2>{ user.name || ''}</h2>
						<div className={styles.achieved}>
							<span>{ user.level || ''}</span>
							<h3>{ user.role || ''}</h3>
						</div>
					</div>
				</div>
			</section>
		)
	}
}

export default UserBanner
