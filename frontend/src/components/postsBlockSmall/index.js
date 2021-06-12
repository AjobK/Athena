import React, { Component } from 'react'
import {Icon, Loader} from '../../components'
import styles from './postsBlockSmall.scss'

class PostsBlockSmall extends Component {
	constructor(props) {
		super(props)
	}

	bookmarkPost = () => {
	}

	render() {
		const { post } = this.props

		return (
			<div className={ styles.smallPost }>
				<div className={ styles.smallPostThumbnail }>
					<a className={ styles.smallPostThumbnailOverlay } href={ `posts/${ post.path }` } />
					<div className={ styles.smallPostThumbnailContent }>
						<div className={ styles.smallPostThumbnailContentCategory }>
							<span className={ styles.smallPostThumbnailContentCategoryBullet }>
									<Icon iconName={' Circle' } className={ styles.smallPostThumbnailContentCategoryBulletIcon } />
							</span>
							<p>Machine learning</p>
						</div>
						<span className={ styles.smallPostThumbnailContentBookmark } onClick={ this.bookmarkPost }>
							<Icon iconName={ 'Bookmark' } className={ styles.smallPostThumbnailContentBookmarkIcon } />
						</span>
					</div>
					<img src={ 'https://preview.redd.it/e6mr16a9ah071.jpg?width=640&crop=smart&auto=webp&s=bf7f4c3e7f590df70fab692ed64040b27691df76' } alt={ 'post' } />
				</div>
				<div className={ styles.smallPostContent}>
					<h4 className={styles.smallPostContentTitle }>
						{ post.title }
					</h4>
					<p className={ styles.smallPostContentDescription }>
						{ post.description }
					</p>
					<div className={ styles.smallPostContentBottom }>
						<div className={ styles.smallPostContentBottomInfo }>
							<div className={ styles.smallPostContentBottomInfoText }>
								<span className={ styles.smallPostContentBottomInfoTextReadingTime }>
									<Icon iconName={ 'Stopwatch' } className={ styles.smallPostContentBottomInfoTextReadingTimeIcon } />
								</span>
								<p>6 min</p>
							</div>
							<span className={ styles.smallPostContentBottomInfoBullet }>
								&bull;
							</span>
							<div className={ styles.smallPostContentBottomInfoText }>
								<p>10 minutes ago</p>
							</div>
						</div>
						<a href={ '#' } className={ styles.smallPostContentBottomButton }>
							<Icon iconName={ 'ChevronRight' } className={ styles.smallPostContentBottomButtonIcon } />
						</a>
					</div>
				</div>
			</div>
		)
	}
}

export default PostsBlockSmall
