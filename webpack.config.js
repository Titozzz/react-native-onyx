/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const {merge} = require('webpack-merge');
const _ = require('underscore');
const pkg = require('./package.json');

const commonConfig = {
    mode: 'production',
    devtool: 'source-map',
    entry: './lib/index.ts',
    resolve: {
        extensions: ['.jsx', '.js', '.ts', '.tsx'],
    },
    module: {
        rules: [
            {
                test: /\.(j|t)sx?$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'ts-loader',

                    // options: {
                    //     generatorOpts: {
                    //         // We instruct babel to keep generated code as close to original source as possible
                    //         // Production builds would strip comments and minify code regardless the config here
                    //         // but development builds would retain jsdocs and method lines
                    //         compact: false,
                    //         retainLines: true,
                    //         comments: true,
                    //     },
                    // },
                },
            },
        ],
    },
    externals: [
        'react-native',
        /^expensify-common\/.+$/,
        /^lodash\/.+$/,
        ..._.keys(pkg.peerDependencies),
        ..._.keys(pkg.dependencies),
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        library: {
            name: 'react-native-onyx',
            type: 'umd',
        },
    },
};

const webConfig = merge(commonConfig, {
    output: {
        filename: 'web.min.js',
        library: {
            name: 'react-native-onyx/web',
        },
    },
    resolve: {
        // Resolve any web specific JS file as a normal JS file
        extensions: ['.web.js', '.web.ts', '.web.tsx'],
    },
});

// Web projects using Onyx would resolve this configuration during development (webpack-dev-server)
// If we want to experiment with Onyx locally we can edit the `.development` script since it's not minified
const webDevConfig = merge(webConfig, {
    mode: 'development',
    output: {
        filename: 'web.development.js',
    },
});

module.exports = [
    webConfig,
    webDevConfig,
];
