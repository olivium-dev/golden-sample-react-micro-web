const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

// Standalone configuration for Data Grid - No Module Federation
module.exports = {
  mode: 'development',
  entry: './src/index.standalone.tsx',
  
  devServer: {
    port: 3102, // Use different port for standalone (e.g., 3101 instead of 3001)
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
    alias: {
      // Mock the shared-ui-lib to avoid Module Federation dependency
      '../../shared-ui-lib/src': path.resolve(__dirname, 'src/mocks/shared-ui-lib'),
    },
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
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        REACT_APP_API_URL: JSON.stringify(process.env.REACT_APP_API_URL || 'http://localhost:8000'),
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico',
    }),
  ],

  devtool: 'inline-source-map',
};
