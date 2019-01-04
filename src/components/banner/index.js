import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './banner.scss'

class Banner extends Component {
    constructor (props) {
        super(props)
    }
    render() {
        const { title, description} = this.props
        return (
            <div className={styles.wrapper} background>
                <div className={styles.content}>
                    <h2 className={[styles.title].join(' ')}>
                        {title || 'Title'}
                    </h2>
                    <h3 className={[styles.description].join(' ')}>
                        {description || 'Description'}
                    </h3>
                </div>
            </div>
        )
    }
}

Banner.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    color: PropTypes.string,
}

export default Banner
