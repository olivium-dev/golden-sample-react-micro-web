const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  mode: 'development',
  devServer: {
    port: 30007,
    historyApiFallback: true,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy: [
      {
        context: ['/api'],
        target: 'https://dev-creamat.fds-1.com/gateway',
        changeOrigin: true,
        secure: true,
        logLevel: 'debug',
        pathRewrite: {
          '^/api': '/api'
        },
        onProxyReq: (proxyReq, req, res) => {
          proxyReq.setHeader('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0RGVhY3RpdmF0ZU9yZGVyQGdtYWlsLmNvbSIsImp0aSI6IjgzZDQxODU0LTc1ZmQtNDYxYy1iNzk1LTdhZDhjZmNhNGVhYyIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3NpZCI6Ijg0NDA3OTJlLThjZjYtNGI4MC05NjA0LWIxMzM3ZGIzNGI0ZCIsImV4cCI6MTc2NzQ0OTg4NSwiaXNzIjoidXNlci1tYW5hZ2VtZW50IiwiYXVkIjoidXNlci1tYW5hZ2VtZW50In0.0Le14dZd4ceOnpraAyPaPltpiJS4w14D1QEHYLUX-qc');
          proxyReq.setHeader('X-Service-Api-Key', 'order-service-api-key-2024-secure');
          proxyReq.setHeader('X-Service-Token-Key', 'order-service-token-key-def456');
          proxyReq.setHeader('Accept', 'text/plain');
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
      name: 'ordersApp',
      filename: 'remoteEntry.js',
      exposes: {
        './Orders': './src/bootstrap.tsx',
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
    }),
  ],
};
