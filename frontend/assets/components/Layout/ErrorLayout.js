import React from 'react'

import Header from './Header'
import Footer from './Footer'

import './index.scss'

const Layout = ({ children }) => {
    return [
        <Header key="header"/>,
        <div className="error-container" key="errorContainerPc">
            {children}
        </div>,
        <Footer key="footer"/>
    ]
}

export default Layout
