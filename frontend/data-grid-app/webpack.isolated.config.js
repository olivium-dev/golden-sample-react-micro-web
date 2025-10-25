const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

// Fully isolated configuration for Data Grid - No shared-ui-lib imports
module.exports = {
  mode: 'development',
  entry: './src/index.isolated.tsx',
  
  devServer: {
    port: 3102,
    hot: true,
    open: false,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: {
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          configFile: 'tsconfig.json'
        }
      },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
        REACT_APP_API_URL: JSON.stringify('http://localhost:8000'),
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico',
    }),
  ],

  devtool: 'inline-source-map',
};
