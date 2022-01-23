import React, { Component } from 'react'
import * as icons from '@mui/icons-material'
import { SvgIcon } from '@mui/material'

class MaterialIcon extends Component {
  render() {
    const { className, iconName, onMouseDown, onMouseUp, style } = this.props
    const Icon = icons[iconName]

    return (
      <SvgIcon
        component={ Icon }
        className={ className }
        onMouseDown={ onMouseDown }
        onMouseUp={ onMouseUp }
        style={ style }
      />
    )
  }
}

export default MaterialIcon
