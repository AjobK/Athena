import React, { Component } from 'react'
import styles from './profileInfo.scss'
import Plus from '../../static/icons/plus.svg'
import { PreviewPost } from '../../components'
import { inject, observer } from 'mobx-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit,faSave } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import {Editor, EditorState, ContentState, convertFromRaw, convertToRaw} from 'draft-js'
import Axios from 'axios'

@inject('store') @observer
class ProfileInfo extends Component {
	constructor(props) {
		super(props)

		this.state = {
			user: props.user,
			editing: false,
			editorState: EditorState.createEmpty(),
			changedContent: false,
			icon: faEdit,
		}

		Axios.defaults.baseURL = this.props.store.defaultData.backendUrl
		
	}

	onChange = (editorState) => {
		const user = this.state.user

		user.description = convertToRaw(editorState.getCurrentContent())

		this.setState({user, editorState, changedContent: true})
	}

	componentDidMount = () => {
		let editorState = EditorState.createWithContent(ContentState.createFromText(this.getDescription()))
	
		this.setState({ editorState })
	}
	
	getDescription = () => {
		try {
			const textBlockArray = JSON.parse(this.state.user.description)
			let text = ''

			for (let blockIndex = 0; blockIndex < textBlockArray.blocks.length; blockIndex++) {
				text = text + ' ' + textBlockArray.blocks[blockIndex].text
			}
			
			return text
		} catch {
			return this.state.user.description
		}
	}

	changeEditingState() {
		if (!this.state.editing) {
		  this.setState({
			editing: true,
			icon: faSave
		  })
		} else {
		  this.saveNewDescription()

		  this.setState({
			editing: false,
			icon: faEdit
		  })
		}  
	  }
	

	saveNewDescription = () => {
		if (this.state.changedContent){
			const payload = {
				username: this.state.user.username,
				description: this.state.user.description
			}

			Axios.put('/profile', payload, {withCredentials: true})
		}
	}

	render() {
		let icon

		if (this.state.user.isOwner){
			icon = <FontAwesomeIcon icon={this.state.icon}
			size='lg'/>
		}

		let currentOption = 'EDIT'

		if (this.state.editing) {
			currentOption = 'SAVE'
		}

		return (
			<section className={styles.wrapper}>
				<section className={styles.editor}>
					<Editor 
						readOnly={!this.state.editing}
						editorState={this.state.editorState} 
						onChange={this.onChange} 
						spellCheck={true}/>
				</section>
				<section className={styles.iconContainer} onClick={() => this.changeEditingState()}>
            		{icon}
					<p> {currentOption} </p>
          		</section>
			</section>
		)
	}
}

export default ProfileInfo
