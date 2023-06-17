import path from 'node:path'
import fs from 'node:fs'
import {
  getMemfsCompiler5,
  compile,
  readAssets,
  createLoader,
  getErrors,
  getWarnings
} from 'webpack-build-utils'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
// import { runLoaders } from 'promisify-loader-runner'

describe('[Default]', () => {
  it('multipleContexts', async () => {
    const multipleContextsPath = path.resolve(
      __dirname,
      './fixtures/multiple-contexts'
    )
    const customCompiler = getMemfsCompiler5({
      mode: 'production',

      optimization: {
        sideEffects: false
      },
      entry: {
        index: './src/index.js',
        module: './src/module/index.js'
      },
      // entry: indexEntry,
      context: multipleContextsPath,
      output: {
        path: path.resolve(multipleContextsPath, './dist')
        // filename: '[name].js', // ?var=[fullhash]
        // chunkFilename: '[id].[name].js' // ?ver=[fullhash]
      },
      // @ts-ignore
      plugins: [new MiniCssExtractPlugin()],
      module: {
        rules: [
          {
            test: /\.css$/i,
            use: [
              MiniCssExtractPlugin.loader,
              createLoader(function (source: string) {
                return source
              }),
              'css-loader',
              'postcss-loader'
            ]
          }
        ]
      }
    })
    // @ts-ignore
    customCompiler.outputFileSystem = fs
    const stats = await compile(customCompiler)
    const assets = readAssets(customCompiler, stats)
    expect(assets).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })
})
