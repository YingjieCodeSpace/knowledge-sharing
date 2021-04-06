const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin"); // generate index.html from template
const InterpolateHtmlPlugin = require("interpolate-html-plugin"); // inject custom variables to html template file
const CopyWebpackPlugin = require("copy-webpack-plugin"); // copy public folder to dist

module.exports = {
  entry: "./src/App.tsx",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },

  mode: "development",

  optimization: {
    usedExports: true,
  },

  devServer: {
    contentBase: "./dist",
    hot: true,
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "cheap-module-source-map",

  performance: {
    hints: "warning",
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public", "index.html"),
      //   minify: {
      //     removeComments: true,
      //     collapseWhitespace: true,
      //     removeRedundantAttributes: true,
      //     useShortDoctype: true,
      //     removeEmptyAttributes: true,
      //     removeStyleLinkTypeAttributes: true,
      //     keepClosingSlash: true,
      //     minifyJS: true,
      //     minifyCSS: true,
      //     minifyURLs: true,
      //   },
    }),
    new InterpolateHtmlPlugin({
      PUBLIC_URL: "public",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public"),
          to: path.resolve(__dirname, "dist", "public"),
        },
      ],
    }),
  ],

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },

  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/env", "@babel/react", "@babel/typescript"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        // this loader will handle svg file in react component
        test: /\.svg$/,
        loader: "svg-url-loader",
      },
    ],
  },
};
