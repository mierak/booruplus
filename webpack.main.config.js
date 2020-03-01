const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');
console.log(path.resolve(__dirname));

module.exports = {
	/**
	 * This is the main entry point for your application, it's the first file
	 * that runs in the main process.
	 */
	entry: { main: './electron/index.ts', preload: './electron/preload.js' },
	// Put your normal webpack config below here
	plugins: [new CopyPlugin([{ from: './electron/preload.js', to: './' }])],
	module: {
		rules: require('./webpack.rules')
	},
	node: {
		__dirname: true
	},
	resolve: {
		extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json']
	}
};
