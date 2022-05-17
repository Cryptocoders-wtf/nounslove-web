const webpack = require('webpack');

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new webpack.ProvidePlugin({
             process: 'process/browser',
      }),
    ],
    resolve: {
      fallback: {
        "buffer": require.resolve('buffer/'),
        "http": false,
        "https": 'agent-base',
        "stream": false,
        "crypto": false,
        "os": false,
        "url": false,
        "assert": false,
      }
    }
  }
};
