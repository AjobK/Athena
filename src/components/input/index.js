import React, { Component } from 'react'
import styles from './input.scss'
// import { inject, observer } from 'mobx-react'

// @inject('store') @observer
class Input extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { name, type, title } = this.props

    return (
      <div className={styles.username}>
        <label for={name} className={styles.label}>{title}</label><br />
        <input type={type} id={name} name={name} className={styles.input} />
      </div>
    )
  }
}

export default Input