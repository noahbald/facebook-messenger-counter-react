import React from 'react'
import {Zone, Next, renderFooter} from './Tools.js'
import './App.css'

class Instructions extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            videos: ["r2lXBBe4eg8", "rDpv3UdFCC0", "XxDxGNTv0aY"],
            page: 0
        }
    }
    render() {
        return (
            <React.Fragment>
                <section id="instructions">
                    {this.state.page > 0 ? (<Next style={{transform: "rotate(90deg)"}} onClick={() => this.setState({page: this.state.page-1})}/>) : null}
                    <Zone>
                        <iframe title="instructions" width="560" height="315" src={"https://www.youtube-nocookie.com/embed/" + this.state.videos[this.state.page] + "?controls=0"} frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                    </Zone>
                    {this.state.page < this.state.videos.length-1 ? (<Next style={{right: "64px", transform: "rotate(-90deg)"}} onClick={() => this.setState({page: this.state.page+1})}/>) : null}
                    <main>{this.props.children}</main>
                </section>
                {renderFooter()}
            </React.Fragment>
        )
    }
}

export default Instructions
