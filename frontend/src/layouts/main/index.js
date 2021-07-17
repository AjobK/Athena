import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import styles from './main.scss'
import { PopUp, Posts } from '../../components'

// TODO remove pop up

@inject('store') @observer
class Main extends Component {
    render() {
        return (
            <div className={styles.wrapper}>
                <div className={styles.main}>
                    <PopUp
                        title={'Er is een probleem'}
                        description={'oepsie woepsie! de website is stukkie wukkie! we sijn heul hard aan t werk om dit te make mss kan je beter het opnieuw pwoberen owo'}
                        actions={[
                            {
                                title: 'Sluiten',
                                action: () => {console.log('close')},
                                primary: false
                            },
                            {
                                title: 'Bevestigen',
                                action: () => {console.log('confirm')},
                                primary: true
                            },
                            // {
                            //     title: 'Decision C',
                            //     action: () => {console.log('C')},
                            //     type: 'primary'
                            // },
                        ]}
                        close={() => {console.log('close')}}
                    />
                    <div className={styles.grid}>
                        <Posts />
                    </div>
                </div>
            </div>
        )
    }
}

export default Main
