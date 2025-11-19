const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

module.exports = {
  entry: './src/index.minimal.tsx',
  mode: 'development',
  devServer: {
    port: 3005, // Using port 3005 for catalog-app
    historyApiFallback: true,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: {
      '../../shared-ui-lib/src': path.resolve(__dirname, '../shared-ui-lib/src')
    },
    fallback: {
      "https": false,
      "http": false,
      "crypto": false,
      "os": false,
      "stream": false,
      "path": false,
      "fs": false,
      "net": false,
      "zlib": false,
      "tls": false
    }
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              noEmit: false,
            },
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'catalogApp',
      filename: 'remoteEntry.js',
      exposes: {
        './Catalog': './src/App.tsx',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: "18.2.0",
          strictVersion: false,
          eager: true,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: "18.2.0",
          strictVersion: false,
          eager: true,
        },
        '@mui/material': {
          singleton: true,
          requiredVersion: '^5.18.0',
          eager: true,
        },
        '@mui/icons-material': {
          singleton: true,
          requiredVersion: '^5.18.0',
          eager: true,
        },
        '@mui/x-data-grid': {
          singleton: true,
          requiredVersion: '^6.20.0',
          eager: true,
        },
        '@emotion/react': {
          singleton: true,
          requiredVersion: '^11.11.0',
          eager: true,
        },
        '@emotion/styled': {
          singleton: true,
          requiredVersion: '^11.11.0',
          eager: true,
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico',
      // Replace %PUBLIC_URL% with empty string
      templateParameters: {
        PUBLIC_URL: ''
      }
    }),
    // Define environment variables
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({
        NODE_ENV: process.env.NODE_ENV || 'development',
        REACT_APP_API_URL: 'https://localhost:44355'
      }),
      // For direct access in code
      'API_BASE_URL': JSON.stringify('https://localhost:44355')
    }),
  ],
};