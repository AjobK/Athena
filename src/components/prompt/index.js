import React, { Component } from 'react'
import styles from './prompt.scss'

class Prompt extends Component {

  auth = () => {
    const url = 'http://localhost:8000/api/login'
    const email = document.querySelector('#username').value
    const pass = document.querySelector('#password').value
    const data = {
      email: '' + email + '',
      password: '' + pass + ''
    }
    const formData = new FormData()

    for (let k in data) {
      formData.append(k, data[k]);
    }

    const request = {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: {
        email: 'little.dolores@example.net',
        password: 'admin123'
      }
    }

    fetch(url, request)
      .then(response => response.json())
      .then(json => {
        // eslint-disable-next-line no-console
        console.log(json)
      })
  }

  componentDidMount() {
    // this.props.user = document.querySelector('#username').value
    // this.props.pass = document.querySelector('#password').value
    // document.querySelector('#submit').addEventListener('click', this.auth())
  }

  render() {
    return (
      <div className={[styles.prompt, this.props.className].join(' ')}>
        <div className={styles.logo} />
        <p className={styles.text}> Welcome back! </p>
        <div className={styles.formWrapper}>
          <form className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor='username' className={styles.label}>Username</label>
              <input type='text' id='username' name='username' className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor='password' className={styles.label}>Password</label>
              <input type='password' id='password' name='password' className={styles.input} />
            </div>
            <div to='/' className={styles.submit_wrapper}>
              <input onClick={this.auth} id='submit' type='button' name='submit' value='Log in' className={styles.submit} />
            </div>
          </form>
          <div className={styles.image} />
        </div>
      </div>
    )
  }
}

export default Prompt
