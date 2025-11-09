const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  mode: 'development',
  devServer: {
    port: 3006, // Using port 3006 for catalog-app
    historyApiFallback: true,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  output: {
    publicPath: 'auto',
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
            transpileOnly: true, // Skip type checking for faster builds
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
        './Catalog': './src/Catalog.tsx',
      },
      remotes: {
        sharedUI: 'container@http://localhost:3000/remoteEntry.js',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: "18.2.0",
          strictVersion: false,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: "18.2.0",
          strictVersion: false,
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.21.0',
        },
        '@mui/material': {
          singleton: true,
          requiredVersion: '^5.15.0',
        },
        '@mui/icons-material': {
          singleton: true,
          requiredVersion: '^5.15.0',
        },
        '@mui/x-data-grid': {
          singleton: true,
          requiredVersion: '^6.18.0',
        },
        '@emotion/react': {
          singleton: true,
          requiredVersion: '^11.11.0',
        },
        '@emotion/styled': {
          singleton: true,
          requiredVersion: '^11.11.0',
        },
        axios: {
          singleton: true,
          requiredVersion: '^1.6.0',
        },
        uuid: {
          singleton: true,
          requiredVersion: '^9.0.1',
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
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || 'http://localhost:8000'),
      'API_BASE_URL': JSON.stringify(process.env.API_BASE_URL || 'http://localhost:8000')
    }),
  ],
};
