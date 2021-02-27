import { types } from 'mobx-state-tree'

const Posts = types
  .model('Posts', {
    title: types.string
  })

const UserStore = types
  .model('UserStore', {
    loggedIn: types.optional(types.boolean, !!localStorage.getItem('token')),
    username: types.optional(types.string, 'Emily Washington'),
    role: types.optional(types.string, 'Software Engineer'),
    picture: types.optional(types.string, '/src/static/dummy/user/profile.jpg'),
    banner: types.optional(types.string, '/src/static/dummy/user/banner.jpg'),
    level: types.optional(types.integer, 12),
    percentage: types.optional(types.number, 10),
  })
  .actions(self => ({
    logOut() {
      self.loggedIn = false
      self.name = ''
      Axios.get('/logout', payload, {withCredentials: true})

    },
    logIn() {
      self.loggedIn = true
    },
    toggleEditing() {
      self.isEditing = !self.isEditing
    },
    fillUserData(user = null) {
      if (user) {
        self.loggedIn = true
        self.username = user.username || self.username
        self.path = user.path || `profile/${self.username}`
      }
    },
    setPosts(posts) {
      self.posts = posts;
    },
    setName(name) {
      self.name = name;
    },
    setTitle(title) {
      self.title = title;
    },
    setLevel(level) {
      self.level = level;
    }
  }))

export default UserStore
