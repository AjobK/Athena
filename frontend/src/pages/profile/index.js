import React from 'react'
import App from '../App'
import { Standard, Section } from '../../layouts'
import { observer, inject } from 'mobx-react'
import { UserBanner, PostsPreview, Statistics, Loader, ProfileInfo } from '../../components'
import Axios from 'axios'
import Error from '../error'

@inject('store') @observer
class Profile extends App {

  constructor(props) {
    super(props)

    this.state = {
      user: null,
      error: false
    }

    this.loadDataFromBackend()
  }

  loadDataFromBackend() {
    const { path } = this.props.match.params

    this.fetchProfileData(path || '')
  }

  fetchProfileData(path) {
    let token = localStorage.getItem('token')

    Axios.get(`${this.props.store.defaultData.backendUrl}/profile/${path}`,  {withCredentials: true})
      .then((response) => {
        this.updateProfile(response.data.profile)
      })
      .catch(() => {
        this.setState({ error: true })
      })
  }

  calcLevel(cXp) {
    let xp = {
      current: cXp,
      base: 20,
      max: 20
    }

    let level = 1

    for (let i = 1; xp.current > xp.max; i++) {
      xp.current -= xp.max
      xp.max = ~~(xp.max * 1.2)
      level++
    }

    return level
  }

  updateProfile(profile) {
    console.log(profile)
    const user = {
      isOwner: profile.isOwner,
      username: profile.username,
      title: profile.title,
      level: this.calcLevel(profile.experience),
      posts: profile.posts,
      banner: profile.banner || '/src/static/dummy/user/banner.jpg',
      picture: profile.avatar || '/src/static/dummy/user/profile.jpg',
      description: profile.description
    }

    this.setState({ user })
  }

  render() {
    const { user, error } = this.state

    if (!user && !error) {
      return (
        <Standard>
          <Loader />
        </Standard>
      )
    }

    if (error) {
      return (
        <Error></Error>
      )
    }

    return (
      <Standard>
        <UserBanner user={user} />
        <Section title={'Info'}>
          <ProfileInfo description={user.description} create={user.isOwner && this.props.store.user.loggedIn} />
        </Section>
        <Section title={'CREATED POSTS'}>
          <PostsPreview posts={user.posts} create={user.isOwner && this.props.store.user.loggedIn} />
        </Section>
        <Section title={'LIKED POSTS'}>
          <PostsPreview posts={user.posts} />
        </Section>
        <Section title={'STATISTICS'}>
          <Statistics />
        </Section>
      </Standard>
    )
  }
}

export default Profile
