import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import Header from '../header'
import styles from './nav.scss'
import { ProfileBar, NavDropdown } from '../../components'

@inject('store') @observer
class Navigation extends Component {
    componentDidMount () {
        const { nav } = this.props.store
        this.setState({
            menuItems: nav.menuItems
        })
    }

    render () {
        const { ui, nav, user } = this.props.store
        const { filler, fillerWidthOnly } = this.props

        const menuItems = user.loggedIn ? nav.menuItemsLoggedIn : nav.menuItemsLoggedOut

        return (
            <section className={[
                fillerWidthOnly && styles.fillerWidth || styles.navigation,
                filler && styles.filler
            ].join(' ')}>
                {!filler && !fillerWidthOnly &&
                <div className={styles.menu}>
                    <ul className={styles.menuUl}>
                        {Object.keys(menuItems).map((item, index) => (
                            <div className={styles.menuItem} key={index}>
                                <p>{item[0]}</p>
                            </div> 
                        ))}
                    </ul>
                </div>}
            </section>
        )
    }
}

export default Navigation
