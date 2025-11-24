const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  mode: 'development',
  devServer: {
    port: 3006, // Using port 3006 for orders-app
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
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../shared-ui-lib/node_modules'),
      'node_modules'
    ],
    fallback: {
      "process": require.resolve("process/browser"),
      "buffer": require.resolve("buffer"),
      "util": require.resolve("util"),
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "path": require.resolve("path-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "fs": false,
      "net": false,
      "tls": false,
    },
    alias: {
      'process/browser': require.resolve('process/browser'),
      'buffer': require.resolve('buffer'),
    },
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
      name: 'ordersApp',
      filename: 'remoteEntry.js',
      exposes: {
        './Orders': './src/Orders.tsx',
      },
      remotes: {
        sharedUI: 'container@http://localhost:3000/remoteEntry.js',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: "18.2.0",
          strictVersion: false,
          eager: false,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: "18.2.0",
          strictVersion: false,
          eager: false,
        },
        '@tanstack/react-query': {
          singleton: true,
          requiredVersion: '^5.0.0',
          eager: false,
        },
        '@mui/material': {
          singleton: true,
          requiredVersion: '^5.15.0',
          eager: false,
        },
        '@mui/icons-material': {
          singleton: true,
          requiredVersion: '^5.15.0',
          eager: false,
        },
        '@mui/x-data-grid': {
          singleton: true,
          requiredVersion: '^6.18.0',
          eager: false,
        },
        '@emotion/react': {
          singleton: true,
          requiredVersion: '^11.11.0',
          eager: false,
        },
        '@emotion/styled': {
          singleton: true,
          requiredVersion: '^11.11.0',
          eager: false,
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.21.0',
          eager: false,
        },
        axios: {
          singleton: true,
          requiredVersion: '^1.6.0',
          eager: false,
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico',
    }),
    // Define environment variables for browser
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || 'http://localhost:8000'),
      // Firebase environment variables
      'process.env.REACT_APP_FIREBASE_API_KEY': JSON.stringify(process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyA3Hy9lztHYQXqkViAONm9UXIWHq2OGscA"),
      'process.env.REACT_APP_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "creamati.firebaseapp.com"),
      'process.env.REACT_APP_FIREBASE_PROJECT_ID': JSON.stringify(process.env.REACT_APP_FIREBASE_PROJECT_ID || "creamati"),
      'process.env.REACT_APP_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "creamati.firebasestorage.app"),
      'process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "84649081999"),
      'process.env.REACT_APP_FIREBASE_APP_ID': JSON.stringify(process.env.REACT_APP_FIREBASE_APP_ID || "1:84649081999:android:b7f05dc7d0e702c833c4fa")
    }),
    // Provide Node.js globals for browser
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    // Additional DefinePlugin to ensure process is available globally
    new webpack.DefinePlugin({
      global: 'globalThis',
    }),
  ],
};
