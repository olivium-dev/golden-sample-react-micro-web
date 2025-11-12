const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  mode: 'development',
  devServer: {
    port: 30008,
    historyApiFallback: true,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:30001',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
        pathRewrite: {
          '^/api': '/api'
        }
      }
    ]
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
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        REACT_APP_API_URL: JSON.stringify(process.env.REACT_APP_API_URL || 'http://localhost:30001'),
      },
    }),
    new ModuleFederationPlugin({
      name: 'deliveryApp',
      filename: 'remoteEntry.js',
      exposes: {
        './Delivery': './src/bootstrap.tsx',
      },
      remotes: {
        sharedUI: 'container@http://localhost:30002/remoteEntry.js',
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
      inject: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: '',
          globOptions: {
            ignore: ['**/index.html'],
          },
        },
      ],
    }),
  ],
};
