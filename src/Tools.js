import React from 'react';
import _ from 'lodash';
import './main.css'

import { ReactComponent as NextSVG } from './next.svg'

function Zone(props) {
    /**
     * Props:
     * onDragEnter: (e) => f(x) - optional
     * onDragOver: (e) => f(x)  - optional
     * onDragLeave: (e) => f(x) - optional
     * onDrop: (e) => f(x)      - optional
     **/
    return (<div onDragEnter={(e) => props.onDragEnter} onDragOver={(e) => props.onDragOver(e)} onDragLeave={(e) => props.onDragLeave(e)} onDrop={(e) => props.onDrop(e)} className={props.className
            ? props.className + " zone"
            : "zone"} id={props.id}>{props.children}</div>);
}

function Rectangle(props) {
    /**
     * Props:
     * children     - optional
     * className    - optional
     * id           - optional
     **/
    return (<div className={"rectangle " + props.className} id={props.id}>{props.children}</div>);
}

function Button(props) {
    let type = " "
    if (props.text) {
        type = " text "
    } else if (props.outline) {
        type = " outline "
    }
    if (props.className) {
        type += props.className
    }
    return (<div className={"button" + type} onClick={props.onClick} id={props.id} style={props.style}>
        {
            props.children
                ? props.children
                : (<p></p>)
        }
    </div>)
}

class DropDown extends React.Component {
    constructor(props) {
        /**
         * Props:
         * onClick: (e) => f(x) - required
         * options: list[dict] - required
         * style: dict - optional
         * id       - optional
         * children - optional
         **/
        super(props);
        this.node = null;
        this.state = {
            open: false

        }
    }

    componentWillMount() {
        document.addEventListener('mousedown', this.disable);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.disable);
    }

    disable = (e) => {
        if (e) {
            var path = e.path || (e.composedPath && e.composedPath())
        }
        if (path) {
            // chrome check
            if (path.includes(this.node)) {
                return
            }
        }
        if (e) {
            // find in loop, if more efficient methods fail (Edge, IE, etc)
            let currentNode = e.target
            while (currentNode !== document) {
                if (currentNode === this.node) {
                    return
                } else {
                    currentNode = currentNode.parentNode
                }
            }
        }
        this.setState({open: false})
    }

    enable() {
        this.setState({open: true})
    }

    toggle() {
        this.setState({
            open: !this.state.open
        })
    }

    makeSelection(selection) {
        if (this.state.open) {
            this.props.onClick(selection)
        }
    }

    render() {
        return (<div ref={node => this.node = node} className="dropdown_container" style={this.props.style} id={this.props.id}>
            <Button className={this.props.buttonClass ? this.props.buttonClass : ""} id={"button-" + this.props.id} text={this.props.text} outline={this.props.outline} onClick={(e) => this.toggle()}>
                {this.props.children}
            </Button>
            <div className={"dropdown " + (
                    !this.state.open
                    ? "hidden"
                    : "")}>{
                    this.props.options.map(item => (<DropDownOption key={item.id} hidden={!this.state.open} onClick={(e) => {
                            if (this.state.open) {
                                this.props.onClick(item);
                            }
                            this.disable()
                        }}>
                        <p>{_.startCase(item.title)}</p>
                    </DropDownOption>))
                }</div>
        </div>)
    }
}
function DropDownOption(props) {
    return (<div className={"dropdown_option" + (props.hidden ? " hidden" : "")} onClick={(e) => props.onClick()}>{props.children}</div>)
}
function DropDownLabel(props) {
    /**
     * Props:
     * children - optional
     * style    - optional
     **/
    let style = {
        marginRight: "8px",
        marginLeft: (
            props.first
            ? "0px"
            : "8px")
    }
    if (props.style) {
        Object.assign(style, props.style)
    }
    return (<div className="dropdown_label" style={style}>
        {props.children}
    </div>)
}

function Next(props) {
    return (
        <a href={props.href}>
            <NextSVG props={props} className="next" width="64" height="64"></NextSVG>
        </a>
    )
}

function isChrome() {
    var isChromium = window.chrome;
    var winNav = window.navigator;
    var vendorName = winNav.vendor;
    var isOpera = typeof window.opr !== "undefined";
    var isIEedge = winNav.userAgent.indexOf("Edge") > -1;
    var isIOSChrome = winNav.userAgent.match("CriOS");

    if (isIOSChrome) {
        return -1;
    } else if (isChromium !== null && typeof isChromium !== "undefined" && vendorName === "Google Inc." && isOpera === false && isIEedge === false) {
        return true;
    } else {
        return false;
    }
}

function create_axis(min, max, maxTicks = 6) {
    function niceNum(range) {
        let fraction = range/Math.pow(10, Math.floor(Math.log10(range)))

        if (fraction <= 1) {
            fraction = 1
        } else if (fraction <= 2) {
            fraction = 2
        } else if (fraction <= 5) {
            fraction = 5
        } else {
            fraction = 10
        }

        return fraction * Math.pow(10, Math.floor(Math.log10(range)))
    }
    let range = niceNum(max - min)
    let tickSpacing = niceNum(Math.ceil(range/(maxTicks - 1)))
    min = Math.floor(min/tickSpacing) * tickSpacing
    max = Math.ceil(1+max/tickSpacing) * tickSpacing

    return _.range(min, max, tickSpacing).reverse()
}

export {Zone, Button, DropDown, DropDownLabel, Rectangle, Next, isChrome, create_axis};
