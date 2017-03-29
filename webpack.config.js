module.exports = {
  entry: './src/index.ts',
  output: {
    filename: './public/bundle.js',
    path: __dirname
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
      { test: /\.js$/, loader: 'source-map-loader' }
    ]
  }
}
