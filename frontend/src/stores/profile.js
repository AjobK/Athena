import { types } from 'mobx-state-tree'
import Axios from 'axios'

const ProfileStore = types
  .model('ProfileStore', {
    loaded: types.optional(types.string, 'Nooooo'),
    loggedIn: types.optional(types.boolean, false),
    display_name: types.optional(types.string, 'Emily Washington')

  })
  .actions((self) => ({
    loginVerify() {
      Axios.defaults.baseURL = 'http://localhost:8000'
  
      Axios.get(`/api/login-verify`, { withCredentials: true })
      .then((res) => {
        self.setLoggedIn(true)
        self.setDisplayName(res.data.profile.display_name)
      })
      .catch((e) => {
        self.setLoggedIn(false)
      })
    },
    setLoggedIn(loggedIn) {
      self.loggedIn = loggedIn
    },
    setDisplayName(display_name) {
      self.display_name = display_name
    },
    logOut() {
      Axios.defaults.baseURL = 'http://localhost:8000'

      Axios.get('/api/logout', { withCredentials: true })
      .then(() => {
        self.setLoggedIn(false)
      })
    }
  }))

export default ProfileStore
