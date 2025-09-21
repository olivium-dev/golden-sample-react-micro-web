// Webpack Module Federation Template
// Replace {{APP_NAME}}, {{PORT}}, and {{EXPOSES}} with actual values

const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  mode: "development",
  devServer: {
    port: {{PORT}}, // 3000 for container, 3001+ for remotes
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "{{APP_NAME}}", // container, auth, dashboard, profile
      
      // For container (host) - include remotes
      remotes: {
        auth: "auth@http://localhost:3001/remoteEntry.js",
        dashboard: "dashboard@http://localhost:3002/remoteEntry.js",
        profile: "profile@http://localhost:3003/remoteEntry.js",
      },
      
      // For remotes - include filename and exposes
      filename: "remoteEntry.js",
      exposes: {
        {{EXPOSES}} // "./AuthPage": "./src/pages/AuthPage"
      },
      
      // Shared dependencies (same for all apps)
      shared: {
        react: { 
          singleton: true,
          requiredVersion: "^18.0.0"
        },
        "react-dom": { 
          singleton: true,
          requiredVersion: "^18.0.0"
        },
        "react-router-dom": {
          singleton: true
        }
      },
    }),
  ],
  
  // Production optimizations
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
  
  // TypeScript support
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
  },
  
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: "asset/resource",
      },
    ],
  },
};
