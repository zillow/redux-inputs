const path = require('path');

function genExampleConfig(dir) {
    return {
        entry: path.join(dir, './index.jsx'),
        module: {
            loaders: [{
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: { cacheDirectory: true }
            }]
        },
        output: {
            filename: path.join(dir, 'out.js')
        },
        resolve: {
            alias: {
                'redux-inputs': path.join(dir, '..', '..', 'lib')
            }
        }
    };
}

module.exports = [
    genExampleConfig(path.resolve('./examples/basic/')),
    genExampleConfig(path.resolve('./examples/submit/'))
];
