const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.development
const envFile = path.resolve(__dirname, '.env.development');
const envConfig = dotenv.config({ path: envFile });

if (envConfig.error) {
  console.warn('⚠️  .env.development file not found, using default values');
} else {
  console.log('✅ Loaded .env.development:', envFile);
  console.log('🔑 Firebase API Key loaded:', process.env.REACT_APP_FIREBASE_API_KEY ? process.env.REACT_APP_FIREBASE_API_KEY.substring(0, 20) + '...' : 'NOT FOUND');
  console.log('🏠 Auth Domain loaded:', process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'NOT FOUND');
}

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
    proxy: [
      {
        context: ['/api/users'],
        target: 'http://localhost:4001',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
      },
      {
        context: ['/api/catalog'],
        target: 'http://localhost:4006',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
      },
      {
        context: ['/api/cdn'],
        target: 'http://localhost:4006',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
      },
      {
        context: ['/api/orders'],
        target: 'http://localhost:4005',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
      },
    ],
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
      'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || 'http://localhost:8000'),
      // Firebase configuration - Using saawt-app to match backend Admin SDK
      'process.env.REACT_APP_FIREBASE_API_KEY': JSON.stringify(process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyCBqiELZcS0Aw2qEqYxJdXzYqVx8Zw8fZ0'),
      'process.env.REACT_APP_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'saawt-app.firebaseapp.com'),
      'process.env.REACT_APP_FIREBASE_PROJECT_ID': JSON.stringify(process.env.REACT_APP_FIREBASE_PROJECT_ID || 'saawt-app'),
      'process.env.REACT_APP_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'saawt-app.appspot.com'),
      'process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '111180020195242483280'),
      'process.env.REACT_APP_FIREBASE_APP_ID': JSON.stringify(process.env.REACT_APP_FIREBASE_APP_ID || '1:111180020195242483280:web:8c9e5f3a4b2d1e6f7a8b9c'),
    }),
  ],
};

