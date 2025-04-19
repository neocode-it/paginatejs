const path = require("path");
const webpack = require("webpack");

const TerserPlugin = require("terser-webpack-plugin"); // For minification (production build)

const productionConfig = {
  entry: "./src/index.js", // Entry point for your application
  output: {
    filename: "paginate.min.js", // Minified output
    path: path.resolve(__dirname, "dist"),
    library: "Paginate", // Expose exports under the global "Paginate" object
    libraryTarget: "umd", // Universal Module Definition
  },
  mode: "production", // Production mode for optimization
  module: {
    rules: [
      {
        test: /\.js$/, // Target .js files
        exclude: /node_modules/, // Exclude node_modules
        use: {
          loader: "babel-loader", // Use Babel for transpilation
        },
      },
    ],
  },
  optimization: {
    usedExports: false, // Include all exports in the output
    minimize: true, // Minify the output
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: /@license/i, // Preserve license comments
          },
        },
        extractComments: false, // Prevent extracting license comments into a separate file
      }),
    ],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: `@license Paginatejs v1.0.0 | MIT License | (C) ${new Date().getFullYear()} Neocode`,
    }),
  ],
};

const watchConfig = {
  entry: "./src/index.js", // Entry point for your application
  output: {
    filename: "paginate.js", // Non-minified output
    path: path.resolve(__dirname, "dist"),
    library: "Paginate", // Expose exports under the global "Paginate" object
    libraryTarget: "umd", // Universal Module Definition
  },
  mode: "development", // Development mode to avoid minification and compression
  module: {
    rules: [
      {
        test: /\.js$/, // Target .js files
        exclude: /node_modules/, // Exclude node_modules
        use: {
          loader: "babel-loader", // Use Babel for transpilation
        },
      },
    ],
  },
  watch: true, // Enable file watching
  optimization: {
    minimize: false, // Disable minification
  },
  devtool: "source-map", // Enable source maps for easier debugging
  plugins: [
    new webpack.BannerPlugin({
      banner: `@license Paginatejs v1.0.0 | MIT License | (C) ${new Date().getFullYear()} Neocode`,
    }),
  ],
};

module.exports = [productionConfig, watchConfig];
