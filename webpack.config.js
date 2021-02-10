/* jshint esversion: 6 */

const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const util = require('util');
const build_path = path.resolve(__dirname, 'dist');
const webpack = require('webpack');

const devConfig = {
  plugins: [
    new webpack.EnvironmentPlugin({
      APPLICATION_ENVIRONMENT: 'development'
    })
  ],

  devtool: 'cheap-module-source-map',

  devServer: {
    contentBase: build_path,
  }
};

const config = {
  entry: './src/index.js',

  plugins: [
    new HtmlWebpackPlugin({
      title: 'NSIDC Data Search',
      inject: true,
      template: require('html-webpack-template'),
      appMountId: 'main-content',
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'window.$': 'jquery'
    }),
    new webpack.EnvironmentPlugin({
      APPLICATION_ENVIRONMENT: 'production'
    })
],

  output: {
    filename: 'index.bundle.js',
    path: build_path,
  },

  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader', options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader', options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      }
    ],
  },
};

module.exports = (env, argv) => {
  let mergedConfig = {};

  if (argv.mode !== 'production') {
    console.log('Running in development environment...');
    mergedConfig = merge(devConfig, config);
  }
  else {
    mergedConfig = config;
  }

  console.log('Plugins: ' + util.inspect(mergedConfig.plugins));
  return mergedConfig;
};
