import { types, applySnapshot } from 'mobx-state-tree'
import DefaultDataStore from './defaultData'
import PostStore from './post'
import ProfileStore from './profile'
import NotificationStore from './notification'

let store = null

const Store = types
  .model('Store', {
    defaultData: types.optional(DefaultDataStore, {}),
    post: types.optional(PostStore, {}),
    profile: types.optional(ProfileStore, {}),
    notification: types.optional(NotificationStore, {}),
  })

const initStore = (isServer, snapshot = null) => {
  if (isServer) {
    store = Store.create({})
  }

  if (store === null) {
    store = Store.create({})
  }

  if (snapshot) {
    applySnapshot(store, snapshot)
  }

  return store
}

export { initStore }
