import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { resolveValue, Toaster } from 'react-hot-toast'
import styles from './toast.scss'
import { Icon } from '../index'
import { toastData } from './toastData'

@inject('store')
@observer
class Toast extends Component {
  constructor(props) {
    super(props)
  }

  getToastTypeStyles = (toastType) => {
    return styles[`toast${ toastType.charAt(0).toUpperCase() + toastType.slice(1) }`]
  }

  getToastTypeIcon = (toastType) => {
    const { success, error, warning } = toastData.types

    switch (toastType) {
      case success:
        return (<Icon iconName={ 'Check' } />)
      case error:
        return (<Icon iconName={ 'ExclamationCircle' } />)
      case warning:
        return (<Icon iconName={ 'ExclamationTriangle' } />)
    }
  }

  render() {
    return (
      <Toaster
        position='bottom-right'
        reverseOrder={ false }
      >
        { (toast) => {
          const toastInput = JSON.parse(toast.message)

          if (!toastInput.type)
            toastInput.type = 'general'

          const toastTypeStyles = this.getToastTypeStyles(toastInput.type)

          return (
            <div
              className={ [styles.toast, toastTypeStyles].join(' ') }
              style={ { opacity: toast.visible ? 1 : 0 } }
            >
              { resolveValue(
                <>
                  <div className={ styles.toastHeader }>
                    <p className={ styles.toastIcon }>
                      { this.getToastTypeIcon(toastInput.type) }
                    </p>
                    <p className={ [styles.toastText, styles.toastTitle].join(' ') }>
                      { toastInput.title }
                    </p>
                  </div>
                  <p className={ styles.toastText }>
                    { toastInput.description }
                  </p>
                </>, toast)
              }
            </div>
          )}}
      </Toaster>
    )
  }
}

export default Toast
