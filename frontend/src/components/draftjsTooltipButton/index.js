import React, { Component } from 'react'
import styles from './draftjsTooltipButton.scss'
import { Icon } from '../../components'

class DraftJsTooltipButton extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { isHeadingButton, iconName, icon, prefix, mouseDown } = this.props

    return (
      <button onMouseDown={ mouseDown } className={ styles.draftJsButton }>
        { isHeadingButton
          ? <figure><img src={ iconName } alt={ iconName }/></figure>
          : <Icon prefix={ prefix } iconName={ iconName } icon={ icon } />
        }
      </button>
    )
  }

}

export default DraftJsTooltipButton
