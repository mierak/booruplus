const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	/**
	 * This is the main entry point for your application, it's the first file
	 * that runs in the main process.
	 */
	entry: { main: './src/index.ts', preload: './src/preload.js' },
	// Put your normal webpack config below here
	plugins: [new CopyPlugin([{ from: './src/preload.js', to: './' }])],
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
