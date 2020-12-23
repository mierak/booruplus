const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const webpack = require('webpack');
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
plugins.push(
	new webpack.DefinePlugin({
		GLOBALS: {
			VERSION: JSON.stringify(require('./package.json').version),
		},
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
			'@db': path.resolve(__dirname, 'src/db'),
			'@service': path.resolve(__dirname, 'src/service'),
			'@appTypes': path.resolve(__dirname, 'src/types'),
			'@util': path.resolve(__dirname, 'src/util'),
			'@store': path.resolve(__dirname, 'src/store'),
			'@hooks': path.resolve(__dirname, 'src/hooks'),
			'@components': path.resolve(__dirname, 'src/components'),
			'@pages': path.resolve(__dirname, 'src/pages'),
			'@errors': path.resolve(__dirname, 'src/errors'),
			'@': path.resolve(__dirname, 'src/'),
		},
	},
};
