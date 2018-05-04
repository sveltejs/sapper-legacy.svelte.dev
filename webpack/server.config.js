const config = require('sapper/webpack/config.js');
const webpack = require('webpack');
const pkg = require('../package.json');

module.exports = {
	entry: config.server.entry(),
	output: config.server.output(),
	target: 'node',
	resolve: {
		extensions: ['.js', '.json', '.html']
	},
	externals: Object.keys(pkg.dependencies),
	mode: process.env.NODE_ENV,
	module: {
		rules: [
			{
				test: /\.html$/,
				exclude: /node_modules/,
				use: {
					loader: 'svelte-loader',
					options: {
						css: false,
						generate: 'ssr'
					}
				}
			}
		]
	}
};