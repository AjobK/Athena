import { types } from 'mobx-state-tree'

const UserStore = types
	.model('UserStore', {
		loggedIn: types.optional(types.boolean, true),
		picture: types.optional(types.string, 'src/static/dummyprofile.png'),
		name: types.optional(types.string, 'Ajob Kustra'),
		role: types.optional(types.string, 'Best Developer'),
		level: types.optional(types.integer, 91),
		percentage: types.optional(types.number, 59.8) // Percentage
	})
	.actions(self => ({
		logOut() {
			self.loggedIn = false
		},
		logIn() {
			self.loggedIn = true
		},
	}))

export default UserStore
