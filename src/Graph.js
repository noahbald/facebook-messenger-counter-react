import React from 'react'
import $ from 'jquery'
import _ from 'lodash'
import {create_axis, Rectangle, DropDown, isChrome} from './Tools.js'

class GraphZone extends React.Component {
    constructor(props) {
        /**
         * Props:
         * yAxis: list
         * xAxis: list
         * points: [{x, y}, ...]
         */
        super(props)
        let min = Infinity
        let max = 0
        let yAxis
        let plots = []
        for (let i in this.props.selectedData) {
            let plot = this.props.mapping(this.props.xAxis, this.props.selectedData[i].title)
            plots.push(plot)
            if (max < Math.max.apply(null, plot)) {
                max = Math.max.apply(null, plot)
            }
            if (min > Math.min.apply(null, plot)) {
                min = Math.min.apply(null, plot)
            }
        }
        if (!this.props.yAxis) {
            yAxis = create_axis(min, max)
        } else {
            yAxis = this.props.yAxis
        }

        this.svg = React.createRef()

        this.state = {
            loaded: false,
            min: Math.min.apply(null, yAxis),
            max: Math.max.apply(null, yAxis),
            xAxis: this.props.xAxis,
            yAxis: yAxis,
            plots: plots
        }
    }

    resize = () => function() {this.forceUpdate()}

    componentDidMount() {
        this.setState({loaded: true})
        $(window).on('resize', () => this.forceUpdate())
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize)
    }

    renderXAxis(xAxis = this.state.xAxis) {
        return (
            this.props.xAxis.map((item, i) => (
                <li key={i}>{item.x}</li>
            ))
        )
    }

    renderYAxis(yAxis = this.state.yAxis) {
        return (
            yAxis.map((item, i) => (
                <li key={i}>{item}</li>
            ))
        )
    }

    renderLineGraph() {
        /*{transform: "translate(" + (100*i/this.state.xAxis.length) + "%, " + (100*this.state.yAxis[i]/this.state.max) + "%)"}*/
        let colours = ["#e17381", "#c471ed", "#0073de"]
        let min = Infinity
        let max = 0
        let yAxis
        let plots = []
        for (let i in this.props.selectedData) {
            let plot = this.props.mapping(this.props.xAxis, this.props.selectedData[i].title)
            plots.push(plot)
            if (max < Math.max.apply(null, plot)) {
                max = Math.max.apply(null, plot)
            }
            if (min > Math.min.apply(null, plot)) {
                min = Math.min.apply(null, plot)
            }
        }
        if (!this.props.yAxis) {
            yAxis = create_axis(min, max)
        } else {
            yAxis = this.props.yAxis
        }
        min = Math.min.apply(null, yAxis)
        max = Math.max.apply(null, yAxis)

        // We must set translateX as a precise pixel rather than percent due to rendering issues in chrome
        let svgWidth = document.body.clientWidth - 224
        let svgHeight = Math.min(Math.max((window.innerWidth/3)-96, (window.innerHeight-387 - (2/3))), svgWidth+17)

        //svg specifications
        let cr = 5 // circle radius
        let rh = 2.5 // rect height
        let padding = cr+16 // must match padding of .xaxis and .yaxis

        return (
            <React.Fragment>
                <ul className="yaxis">
                    {this.renderYAxis(yAxis)}
                </ul>
                <Rectangle>
                    <DropDown outline={this.props.outline} text={this.props.text} options={this.props.options} onClick={(option) => this.props.onClick(option)}>{this.props.children}</DropDown>
                    <svg ref={this.svg} id="line" style={{width: "100%", height: "100%"}}>
                        {this.state.loaded ? (plots.map((plot, j) => (
                            <React.Fragment key={j}>
                                {this.props.xAxis.map((x, i) => (
                                    <React.Fragment key={i}>
                                        <circle r={cr} fill={colours[j]} style={{transform: "translateX(" + ((padding)+(((svgWidth-(2*padding))*i)/(this.props.xAxis.length-1))) + "px) translateY(" + (svgHeight-padding-(svgHeight-2*padding)*plot[i]/(max)) + "px)"}}></circle>
                                        {
                                            i < this.props.xAxis.length-1 ? (
                                                <rect fill={colours[j]}
                                                    width={Math.sqrt(Math.pow(((padding)+(((svgWidth-(2*padding))*i)/(this.props.xAxis.length-1)))-((padding)+(((svgWidth-(2*padding))*(i+1))/(this.props.xAxis.length-1))), 2) + Math.pow(((svgHeight-padding-(svgHeight-2*padding)*plot[i]/(max))-(rh/2))-((svgHeight-padding-(svgHeight-2*padding)*plot[i+1]/(max))-(rh/2)), 2))}
                                                    height={rh}
                                                    style={{
                                                    transform: "translateX(" + ((padding)+(((svgWidth-(2*padding))*i)/(this.props.xAxis.length-1))) + "px) translateY(" + (svgHeight-padding-(svgHeight-2*padding)*plot[i]/(max)-(rh/2)) + "px) rotate(" + -1*Math.atan(((svgHeight-padding-(svgHeight-2*padding)*plot[i]/(max)-(rh/2))-(svgHeight-padding-(svgHeight-2*padding)*plot[i+1]/(max)-(rh/2)))/(((padding)+(((svgWidth-(2*padding))*(i+1))/(this.props.xAxis.length-1)))-((padding)+(((svgWidth-(2*padding))*i)/(this.props.xAxis.length-1))))) * (180/Math.PI) + "deg)",
                                                    }}>
                                                </rect>
                                            ) : null
                                        }
                                    </React.Fragment>
                                ))}
                            </React.Fragment>
                        ))) : null}
                    </svg>
                </Rectangle>
                <ul className="xaxis">
                    {this.renderXAxis()}
                </ul>
            </React.Fragment>
        )
    }

    renderBarGraph() {
        let plot = this.props.mapping(null, null)
        let max = _.max(plot)

        return (
            <React.Fragment>
                <Rectangle>
                    <DropDown outline={this.props.outline} text={this.props.text} options={this.props.options} onClick={(option) => this.props.onClick(option)}>{this.props.children}</DropDown>
                    <svg>
                        {this.state.loaded ? plot.map((x, i) => (
                            <React.Fragment key={i}>
                                <rect fill="#e17381" height={100*x/max+"%"} width={!isChrome() ? (100/plot.length) - 1 + "%" : null} style={{width: "calc(" + 100/plot.length + "% - 8px)", transform: "translateX(" + (i*100/plot.length) + "%) translateY(" + (100-100*x/max) + "%)"}}></rect>
                                <text fill="#010101" style={{transform: "translateY(96px) translateX(calc(" + (i*100/plot.length + 50/plot.length) + "%)) rotate(-90deg)"}}>{x}</text>
                                <text fill="#010101" style={{transform: "translateY(calc(100% - 32px)) translateX(calc(" + (i*100/plot.length + 50/plot.length) + "%)) rotate(-90deg)"}}>{_.startCase(this.props.xAxis[i].x)}</text>
                            </React.Fragment>
                        )) : null}
                    </svg>
                </Rectangle>
            </React.Fragment>
        )
    }

    render() {
        return (
            <React.Fragment>
                {this.props.line ? this.renderLineGraph() : null}
                {this.props.bar && !this.props.line ? this.renderBarGraph(): null}
            </React.Fragment>
        )
    }
}

export {GraphZone}
