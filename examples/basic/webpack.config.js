const path = require('path');
module.exports = {
    entry: path.join(__dirname, './index.jsx'),
    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: { cacheDirectory: true }
        }]
    },
    output: {
        filename: path.join(__dirname, 'out.js')
    },
    resolve: {
        alias: {
            'redux-inputs': path.join(__dirname, '..', '..', 'lib')
        }
    }
}
