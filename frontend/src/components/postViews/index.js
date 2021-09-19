import React, { Component } from 'react'
import styles from './postViews.scss'
import Axios from 'axios'
import { Icon } from '../../components'
import unitFormatterUtil from '../../util/unitFormatterUtil'
import URLUtil from '../../util/urlUtil'

class PostViews extends Component {
  constructor(props) {
    super(props)
    this.state = { views: 0 }
  }

  loadViews() {
    const path = URLUtil.getLastPathArgument()
    const url = `http://localhost:8000/api/post/view/${path}`

    Axios.get(url)
      .then((response) => {
        this.setState({ views: response.data.views })
      })
      .catch((err) => {
        //TODO: handle error
        console.log(err)
      })
  }

  componentDidMount() {
    this.loadViews()
  }

  render() {
    return (
      <div className={ styles.postViews }>
        <Icon iconName={ 'Eye' } className={ styles.viewIcon } />
        <p className={ styles.postViewsText }>
          { `${unitFormatterUtil.getNumberSuffix(this.state.views)} 
                    ${this.state.views === 1 ? 'view' : 'views'}` }
        </p>
      </div>
    )
  }
}

export default PostViews
