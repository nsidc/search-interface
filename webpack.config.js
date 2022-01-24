const path = require("path");
const { merge } = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const util = require("util");
const build_path = path.resolve(__dirname, "dist");
const package_json_path = path.resolve(__dirname, 'package.json');
const webpack = require("webpack");

const devConfig = {
  plugins: [
    new webpack.EnvironmentPlugin({
      APPLICATION_ENVIRONMENT: "development",
    }),
  ],

  devtool: "cheap-module-source-map"
};

const prodConfig = {
  plugins: [
    new webpack.EnvironmentPlugin({
      APPLICATION_ENVIRONMENT: 'production'
    })
  ]
};

const config = {
  entry: "./src/index.js",

  plugins: [
    new HtmlWebpackPlugin({
      title: "NSIDC Data Search",
      inject: 'body',
      template: './public/index.html',
      filename: 'index.html'
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
      "window.$": "jquery",
    }),
    new webpack.EnvironmentPlugin({
      VERSION: JSON.stringify(require(package_json_path).version)
    }),
  ],

  output: {
    filename: "index.bundle.js",
    path: build_path,
  },

  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/inline'
      },
    ],
  },
  resolve: {
    alias: {
      // This alias exists because of a 'problem' with npm, webpack 5, and the
      // vanillajs-datepicker package. See 'A Tale of Exports and Imports' in
      // DEVELOPMENT.md for the details.
      'vjs-datepicker': path.resolve(__dirname, 'node_modules/vanillajs-datepicker/dist/css')
    }
  }
};

module.exports = (env, argv) => {
  let mergedConfig = {};

  if (argv.mode !== 'production') {
    console.log("Running in development environment...");
    mergedConfig = merge(devConfig, config);
  } else {
    mergedConfig = merge(prodConfig, config);
  }

  return mergedConfig;
};
