const path = require('path');
const webpack = require('webpack');

module.exports = {

    entry: {
        index: './src/index.ts'
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: 'CompilationInfoWebpackPlugin',
        libraryTarget: 'umd',
        globalObject: `(typeof self !== 'undefined' ? self : this)`
    },

    resolve: {
        extensions: ['.ts', '.js']
    },
    
    devtool: 'source-map',

    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: 'ts-loader'
            }
        ]
    },

    externals: {
        "webpack": "webpack",
        "handlebars": "handlebars"
    }
};