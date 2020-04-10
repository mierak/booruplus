const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const path = require('path');
const WorkerPlugin = require('worker-plugin');

rules.push({
	test: /\.css$/,
	use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});
plugins.push(new WorkerPlugin());

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
