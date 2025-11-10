const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

// Determine if running in Docker/BFF mode
const isDockerMode = process.env.DOCKER_MODE === 'true' || process.env.BFF_MODE === 'true';
const isProduction = process.env.NODE_ENV === 'production';

// Base URLs for remotes - use BFF ports in Docker mode, direct ports in dev mode
const getRemoteUrl = (appName, port, bffPort) => {
  if (isDockerMode) {
    // In Docker, use service names and BFF ports
    const serviceName = appName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase();
    return `${appName}@http://${serviceName}-bff:${bffPort}/remoteEntry.js`;
  }
  // Development mode - use localhost with direct ports
  return `${appName}@http://localhost:${port}/remoteEntry.js`;
};

module.exports = {
  entry: './src/index.tsx',
  mode: isProduction ? 'production' : 'development',
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  output: {
    publicPath: isDockerMode ? 'auto' : 'auto',
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
      name: 'container',
      filename: 'remoteEntry.js',
      exposes: {
        './sharedUI': '../shared-ui-lib/src/index.ts',
      },
      remotes: {
        userApp: isDockerMode 
          ? 'userApp@http://user-management-bff:4001/remoteEntry.js'
          : 'userApp@http://localhost:3001/remoteEntry.js',
        dataApp: 'dataApp@http://localhost:3002/remoteEntry.js',
        analyticsApp: 'analyticsApp@http://localhost:3003/remoteEntry.js',
        settingsApp: 'settingsApp@http://localhost:3004/remoteEntry.js',
        ordersApp: isDockerMode
          ? 'ordersApp@http://orders-bff:4005/remoteEntry.js'
          : 'ordersApp@http://localhost:3005/remoteEntry.js',
        catalogApp: isDockerMode
          ? 'catalogApp@http://catalog-bff:4006/remoteEntry.js'
          : 'catalogApp@http://localhost:3006/remoteEntry.js',
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
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || 'http://localhost:8000'),
      'process.env.DOCKER_MODE': JSON.stringify(process.env.DOCKER_MODE || 'false'),
      'process.env.BFF_MODE': JSON.stringify(process.env.BFF_MODE || 'false'),
    }),
  ],
};

