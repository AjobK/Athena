import React, { Component } from 'react'
import { Loader } from '../../components'
import fetch from 'isomorphic-fetch'
import styles from './posts.scss'

class Posts extends Component {
  constructor(props) {
    super(props)
    this.data = []
    this.page = 2
    this.totalPages = 4
    this.scrolling = false
  }

  loadArticle = () => {
    const url = 'http://localhost:8000/api/post'

    fetch(url)
      .then(response => response.json())
      .then(json => {
        this.data = json.data
        // eslint-disable-next-line no-console
        console.log(this.data.data[0])
        this.setNewPosts()
      })
  }

  setNewPosts() {
    let singleLi = document.createElement('li')

    singleLi.classList.add(styles.post)

    for (let i = 0; i < this.data.data.length; i++) {
      let randomRGB = {
        red: Math.random() * 255,
        green: Math.random() * 255,
        blue: Math.random() * 255
      }
      let { red, green, blue } = randomRGB
      let rgb = `rgb(${red},${green},${blue})`

      let article = document.createElement('article')

      article.style.backgroundColor = rgb
      article.classList.add(styles.postItem)
      let postItem = document.createElement('div')

      postItem.innerText = this.data.data[i].title
      postItem.classList.add(styles.postItemText)
      article.appendChild(postItem) // Dit zet de <div> in de <article>
      singleLi.appendChild(article) // Dit zet de <article> in de <li>
    }
    document.getElementsByClassName(styles.article)[0].appendChild(singleLi)
  }

  componentWillMount() {
    this.loadArticle()
    window.addEventListener('scroll', this.handleScroll)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll = () => {
    const { scrolling } = this

    if (scrolling) return
    const lastLi = document.querySelector('.' + styles.article)
    const lastLiOffset = lastLi.offsetTop + lastLi.clientHeight
    const pageOffset = window.pageYOffset + window.innerHeight
    let bottomOffset = window.innerHeight

    if (pageOffset > lastLiOffset - bottomOffset)
      this.loadMore()

    if (window.pageYOffset >= document.body.clientHeight)
      window.scrollTo(0, document.body.clientHeight)
  }


  loadMore = () => {
    this.page = this.page >= this.totalPages / this.page + 1;

    this.scrolling = true
    this.loadArticle()
  }

  render() {
    return (
      <div>
        <ul className={styles.article} />
        <Loader />
      </div>
    )
  }
}

export default Posts
