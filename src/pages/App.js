import React, { Component } from 'react'
import { Provider } from 'mobx-react'
import { initStore } from '../stores'
import { Header, SideNavigation, Main } from '../layouts'
import styles from './App.scss'

class App extends Component {
    constructor (props) {
        super(props)
        this.store = initStore(true)
    }

    componentDidMount() {
        document.querySelector(`.${styles.lowerOrder}`).addEventListener('mousedown', this.preventXScroll);
    }

    preventXScroll = (e) => {
        const { ui } = this.store
        if (e.which == 2 && ui.subNavOpen) e.preventDefault()
    }

    render() {
        return (
            <Provider store={this.store}>
                <section className={styles.wrapper}>
                    <aside className={styles.higherOrder}>
                        <Header />
                        <SideNavigation />
                    </aside>
                    <main className={styles.lowerOrder}>
                        <Header filler /> {/* Filler aligns content */}
                        <SideNavigation filler /> {/* Filler aligns content */}
                        <Main />
                    </main>
                </section>
            </Provider>
        )
    }
}

export default App
