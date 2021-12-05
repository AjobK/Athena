import React, { Component } from 'react'
import styles from './navigationMobileElement.scss'
import { Icon } from '..'
import { Link } from 'react-router-dom'

class NavigationMobileElement extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { title, index, icon, onClick, to } = this.props

    return (
      <li className={ styles.item } key={ index }>
        <Link
          className={ styles.itemHeading }
          to={ to || '' }
          onClick={ onClick }
        >
          <Icon iconName={ icon } className={ styles.icon } />
          {title}
        </Link>
      </li>
    )
  }
}

export default NavigationMobileElement
