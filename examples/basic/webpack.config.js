module.exports = {
    entry: './index.jsx',
    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: { cacheDirectory: true }
        }]
    },
    output: {
        filename: 'out.js'
    }
}
