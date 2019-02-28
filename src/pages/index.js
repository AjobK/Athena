import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { initStore } from '../stores'
import { Provider } from 'mobx-react'
import Home from './home'
import Profile from './profile'
import Post from './post'
import Error from './error'
import Login from'./login'

class AppRouter extends Component {
  constructor(props) {
    super(props)
    this.store = initStore(true)
  }

  render () {
    return (
      <Provider store={this.store}>
        <Router>
          <div>
            <Route path='/' exact component={Home} />
            <Route path='/profile' exact component={Profile} />
            <Route path='/404' exact component={Error} />
            <Route path='/500' exact component={() => <Error title={500} sub={'Internal server error'} />} />
            <Route path='/posts' exact component={Post} />
            <Route path='/posts/:postUrl' exact component={Post} />
            <Route path='/login' exact component={Login} />
            <Route path='/login/:loginUrl' exact component={Login} />
          </div>
        </Router>
      </Provider>
    )
  }
}

export default AppRouter
