import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import styles from './header.scss'
import { Hamburger, HeaderNavigation, NavigationMobile } from '../../components'
import { withRouter } from 'react-router'

@inject('store') @observer
class Header extends Component {
  constructor(props) {
    super(props)

    this.state = {
      subNavOpen: false
    }

    this.currentPath = this.props.location.pathname
  }

  toggleSubNavigation = () => {
    let { subNavOpen } = this.state

    this.setState({ subNavOpen: !subNavOpen })
  }

  closeSubNavigation = () => {
    this.setState({ subNavOpen: false })
  }

  componentWillReceiveProps(newProps) {
    const { pathname } = newProps.location

    if (this.state.subNavOpen && this.currentPath != pathname) {
      this.currentPath = pathname
      this.closeSubNavigation()
    }
  }

  render() {
    const { subNavOpen } = this.state

    return (
      <div className={ [
        styles.headerWrap,
        subNavOpen && styles.sNavOpen
      ].join(' ') }>
        <header className={ styles.header }>
          <section className={ styles.headerContent }>
            <HeaderNavigation subNavOpen={ subNavOpen } />
            <Hamburger
              onClick={ this.toggleSubNavigation }
              active={ subNavOpen }
              className={ styles.hamburger }
            />
          </section>
          <div
            className={ [
              styles.navigationMobile,
              !subNavOpen ? styles.hide : ''
            ].join(' ') }
          >
            <div
              className={ styles.overlay }
              onClick={ this.closeSubNavigation }
            />
            <NavigationMobile className={ styles.navigationMobileBox } />
          </div>
        </header>
      </div>
    )
  }
}

export default withRouter(Header)
