import React from 'react'
import {Route, BrowserRouter} from 'react-router-dom'

import App from './App'
import Privacy from './Privacy'
import Instructions from './Instructions'

export default function() {
    return (
        <BrowserRouter>
            <Route path="/" exact component={App} />
            <Route path="/privacy" exact component={Privacy} />
            <Route path="/instructions" exact component={Instructions} />
            <Route path="/example" exact render={() => (<App example />)} />
        </BrowserRouter>
    )
}
