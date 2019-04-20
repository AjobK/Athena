import React, { Component } from 'react'
import styles from './postContentParagraph.scss'
import { inject, observer } from 'mobx-react'
import PostContentBlock from '../postContentBlock';

@inject('store') @observer
class PostContentParagraph extends Component {  
  constructor(props) {
    super(props)
    this.type = 'paragraph'
    this.state = {
      value: props.value || ''
    }
  }

  onClick = () => {
    this.callBackData()
  }

  setValue = (e) => {
    this.setState({
      value: e.target.value
    }, () => {
      this.callBackData()
    })
  }

  callBackData = () => {
    if (this.props.theCB)
      this.props.theCB(this)
  }

  render() {
    return (
      <>
        <PostContentBlock heading={'paragraph'}>
          <textarea className={styles.paragraph} onClick={this.onClick} value={this.state.value || ''} onChange={this.setValue}/>
        </PostContentBlock>
        <br />
      </>
    )
  }
}

export default PostContentParagraph
