import React from 'react'
import {Route, BrowserRouter} from 'react-router-dom'

import App from './App'
import Privacy from './Privacy'

export default function() {
    return (
        <BrowserRouter>
            <Route path="/" exact component={App} />
            <Route path="/privacy" exact component={Privacy} />
        </BrowserRouter>
    )
}
