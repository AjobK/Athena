import React, { Component } from 'react'
import styles from './postContentHeading.scss'
import { inject, observer } from 'mobx-react'
import PostContentBlock from '../postContentBlock';

@inject('store') @observer
class PostContentHeading extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: props.value || ''
    }
  }

  getValue() {
    return this.state.value
  }

  render() {
    return (
      <PostContentBlock heading={'heading'}>
        <h3 className={styles.title}>{this.state.value || 'Sample title'}</h3>
      </PostContentBlock>
    )
  }
}

export default PostContentHeading
