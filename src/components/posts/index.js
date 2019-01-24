import React, { Component } from 'react'
import fetch from 'isomorphic-fetch'
import Contact from './posts'
import styles from './posts.scss'

class Posts extends Component {
  constructor (props) {
    super(props)
    this.state = {
      contacts: [],
      per: 10,
      page: 1,
      totalPages: null,
    }
  }
  
  loadContacts = () => {
      const { per, page, contacts } = this.state
      const url = `https://student-example-api.herokuapp.com/v1/contacts.json?per=${per}&page=${page}`
      fetch(url)
      .then(response => response.json())
      .then(json => this.setState({
        contacts: [...contacts, ...json.contacts],
        scrolling: false,
        totalPages: json.totalPages,
      }))
  }

	loadContacts = () => {
		const { per, page, contacts } = this.state
		const url = `https://student-example-api.herokuapp.com/v1/contacts.json?per=${per}&page=${page}`
		fetch(url)
			.then(response => response.json())
			.then(json => this.setState({
				contacts: [...contacts, ...json.contacts],
				scrolling: false,
				totalPages: json.totalPages,
			}))
	}

	componentWillMount() {
		this.loadContacts()
		this.scrollListener = window.addEventListener('scroll', (e) => {
			this.handleScroll(e)
		})
	}

	handleScroll = (e) => {
		const { scrolling, totalPages, page } = this.state
		if (scrolling) return
		if (totalPages <= page) return
		const lastLi = document.querySelector('ul.contacts > li:last-child')
		const lastLiOffset = lastLi.offsetTop + lastLi.clientHeight
		const pageOffset = window.pageYOffset + window.innerHeight
		let bottomOffset = window.innerHeight
		if (pageOffset > lastLiOffset - bottomOffset) this.loadMore()
	}


	loadMore = () => {
		this.setState(prevState => ({
			page: prevState.page + 1,
			scrolling: true
		}), this.loadContacts)
	}

	render() {
		return <div>
			<ul className="contacts">
				{
					this.state.contacts.map(contact => (
						<li key={contact.id} className={styles.post}>
							<Contact {...contact} />
						</li>
					))
				}
			</ul>
		</div>
	}
}

export default Posts
