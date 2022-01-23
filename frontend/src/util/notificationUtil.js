import { popUpData } from '../components/popUp/popUpData'
import { inject } from 'mobx-react'
import { RedirectUtil } from './index'

@inject('store')
class NotificationUtil {
  static showLoginRedirect = (store, history) => {
    const { notification } = store

    notification.setContent(popUpData.messages.loginRequired)
    notification.setActions([
      {
        ...popUpData.actions.cancel,
        action: () => { notification.close() }
      },
      {
        ...popUpData.actions.confirmWithText,
        action: () => {
          RedirectUtil.setRedirectPath(window.location.pathname)
          notification.close()
          history.push('/login/')
        }
      }
    ])
  }

  // TODO: Rework function and function implementations to access store directly from this class
  static showNotification = (store, message) => {
    store.notification.setContent(message)
  }
}

export default NotificationUtil
