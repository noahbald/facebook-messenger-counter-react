import React from 'react';
import {CSSTransition} from 'react-transition-group';
import _ from 'lodash';
import './App.css';
import {Zone, Button, DropDown, DropDownLabel, Rectangle, Next, renderFooter} from './Tools'
import {Stats} from './Stats.js'
import {MEDIA} from './Constants.js'
import {GraphZone} from './Graph.js'

class App extends React.Component {
    constructor(props) {
        super(props);
        this.dragCounter = 0;
        this.fileReader = null;
        this.initialState = {
            loaded: false,
            loading: 0,
            dragging: false,
            error: "",
            data: null,
            data_selected: null,
            message_cat: {
                calls: [],
                media: [],
                messages: [],
                nicknames: [],
                plans: [],
                reactions: [],
                shares: [],
                stickers: [],
                updates: []
            },
            message_ppl: null,
            options: {
                type: [
                    {
                        id: -1,
                        title: "All",
                        selected: true,
                        key: 'type'
                    }
                ],
                people: [
                    {
                        id: -1,
                        title: "All",
                        selected: true,
                        key: 'people'
                    }
                ],
                period: [
                    {
                        id: -1,
                        title: "Period",
                        selected: true,
                        key: 'period'
                    }
                ],
                common_types: [
                    {
                        id: -1,
                        title: "Most Common Words",
                        selected: false,
                        key: 'common_types'
                    }
                ]
            },
            selection: {
                type: {
                    id: -1,
                    title: "Type",
                    selected: true,
                    key: 'type'
                },
                people: [
                    {
                        id: -1,
                        title: "People",
                        selected: true,
                        key: 'people'
                    }
                ],
                period: {
                    id: -1,
                    title: "Period",
                    selected: true,
                    key: 'period'
                },
                common_types: {
                    id: -1,
                    title: "Common Types",
                    selected: true,
                    key: 'common_types'
                }
            },
            meta: {
                minTime: null,
                maxTime: null,
                uniqueWords: [],
                topXUniqueWords: []
            }
        }
        this.state = this.initialState;
    }

    /** ~~ Change State ~~ **/
    addPerson() {
        this.state.selection.people.push({id: -1, title: "People", selected: true, key: 'people'})
        this.setState({selection: this.state.selection})
        this.setState({data_selected: this.getDataSelection()})
    }

    removePerson() {
        this.state.selection.people.pop()
        this.setState({selection: this.state.selection})
        this.setState({data_selected: this.getDataSelection()})
    }

    changeSelection(options = {}) {
        let selection = this.state.selection
        let option = this.state.options
        // Reset selected options
        for (let key in options) {
            for (let i in option[key]) {
                option[key][i].selected = false
            }
        }
        // Set selected options
        for (let key in options) {
            selection[key] = options[key]
            if (key === "people") {
                for (let i in option[key]) {
                    for (let j in options[key]) {
                        if (option[key][i].id === options[key][j].id) {
                            option[key][i].selected = true
                        }
                    }
                }
            } else {
                for (let i in option[key]) {
                    if (option[key][i].id === options[key].id) {
                        option[key][i].selected = true

                    }
                }
            }

        }
        this.setState({selection: selection, options: option})
        this.setState({data_selected: this.getDataSelection()})
    }

    /** ~~ Handle Browse~~ **/
    handleBrowse = (e) => {
        var file = e.target.files[0];
        this.handleFile(file);
    }

    /** ~~ Handle Drag ~~ **/
    dropHandler = (e) => { // TODO Review
        // Prevent page redirect
        e.preventDefault();
        e.stopPropagation();

        // Load file and handle it
        try {
            let dt = e.dataTransfer
            let files = dt.files
            this.handleFile(files[0]);
        } catch (error) {
            this.setState(this.initialState);
            this.setState({error: error});
        }
        return false;
    }

    dragEnterHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
    }

    dragOverHandler = (e) => { // TODO Review
        // Prevent page redirect
        e.preventDefault();
        e.stopPropagation();
        // Alter page appearance
        this.dragCounter = 1;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {

            this.setState({dragging: true});
        }
    }

    dragLeaveHandler = (e) => { // TODO Review
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }
        // Revert page appearance
        this.dragCounter--;
        if (this.dragCounter <= 0) {
            this.setState({dragging: false});
        }
    }

    /** ~~ Handle Data ~~ **/
    handleFile(f) { // TODO Review
        // Read file
        this.setState(this.initialState);
        this.setState({loading: true});
        console.log("loaded file", f.name);
        this.fileReader = new FileReader();
        this.fileReader.parent = this; // Allow App method to be used by fr
        this.fileReader.onloadend = function(e) {
            this.parent.handleData(this);
        }
        this.fileReader.readAsText(f);
        this.dragLeaveHandler(null);
    }

    handleData(fr) {
        // parse JSON file to obj
        var data = JSON.parse(fr.result);
        console.log("JSON parse successful");
        this.setState({data: data})
        this.setState({message_cat: this.messageDistribution(data)});
        let cat = [
            {
                id: -1,
                title: "All",
                selected: true,
                key: 'type'
            }
        ]
        for (let i = 0; i < Object.getOwnPropertyNames(this.state.message_cat).length; i++) {
            if (this.state.message_cat[Object.getOwnPropertyNames(this.state.message_cat)[i]].length > 0) {
                cat.push({
                    id: i,
                    title: Object.getOwnPropertyNames(this.state.message_cat)[i],
                    selected: false,
                    key: 'type'
                })
            }
        }
        this.setState({message_ppl: this.separateUsers(data)});
        let ppl = [
            {
                id: -1,
                title: "All",
                selected: true,
                key: 'people'
            }
        ]
        for (let i = 0; i < Object.getOwnPropertyNames(this.state.message_ppl).length; i++) {
            ppl.push({
                id: i,
                title: Object.getOwnPropertyNames(this.state.message_ppl)[i],
                selected: false,
                key: 'people'
            })
        }
        this.setState({
            options: {
                type: cat,
                people: ppl,
                period: [
                    {
                        id: 0,
                        title: "Years",
                        selected: false,
                        key: 'period'
                    }, {
                        id: 1,
                        title: "Months",
                        selected: true,
                        key: 'period'
                    }, {
                        id: 2,
                        title: "Weekdays",
                        selected: false,
                        key: 'period'
                    }, {
                        id: 3,
                        title: "Hours",
                        selected: false,
                        key: 'period'
                    }
                ],
                common_types: [
                    {
                        id: 0,
                        title: "Words",
                        selected: true,
                        key: 'common_types'
                    }, {
                        id: 1,
                        title: "Reactions",
                        selected: false,
                        key: 'common_types'
                    }, {
                        id: 2,
                        title: "Media",
                        selected: false,
                        key: 'common_types'
                    }
                ]
            }
        });
        this.setState({data_selected: this.getDataSelection()});
        let meta = this.state.meta
        let value = Stats.topXUniqueWords(this.state.message_cat.messages, 16, true)
        meta.topXUniqueWords = value[0]
        meta.uniqueWords = value[1]
        this.setState({loaded: true, meta: meta})
        console.log("loaded")
    }

    messageDistribution(data) {
        var categories = {
            messages: [],
            media: [],
            stickers: [],
            nicknames: [],
            updates: [],
            reactions: [],
            calls: [],
            plans: [],
            shares: []
        };

        let maxTime = 0;
        let minTime = Infinity;
        // Go through each message and place it in its respective category
        for (let i = 0; i < data.messages.length; i++) {
            let message = data.messages[i];
            let flag = false;
            let time = data.messages[i].timestamp_ms || data.messages[i].timestamp*1000
            if (time < minTime) {
                minTime = time
            } if (time > maxTime) {
                maxTime = time
            }

            // If the message has a reaction, categorise it as so
            if ('reactions' in message) {
                categories.reactions.push(message);
            }

            // If the message is media, categorise it as so and move on
            for (let mediaType in MEDIA) {
                if (MEDIA[mediaType] in message) {
                    categories.media.push(message);
                    flag = true;
                    break;
                }
            }
            if (flag) {
                continue;
            }
            // If the message is a chenge in group data categorise it as so
            if ('content' in message) {
                let content = message.content;
                // TODO: Vulnerable to miscategorisation
                if (content.includes(" set the nickname for ") || content.includes(" set your nickname to ")) {
                    // If the message was a nickname change, categorise it as so
                    categories.nicknames.push(message);
                    continue;
                } else if (content.includes(" changed the group photo.") || content.includes(" removed the group photo.") || content.includes(" removed the group name.") || content.includes(" named the group ")) {
                    // If the message was an update, categorise it as so
                    categories.updates.push(message);
                    continue;
                }
            }
            if ('sticker' in message) {
                // If the message was a sticker, categorise it as so
                categories.stickers.push(message);
                continue;
            } else if (message.type === 'Generic' && 'content' in message) {
                // If the message was a text message, categorise it as so
                categories.messages.push(message);
            } else if (message.type === "Call") {
                // If the message was a call, categorise it as so
                categories.calls.push(message);
            } else if (message.type === "Plan") {
                // If the message was a plan, categorise it as so
                categories.plans.push(message);
            } else if (message.type === "Share") {
                // If the message was a shared linke, categorise it as so
                categories.shares.push(message);
            }
        }

        let meta = this.state.meta
        meta.maxTime = maxTime
        meta.minTime = minTime
        this.setState({meta: meta})

        return categories;
    }

    separateUsers(data) {
        // Separate the messages in the conversation to a dictionary of the people who sent them
        var users = {};

        for (var user in data.participants) {
            users[data.participants[user].name] = [];
        }
        for (var i in data.messages) {
            var message = data.messages[i];
            if (!(message.sender_name in users)) {
                users[message.sender_name] = null;
            }
        }
        return users;
    }

    getDataSelection() {
        let typeData
        if (this.state.selection.type.id < 0) {
            typeData = this.state.data.messages
        }
        else {
            typeData = this.state.message_cat[this.state.selection.type.title]
        }
        var output = [];
        for (let i = 0; i < this.state.selection.people.length; i++) {
            let person = this.state.selection.people[i]
            if (person.id < 0) {
                // person is a default value, ie. "All" or "People"
                output.push({
                    id: i,
                    title: typeData,
                    key: person.id
                })
                continue;
            }
            let dataSelection = typeData.filter((message) => message.sender_name === person.title);
            output.push({
                id: i,
                title: dataSelection,
                key: person.id
            })
        }
        return output;
    }

    /** ~~ Rendering Components ~~ **/
    renderFileSelect() {
        return (<CSSTransition in={!this.state.loaded} timeout={200} classNames="fade" unmountOnExit appear>
            <section id="file_select" style={{
                    "zIndex" : 3
                }}>
                <Zone onDragEnter={(e) => this.dragEnterHandler(e)} onDragOver={(e) => this.dragOverHandler(e)} onDragLeave={(e) => this.dragLeaveHandler(e)} onDrop={(e) => this.dropHandler(e)}>
                    <DropZone highlight={this.state.dragging} loading={this.state.loading} error={this.state.error} onChange={(e) => this.handleBrowse(e)}></DropZone>
                </Zone>
            </section>
        </CSSTransition>)
    }

    renderHeader() {
        // Display options for Message type and at most 3 People
        // Allow adding and removing people from selection
        return (<CSSTransition in={this.state.loaded} timeout={400} classNames="fade" unmountOnExit appear>
            <header>
                <div style={{
                        position: "absolute"
                    }}>
                    <DropDownLabel first="first">
                        <p>Total</p>
                    </DropDownLabel>
                    <DropDown options={this.state.options.type} onClick={(type) => this.changeSelection({type: type})}>
                        <p>{_.startCase(this.state.selection.type.title)}</p>
                    </DropDown>
                    <DropDownLabel>
                        <p>From</p>
                    </DropDownLabel>
                    {
                        this.state.selection.people.map((item, i) => (<CSSTransition key={i} in={i < 3 && i < this.state.options.people.length} timeout={200} classNames="fade" unmountOnExit appear>
                            <React.Fragment>
                                <CSSTransition in={i > 0 && i === this.state.selection.people.length - 1} timeout={0} classNames="fade" unmountOnExit appear>
                                    <DropDownLabel style={{
                                            marginLeft: 0
                                        }}>
                                        <Button text="text" onClick={(e) => this.removePerson()} style={{
                                                minWidth: "36px",
                                                padding: 0
                                            }}>
                                            <p><strong>{"-"}</strong></p>
                                        </Button>
                                    </DropDownLabel>
                                </CSSTransition>
                                <CSSTransition in={i < 3 && i < this.state.options.people.length} timeout={200} classNames="fade" unmountOnExit appear>
                                    <DropDown buttonClass={"child-" + i} options={this.state.options.people} onClick={(person) => {
                                            let update = this.state.selection.people;
                                            update[i] = person;
                                            this.changeSelection({people: update})
                                        }}>
                                        <p>{_.startCase(this.state.selection.people[i].title)}</p>
                                    </DropDown>
                                </CSSTransition>
                                <CSSTransition in={i !== this.state.selection.people.length - 1 && i < 2} timeout={0} classNames="scale" unmountOnExit appear>
                                    <DropDownLabel>
                                        <p>and</p>
                                    </DropDownLabel>
                                </CSSTransition>
                                <CSSTransition in={i < 2 && i === this.state.selection.people.length - 1} timeout={0} classNames="fade" unmountOnExit appear>
                                    <DropDownLabel>
                                        <Button text="text" onClick={(e) => this.addPerson()} style={{
                                                minWidth: "36px",
                                                padding: 0
                                            }}>
                                            <p><strong>{"+"}</strong></p>
                                        </Button>
                                    </DropDownLabel>
                                </CSSTransition>
                            </React.Fragment>
                        </CSSTransition>))
                    }
                </div>
            </header>
        </CSSTransition>)
    }

    renderLineGraph() {
        let xAxis = []
        var mapping
        // Create x-axis and create function to map data to a plot
        if (this.state.selection.period.id === 0) {
            xAxis = _.range(new Date(this.state.meta.minTime).getFullYear(), new Date(this.state.meta.maxTime).getFullYear()+1)
            for (let i in xAxis) {
                xAxis[i] = {
                    id: i,
                    x: xAxis[i]
                }
            }
            mapping = (xaxis, data) => {
                let yPlot = Array(xaxis.length).fill(0)
                for (let i in data) {
                    let year = new Date(data[i].timestamp_ms || data[i].timestamp*1000).getFullYear()
                    let j
                    for (j in xAxis) {
                        if (year === xAxis[j].x) {
                            break
                        }
                        j = -1
                    }
                    yPlot[j] += 1
                }
                return yPlot
            }
        } else if (this.state.selection.period.id === 1 || this.state.selection.period.id < 0) {
            xAxis = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]
            for (let i in xAxis) {
                xAxis[i] = {
                    id: i+33,
                    x: xAxis[i]
                }
            }
            mapping = (xaxis, data) => {
                let yPlot = Array(xaxis.length).fill(0)
                for (let i in data) {
                    let month = new Date(data[i].timestamp_ms || data[i].timestamp*1000).getMonth()
                    yPlot[month] += 1
                }
                return yPlot
            }
        } else if (this.state.selection.period.id === 2) {
            xAxis = ["M", "T", "W", "T", "F", "S", "S"]
            for (let i in xAxis) {
                xAxis[i] = {
                    id: i+12,
                    x: xAxis[i]
                }
            }
            mapping = (xaxis, data) => {
                let yPlot = Array(xaxis.length).fill(0)
                for (let i in data) {
                    let day = (new Date(data[i].timestamp_ms || data[i].timestamp*1000).getDay() + 6) % 7
                    yPlot[day] += 1
                }
                return yPlot
            }
        } else if (this.state.selection.period.id === 3) {
            xAxis = _.range(0, 24)
            for (let i in xAxis) {
                xAxis[i] = {
                    id: i+19,
                    x: xAxis[i]
                }
            }
            mapping = (xaxis, data) => {
                let yPlot = Array(xaxis.length).fill(0)
                for (let i in data) {
                    let hour = new Date(data[i].timestamp_ms || data[i].timestamp*1000).getHours()
                    yPlot[hour] += 1
                }
                return yPlot
            }
        }

        return (
            <CSSTransition in={this.state.loaded} timeout={400} classNames="fade" unmountOnExit appear>
                <section id="line_graph">
                    <Zone>
                        <GraphZone line ready={this.state.loaded} outline selectedData={this.state.data_selected} onClick={(period) => this.changeSelection({period: period})} options={this.state.options.period} xAxis={xAxis} mapping={(xaxis, data) => mapping(xaxis, data)}><p>{_.startCase(this.state.selection.period.title)}</p></GraphZone>
                    </Zone>
                </section>
            </CSSTransition>
        )
    }

    renderStats() {
        return (
            <CSSTransition in={this.state.loaded} timeout={400} classNames="fade" unmountOnExit appear>
                <section id="statistics">
                    <div className="col_container">
                        <div className="left outer">
                            <div className="left inner">
                                <h1>Statistics</h1>
                                <p>Total Messages:</p>
                                <p>Unique Words:</p>
                                <p>Calls:</p>
                                <p>Total Call Duration:</p>
                                <p>Shares:</p>
                                <p>Reacts:</p>
                                <p>&emsp;&lt;3</p>
                                <p>&emsp;:D</p>
                                <p>&emsp;:O</p>
                                <p>&emsp;:&#39;(</p>
                                <p>&emsp;>:(</p>
                                <p>&emsp;good</p>
                                <p>&emsp;bad</p>
                            </div>
                            <div className="right inner">
                                <h1>&nbsp;</h1>
                                <p>{this.state.message_cat.messages.length}</p>
                                <p>{this.state.meta.uniqueWords.length}</p>
                                <p>{this.state.message_cat.calls.length}</p>
                                <p>{Stats.callDuration(this.state.message_cat.calls).toISOString().substr(11, 8)}</p>
                                <p>{this.state.message_cat.shares.length}</p>
                                <p>{this.state.message_cat.reactions.length}</p>
                                {Object.entries(Stats.splitReacts(this.state.message_cat.reactions)).map(([value, key], i) => (
                                    <React.Fragment key={value}>
                                        <p>{key.length}</p>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                        <div className="right outer">
                            <div className="left inner">
                                <h1>&nbsp;</h1>
                                <p>Media Sent:</p>
                                <p>&emsp;Photos:</p>
                                <p>&emsp;Videos:</p>
                                <p>&emsp;Gifs:</p>
                                <p>&emsp;Files:</p>
                                <p>&emsp;Audio Files:</p>
                            </div>
                            <div className="right inner">
                                <h1>&nbsp;</h1>
                                <p>{this.state.message_cat.media.length}</p>
                                {this.state.loaded ? Object.entries(Stats.splitMedia(this.state.message_cat.media)).map(([value, key], i) => (
                                    <React.Fragment key={value}>
                                        <p>{key.length}</p>
                                    </React.Fragment>
                                )) : null}
                            </div>
                        </div>
                    </div>
                </section>
            </CSSTransition>
        )
    }

    renderBarGraph() {
        // Don't continue unless loaded
        if (!this.state.loaded) {
            return
        }
        // Initialise props to pass
        let selectedData = [{
            id: -1,
            key: -1,
            title: this.state.data.messages
        }]
        let xAxis = []
        let mapping
        if (this.state.selection.common_types.id <= 0) {
            let topWords = this.state.meta.topXUniqueWords
            for (let i in topWords) {
                xAxis.push({
                    id: i,
                    x: topWords[i].word
                })
            }
            mapping = (xaxis, data) => {
                let yPlot = []
                let topWords = this.state.meta.topXUniqueWords
                for (let i in topWords) {
                    yPlot.push(topWords[i].count)
                }
                return yPlot
            }
        } else if (this.state.selection.common_types.id === 1) {
            let topReacts = Stats.splitReacts(selectedData[0].title)
            let keys = Object.keys(topReacts)
            keys.sort(function(a, b) {
                return topReacts[b].length - topReacts[a].length
            })
            for (let i in keys) {
                xAxis.push({
                    id: i,
                    x: keys[i]
                })
            }
            mapping = (xaxis, data) => {
                let yPlot = []
                for (let i in xAxis) {
                    yPlot.push(topReacts[xAxis[i].x].length)
                }
                return yPlot
            }
        } else if (this.state.selection.common_types.id === 2) {
            // TODO: this code smells like the previous if
            let topMedia = Stats.splitMedia(this.state.message_cat.media)
            let keys = Object.keys(topMedia)
            keys.sort(function(a, b) {
                return topMedia[b].length - topMedia[a].length
            })
            for (let i in keys) {
                xAxis.push({
                    id: i,
                    x: keys[i]
                })
            }
            mapping = (xaxis, data) => {
                let yPlot = []
                for (let i in xAxis) {
                    yPlot.push(topMedia[xAxis[i].x].length)
                }
                return yPlot
            }
        }

        return (
            <CSSTransition in={this.state.loaded} timeout={400} classNames="fade" unmountOnExit appear>
                <section id="bar_graph">
                    <Zone>
                        <GraphZone bar ready={this.state.loaded} outline selectedData={selectedData} onClick={(common_types) => this.changeSelection({common_types: common_types})} options={this.state.options.common_types} xAxis={xAxis} mapping={(xaxis, data) => mapping(xaxis, data)}><p>{_.startCase(this.state.selection.common_types.title)}</p></GraphZone>
                    </Zone>
                </section>
            </CSSTransition>
        )
    }

    render() {
        return (<React.Fragment>
            {this.renderFileSelect()}
            {this.renderHeader()}
            {this.renderLineGraph()}
            {
                <CSSTransition in={this.state.loaded} timeout={400} classNames="fade" unmountOnExit appear>
                    <div style={{width: 100+"%", display: "flex", justifyContent: "center"}}>
                        <Next href="#statistics"></Next>
                    </div>
                </CSSTransition>
            }
            {this.renderStats()}
            {
                <CSSTransition in={this.state.loaded} timeout={400} classNames="fade" unmountOnExit appear>
                    <div style={{width: 100+"%", display: "flex", justifyContent: "center"}}>
                        <Next href="#bar_graph"></Next>
                    </div>
                </CSSTransition>
            }
            {this.renderBarGraph()}
            {renderFooter()}
            <main>{this.props.children}</main>
        </React.Fragment>);
    }
}

class DropZone extends React.Component {
    constructor(props) {
        /**
         * Props:
         * error: (e) => f(x) - optional
         **/
        super(props);
        this.state = {

        }
    }

    renderWarning(message) {
        return (<div>
            <p>
                <strong>{"Warning: "}
                </strong>
                {message}
            </p>
        </div>);
    }

    renderError() {
        if (this.props.error && this.props.error.length > 0) {
            return (<p id="file_error" className="error">
                {
                    this.props.error
                        ? this.props.error
                        : ""
                }
            </p>);
        };
    }

    renderProgress(show = true) {
        var hidden = {
            opacity: 0
        };
        if (this.props.loading) {
            hidden = null;
        }
        return (<p style={hidden} className="loading"></p>)
    }

    render() {
        let highlight = this.props.highlight
            ? "highlight"
            : "";
        return (<React.Fragment>
            <Rectangle className={highlight}>
                <form id="upload">
                    {this.props.loading ? (<p>&nbsp;</p>) : null}
                    {this.renderError()}
                    {(document.body.clientWidth < 620) ? this.renderWarning("Site is not optimised for mobile. Please request desktop site.") : null}
                    <p>
                        <strong>Drop File Here</strong>
                    </p>
                    <input className={"upload"} type="file" onChange={(e) => this.props.onChange(e)} id="fileElem" accept=".JSON" style={{
                            display: "none"
                        }}></input>
                    <label htmlFor="fileElem">
                        <Button text="text">
                            <p>Or Browse</p>
                        </Button>
                    </label>
                    {this.props.loading ? (<p>Loading...</p>) : null}
                </form>
            </Rectangle>
        </React.Fragment>);
    }
}

export default App;
