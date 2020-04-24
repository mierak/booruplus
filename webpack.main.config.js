const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	/**
	 * This is the main entry point for your application, it's the first file
	 * that runs in the main process.
	 */
	entry: './electron/index.ts',
	plugins: [new CopyPlugin([{ from: './src/splash_screen.html', to: '.' }])],
	// Put your normal webpack config below here
	// plugins: [new CopyPlugin([{ from: './electron/preload.js', to: './' }])],
	module: {
		rules: require('./webpack.rules'),
	},
	resolve: {
		extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
	},
};
