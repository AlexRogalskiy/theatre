// @flow
import WebpackNotifierPlugin from 'webpack-notifier'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CleanPlugin from 'clean-webpack-plugin'
import {context, aliases} from '../commons'
import webpack from 'webpack'
import path from 'path'

type Options = {
  env: 'development' | 'production',
}

const bundlesDir = path.join(context, './bundles/studio')

module.exports = (options: Options) => {
  const isDev = options.env === 'development'

  // Don't let this global bother you. It's just a hack to make $root/webpack/env/dotEnvFile.js work
  // both inside a webpack bundle and outside. And that is the only place this global is used.
  global.$$$NODE_ENV = options.env

  // $FlowIgnore
  const envConfig = require(path.join(context, `${options.env}.env.json`))

  const config: Object = {
    context: context,
    // target: '',
    devtool: isDev ? 'eval-source-map' : 'source-map',
    entry: {
      index: isDev ? ['react-hot-loader/patch', './src/studio/index.js'] : ['./src/studio/index.js'],
    },
    // externals: ['electron'],
    output: {
      path: bundlesDir,
      libraryTarget: 'umd',
      library: 'TheaterJS',
      publicPath: `http://localhost:${envConfig.devSpecific.studio.devServerPort}/`,
      filename: '[name].js',
      sourceMapFilename: '[file].map.js',
    },
    resolve: {
      // fallback: path.join(context, 'node_modules'),
      alias: aliases,
      extensions: ['.ts', '.tsx', '.js', '.json'],
    },
    module: {
      rules: [
        {test: /\.js$/, use: {loader: `babel-loader`, options: {forceEnv: `studio:${options.env}`}}, exclude: /node_modules/},
        {test: /\.tsx?$/, use: {loader: `awesome-typescript-loader`, options: {transpileOnly: true}}, exclude: /node_modules/},
        {
          test: /\.css$/,
          use: [
            `style-loader`,
            {
              loader: 'css-loader',
              options: {
                sourceMap: isDev,
                modules: true,
                localIdentName: '[name]_[local]_[hash:4]',
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: () => {
                  return [
                    require('postcss-hexrgba'),
                    require('postcss-nesting'),
                    require('postcss-short'),
                  ]
                },
              },
            },
          ],
          include: path.join(context, 'src'),
        },
        {test: /\.svg$/, use: 'svg-inline-loader'},
        {test: /\.(png|jpg|jpeg|gif)$/, use: [{loader: 'url-loader', options: {'prefix': 'img/', limit: 5000}}]},
      ],
    },
    plugins: [
      new CleanPlugin([bundlesDir], {root: context}),
      new webpack.DefinePlugin({
        // This is only used inside `$root/webpack/env/index.js` and there it is
        // mirrored in process.env.NODE_ENV. So read this value from process.env.NODE_ENV.
        '$$$NODE_ENV': JSON.stringify(options.env),
      }),
      new webpack.ProvidePlugin({
        'process.env': '$root/webpack/env/index.js',
      }),
      new HtmlWebpackPlugin({
        inject: 'body',
        template: 'src/studio/index.html',
      }),
    ],
  }

  // plugins
  if (isDev) {
    config.plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new WebpackNotifierPlugin(),
      // new webpack.NoEmitOnErrorsPlugin(),
      new webpack.NamedModulesPlugin(),
    )
  } else {
    config.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compressor: {warnings: false},
      })
    )
  }

  if (isDev) {
    config.devServer = {
      host: '0.0.0.0',
      hot: true,
      historyApiFallback: true,
      inline: true,
      clientLogLevel: 'error',
      public: `localhost:${envConfig.devSpecific.studio.devServerPort}`,
      noInfo: false,
      quiet: false,
      stats: false,
      headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Expose-Headers': 'SourceMap,X-SourceMap'},
      port: envConfig.devSpecific.studio.devServerPort,
    }
  }

  return config
}