import React, { Component } from 'react'
import styles from './main.scss'

class Main extends Component {
    createDummyGrid = () => {
        let x  = []
        for (let i = 0; i < 30; i++) {
            x.push(<div className={styles.dummyBlock} style={{
                backgroundColor: `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`
            }}>𝔸{` ${i}`}</div>)
        }
        return x
    }

    render() {
        return (
            <div className={styles.main}>
                <div className={styles.grid}>
                    {this.createDummyGrid()}
                </div>
            </div>
        )
    }
}

export default Main
