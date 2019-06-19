import React, { Component } from 'react'
import Axios from 'axios'
import styles from './loginPrompt.scss'
import { Button, FormInput } from '../../components'
import { inject, observer } from 'mobx-react'
import { withRouter } from 'react-router-dom'
import { loadReCaptcha, ReCaptcha } from 'react-recaptcha-google'

@inject('store') @observer
class LoginPrompt extends Component {
  constructor(props) {
    super(props)

    this.state = {
      user_name: null,
      password: null,
      recaptcha: null,
      recaptchaToken: null,
      remainingTimeInterval: null,
      remainingTime: null,
    }

    this.elId = {}
  }
  componentDidMount(){
    loadReCaptcha()
    this.verifyCallback = this.verifyCallback.bind(this)
  }

  auth = () => {
    Axios.defaults.baseURL = this.props.store.defaultData.backendUrl

    const payload = {
      user_name: document.getElementById(this.elId.Username).value,
      password: document.getElementById(this.elId.Password).value,
      recaptcha: this.state.recaptchaToken
    }

    Axios.post('/login', payload)
    .then(res => {
      Axios.get('/user', {
        mode:'cors',
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type':'application/json', 'Authorization': `Bearer ${res.data.token}` }
      })
      .then(user => {
        localStorage.setItem('token', res.data.token)

        return user.data.user
      })
      .then(user => {
          this.props.store.user.fillUserData(user)
          this.goToProfile()
      })
    })
    .catch(res => {
      const { error, remainingTime } = res.response.data

      if (remainingTime) this.setRemainingTimeInterval(remainingTime)
      
      this.setState({
        user_name: error || [],
        password: error || [],
        recaptcha: recaptcha || [],
        recaptchaToken: null
      })
    })
  }

  setRemainingTimeInterval = (remainingTime) => {
    if (this.remainingTimeInterval) clearInterval(this.remainingTimeInterval)

    this.setState({ remainingTime })

    this.remainingTimeInterval = setInterval(() => {
      let nextTime = this.state.remainingTime-1
      if (this.state.remainingTime <= 1) {
        clearInterval(this.remainingTimeInterval)
        nextTime = null
      }
      this.setState({
        remainingTime: nextTime
      })
    }, 1000);
  }

  goToProfile = () => {
    this.props.history.push('/profile')
  }

  onSubmit = (e) => {
    e.preventDefault()
    if (this.state.remainingTime && this.remainingTimeInterval) return

    this.setState({
      user_name: 'loading',
      password: 'loading'
    })
    this.state.recaptchaToken == null ? this.loadCaptchaOnSubmit() : this.auth()
  }

  loadCaptchaOnSubmit = () =>{
    if (this.captcha) {
      this.captcha.reset()
      this.captcha.execute()
    }
  }
  
  verifyCallback = (recaptchaToken) => {
    this.setState({ recaptchaToken })
    this.auth()
  }

  setElId = (item, id) => {
    this.elId[item.props.name] = id
  }

  render() {
    const { user_name, password, recaptcha, remainingTime } = this.state
    let buttonClass = Array.isArray(recaptcha) && recaptcha.length > 0 ? 'Try again...' : 'Log In'

    return (
      <div className={[styles.prompt, this.props.className].join(' ')}>
        <div className={styles.logo} />
        <p className={styles.text}> Welcome back!</p>
        <div className={styles.formWrapper}>
          <form onSubmit={this.onSubmit} className={styles.form}>
            <FormInput name={'Username'} errors={user_name} className={[styles.formGroup]} callBack={this.setElId}/>
            <FormInput name={'Password'} errors={password} className={[styles.formGroup]} callBack={this.setElId} password/>
            <div to='/' className={styles.submitWrapper}>
              <Button value={buttonClass} className={styles.submit} disabled={!!remainingTime} />
              { remainingTime && <p className={styles.counter}>{`${remainingTime}s left`}</p>}
              <ReCaptcha
                ref={(el) => {this.captcha = el}}
                size='invisible'
                render='explicit'
                sitekey='6Lev1KUUAAAAAKBHldTqZdeR1XdZDLQiOOgMXJ-S'
                verifyCallback={this.verifyCallback}
              />
            </div>
          </form>
          <div className={styles.image} />
        </div>
      </div>
    )
  }
}

export default withRouter(LoginPrompt)