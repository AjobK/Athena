import React, { Component} from 'react'
import { inject, observer } from 'mobx-react';
import { Loader } from '../../components'
import styles from './posts.scss'
import Axios from 'axios'
import PostsBlock from '../postsBlock';

@inject('store') @observer
class Posts extends Component {
	constructor(props) {
		super(props)
		this.MAX_POSTS_IN_BLOCK = 6
		this.totalPages = null
		this.scrolling = false
		this.state = {
			postsBlocks: [],
			isFetching: false,
			page: 0,
			endReached: false
		}
	}

	componentDidMount() {
		this.fetchPosts()
		window.addEventListener('scroll', this.handleScroll)
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this.handleScroll)
	}

	fetchPosts = () => {
		Axios.get(`/api/post/?page=` + this.state.page, { withCredentials: true })
			.then(response => response.data)
			.then(json => {
				if (json.message) {
					this.setEndReached(true)
					return
				}

				this.setState({
					...this.state,
					page: this.state.page + 1
				})
				this.renderNewPosts(json.posts ? json.posts : [])

				if (json.posts.length < this.MAX_POSTS_IN_BLOCK) {
					this.setEndReached(true)
				}
			})
	}

	setEndReached(endReached) {
		this.setState({
			...this.state,
			endReached
		})
	}

	fetchMorePosts = () => {
		if (this.state.endReached) {
			console.log('END REACHED')
			return
		}
		console.log('FETCH MORE')
		this.fetchPosts()
		this.setState({
			...this.state,
			isFetching: false
		})
	}

	handleScroll = () => {
		if (
			Math.ceil(window.innerHeight + document.documentElement.scrollTop) !== document.documentElement.offsetHeight
			|| this.state.isFetching) {
			return;
		}
		this.setState({
			...this.state,
			isFetching: true
		})
		this.fetchMorePosts()
	}

	renderNewPosts = (posts) => {
		let singleLi = document.createElement('li')

		singleLi.classList.add(styles.post)

		let postsBlocks = this.state.postsBlocks

		postsBlocks.push(
			this.createPostsBlock(posts)
		)

		this.setState({
			...this.state,
			postsBlocks
		})
	}

	createPostsBlock = (posts) => {
		return <PostsBlock posts={posts} key={Math.random()}/>
	}

	render() {
		const { postsBlocks } = this.state

		return (
			<div>
				<ul className={styles.posts}>
					{ postsBlocks }
				</ul>
				{ this.state.isFetching || !this.state.endReached && (
					<Loader />
				)}
			</div>
		)
	}
}

export default Posts
