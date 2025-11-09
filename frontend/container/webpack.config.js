const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  mode: 'development',
  devServer: {
    port: 3000,
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
      name: 'container',
      filename: 'remoteEntry.js',
      exposes: {
        './sharedUI': '../shared-ui-lib/src/index.ts',
      },
      remotes: {
        userApp: 'userApp@http://localhost:3001/remoteEntry.js',
        dataApp: 'dataApp@http://localhost:3002/remoteEntry.js',
        analyticsApp: 'analyticsApp@http://localhost:3003/remoteEntry.js',
        settingsApp: 'settingsApp@http://localhost:3004/remoteEntry.js',
        ordersApp: 'ordersApp@http://localhost:3005/remoteEntry.js',
        catalogApp: 'catalogApp@http://localhost:3006/remoteEntry.js',
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
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.21.0',
        },
        '@mui/material': {
          singleton: true,
          requiredVersion: '^5.15.0',
          eager: true,
        },
        '@mui/icons-material': {
          singleton: true,
          requiredVersion: '^5.15.0',
          eager: true,
        },
        '@mui/x-data-grid': {
          singleton: true,
          requiredVersion: '^6.18.0',
          eager: true,
        },
        '@mui/x-charts': {
          singleton: true,
          requiredVersion: '^6.18.0',
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
    }),
    // Define environment variables for browser
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || 'http://localhost:8000')
    }),
  ],
};

