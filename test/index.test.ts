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
// 测试目录下有 wxml，会导致模块找不到！！！！
// 同时document.querySelector('#app').innerHTML = 要有
// 太奇怪了！！

// 本质是一个 postcss 引用问题，因为 bg-[url(./xxx)] 会导致 webpack 去加载它，这才是真正的原因！！！
describe('[Default]', () => {
  it('multipleContexts', async () => {
    // process.chdir(process.cwd())
    const context = path.resolve(__dirname, './fixtures/multiple-contexts')
    const customCompiler = getMemfsCompiler5({
      mode: 'production',

      optimization: {
        sideEffects: false
      },
      entry: {
        index: './src/index.js',
        module: './src/module/index.js'
      },
      context,
      plugins: [new MiniCssExtractPlugin()],
      //
      module: {
        rules: [
          {
            test: /\.css$/i,
            use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
          }
        ]
      }
    })
    // @ts-ignore
    // customCompiler.outputFileSystem = fs
    const stats = await compile(customCompiler)
    const assets = readAssets(customCompiler, stats)
    expect(assets).toMatchSnapshot('assets')
    expect(getErrors(stats)).toMatchSnapshot('errors')
    expect(getWarnings(stats)).toMatchSnapshot('warnings')
  })
})
