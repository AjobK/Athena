import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { initStore } from '../stores'
import { Provider } from 'mobx-react'
import Home from './home'
import Profile from './profile'
import Post from './post'
import NewPost from'./newPost'
import Error from './error'
import Login from'./login'
import Register from'./register'

class AppRouter extends Component {
  constructor(props) {
    super(props)
    this.store = initStore(true)
  }

  render () {
    return (
      <Provider store={this.store}>
        <Router>
          <Switch>
            <Route path='/' exact component={Home} />
            <Route path='/profile/:path' exact component={Profile} />
            <Route path='/profile' exact component={Profile} />
            <Route path='/404' exact component={Error} />
            <Route path='/500' exact component={() => <Error title={500} sub={'Internal server error'} />} />
            <Route path='/new-post' exact component={() => <NewPost />} />
            <Route path='/posts/:postUrl' exact component={Post} />
            <Route path='/login' exact component={Login} />
            <Route path='/register' exact component={Register} />
            <Route component={Error} />
          </Switch>
        </Router>
      </Provider>
    )
  }
}

export default AppRouter
