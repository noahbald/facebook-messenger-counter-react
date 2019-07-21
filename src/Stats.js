import _ from 'lodash'
import {REACTS, MEDIA} from './Constants.js'

var Stats = {
    uniqueWords: function(messages) {
        let words = _uniqueWordsAux(messages)
        return Object.keys(words)
    },
    totalWords: function(messages) {
        let count = 0
        for (let i in messages) {
            count += _.words(messages[i].content).length
        }
        return count
    },
    topXUniqueWords: function(messages, x) {
        // []
        let words = _uniqueWordsAux(messages)
        let keys = Object.keys(words)
        keys.sort(function(a, b) {
            return words[b] - words[a]
        })
        keys = keys.slice(0, x)
        let output = []
        for (let i in keys) {
            output.push({
                word: keys[i],
                count: words[keys[i]]
            })
        }
        return output
    },
    callDuration: function(calls) {
        let duration = 0
        for (let i in calls) {
            duration += calls[i].call_duration
        }
        let date = new Date(duration*1000)
        return date
    },
    splitReacts: function(reactions) {
        var reacts = {
            love: [],
            laugh: [],
            wow: [],
            sad: [],
            angry: [],
            like: [],
            dislike: []
        }
        for (let i in reactions) {
            let message = reactions[i]
            for (let j in message.reactions) {
                let react = REACTS[message.reactions[j].reaction]
                reacts[react].push(message)
            }
        }
        return reacts
    },
    splitMedia: function(media) {
        var _media = {
            photos: [],
            videos: [],
            gifs: [],
            files: [],
            audio_files: []
        }
        for (let i in media) {
            let message = media[i]
            for (let j in _media) {
                if (message[j]) {
                    _media[j].push(message)
                }
            }
        }
        return _media
    }
}

function _uniqueWordsAux(messages) {
    let words = {}
    for (let i in messages) {
        let message = messages[i]
        let wordList = _.words(message.content)
        for (let j in wordList) {
            let word = wordList[j].toLowerCase()
            if (!words[word]) {
                words[word] = 0
            }
            words[word] += 1
        }
    }
    return words
}

export {Stats}
