import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import styles from './nav.scss'
import { ProfileBar, NavDropdown } from '../../components'

@inject('store') @observer
class NavigationMobile extends Component {
  render() {
    const { ui, nav, user } = this.props.store
    let menuItems = user.loggedIn && nav.menuItemsLoggedIn || nav.menuItemsLoggedOut
    let arr = []

    for (let key in menuItems) {
      if (menuItems.hasOwnProperty(key)) {
        arr.push(
          <NavDropdown
            title={key}
            icon={menuItems[key].icon}
            key={Math.random()}
            value={menuItems[key].children
            } />
        )
      }
    }

    return (
      <section className={[
        styles.navigation,
        ui.subNavOpen && styles.sNavOpen,
        this.props.filler && styles.filler
      ].join(' ')}>
        {!this.props.filler &&
          <div className={styles.menu}>
            {user.loggedIn && <ProfileBar userName={user.name} userRole={user.role} levelPercentage={user.percentage} level={user.level} />}
            <ul className={styles.menuUl}>
              {arr}
            </ul>
          </div>}
      </section>
    )
  }
}

export default NavigationMobile
