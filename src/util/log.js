export default {
    warn: (message) => typeof console !== 'undefined'
        && console.warn
        && console.warn('[redux-inputs]: ' + message),
    error: (message) => typeof console !== 'undefined'
        && console
        && console.error
        && console.error('[redux-inputs]: ' + message)
}

