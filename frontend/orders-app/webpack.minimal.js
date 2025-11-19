const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/index.minimal.tsx',
  mode: 'development',
  devServer: {
    port: 3006, // Using port 3006 for orders-app
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
          console.log('Proxying request:', req.url);
          // Add the authorization header to proxied requests
          proxyReq.setHeader('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0TmdpbnhAZ21haWwuY29tIiwianRpIjoiZjE4NzJjNWUtYjUyZC00MDEwLTliNDktZjI4YWZmYWQ2NjZhIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvc2lkIjoiYjg1OTUxZGUtMTY5Zi00Yjk2LTgzZmQtMzQ2NzQwODc3ZGQ1IiwiZXhwIjoxNzY3MjYyNzAxLCJpc3MiOiJ1c2VyLW1hbmFnZW1lbnQiLCJhdWQiOiJ1c2VyLW1hbmFnZW1lbnQifQ.Kz3gxinDvAh4JJBWJCsxVeKVKKg5pti3AOeObNhxAzc');
        },
        onError: (err, req, res) => {
          console.error('Proxy error:', err);
        }
      }
    ]
  },
  output: {
    publicPath: 'http://localhost:3005/',
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
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico',
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
  ],
};