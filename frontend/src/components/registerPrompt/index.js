import React, { Component } from 'react'
import styles from './registerPrompt.scss'
import { inject, observer } from 'mobx-react'
import { Icon, FormInput, Button } from '../'
import { withRouter } from 'react-router-dom'
import Axios from 'axios'
import Recaptcha from '../recaptcha'

@inject('store') @observer
class RegisterPrompt extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: null,
      email: null,
      password: null,
      recaptchaToken: null,
      loadRecaptcha: false
    }

    this.elId = {}
  }

  auth = () => {
    Axios.defaults.baseURL = this.props.store.defaultData.backendUrl

    if (!this.state.recaptchaToken) {
      this.setState({
        username: ["invalid recaptcha"],
        password: ["invalid recaptcha"],
        email: ["invalid recaptcha"]
      })
    }

    const payload = {
      username: document.getElementById(this.elId.Username).value,
      email: document.getElementById(this.elId.Email).value,
      password: document.getElementById(this.elId.Password).value,
      recaptcha: this.state.recaptchaToken
    }

    Axios.post('/profile/register', payload, {withCredentials: true})
    .then(res => {
      this.props.store.profile.loginVerify()
      this.props.store.user.fillUserData(res.data.user)
      this.goToProfile(res.data.user.user_name)
    })
    .catch(res => {
      const { username, email, password } = res.response.data.errors

      this.setState({
        username: username || [],
        email: email || [],
        password: password || [],
        loadingTimeout: false
      })
    })
  }

  goToProfile = (username) => {
    setTimeout( () => this.props.history.push('/profile/' + username), 500)
  }

  setElId = (item, id) => {
    this.elId[item.props.name] = id
  }
  

  onSubmit = (e) => {
    e.preventDefault()

    if (this.state.remainingTime && this.remainingTimeInterval) return

    this.setState({
      username: 'loading',
      password: 'loading',
      email: 'loading'
    })
    
    this.auth()
  }

  setRecaptcha(recaptcha) {
    this.setState({
      recaptchaToken: recaptcha
    })
  }

  render() {
    const { username, email, password, recaptcha } = this.state
    let buttonClass = Array.isArray(recaptcha) && recaptcha.length > 0 ? 'Try again...' : 'Sign Up'

    return (
      <div className={[styles.prompt, this.props.className].join(' ')}>
        <div className={styles.logo} />
        <p className={styles.text}>Join our community <Icon className={styles.textIcon} iconName={'Crow'} /></p>
        <div className={styles.formWrapper}>
          <form onSubmit={this.onSubmit} className={styles.form}>
            <FormInput name={'Username'} errors={username} className={[styles.formGroup]} callBack={this.setElId}/>
            <FormInput name={'Email'} errors={email} className={[styles.formGroup]} callBack={this.setElId}/>
            <FormInput name={'Password'} errors={password} className={[styles.formGroup]} callBack={this.setElId} type="password"/>
            <div className={styles.submitWrapper}>
              { 
                <Recaptcha setRecaptcha={this.setRecaptcha.bind(this)}/>
              }
              <Button value={buttonClass} className={styles.submit} />
            </div>
          </form>
          <div className={styles.image} />
        </div>
        <p className={styles.textFooter}>
          By proceeding I confirm that I have read and agree to the <a className={styles.textFooterLink}href='#'>Terms of service</a>
        </p>
      </div>
    )
  }
}
export default withRouter(RegisterPrompt)
