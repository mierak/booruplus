const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const path = require('path');
const WorkerPlugin = require('worker-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');

rules.push({
	test: /\.css$/,
	use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});
plugins.push(new WorkerPlugin());
plugins.push(
	new CircularDependencyPlugin({
		// exclude detection of files based on a RegExp
		exclude: /a\.js|node_modules/,
		// include specific files based on a RegExp
		// add errors to webpack instead of warnings
		failOnError: true,
		// allow import cycles that include an asyncronous import,
		// e.g. via import(/* webpackMode: "weak" */ './file.js')
		allowAsyncCycles: false,
		// set the current working directory for displaying module paths
		cwd: process.cwd(),
	})
);

module.exports = {
	output: {
		chunkFilename: 'main_window/[name].js',
		publicPath: '../',
	},
	module: {
		rules,
	},
	plugins: plugins,
	resolve: {
		extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
		alias: {
			db: path.resolve(__dirname, 'db'),
			service: path.resolve(__dirname, 'service'),
			types: path.resolve(__dirname, 'types'),
			util: path.resolve(__dirname, 'util'),
			store: path.resolve(__dirname, 'store'),
			hooks: path.resolve(__dirname, 'src/hooks'),
		},
	},
};
