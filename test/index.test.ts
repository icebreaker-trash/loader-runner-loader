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
import webpack from 'webpack'
// import { minimatch } from 'minimatch'
// import tailwindcss from 'tailwindcss'
// import loaderRunnerLoader from '@/index'
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

  it('multipleContexts case 0', async () => {
    // process.chdir(process.cwd())
    // // 为什么无效，缓存了吗
    // cached postcss
    const context = path.resolve(__dirname, './fixtures/multiple-contexts')
    const pc = path.resolve(context, 'postcss.config.js')
    const mpc = path.resolve(context, 'postcss.config.module.js')
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
            // nested rules
            // 先执行 子项，再执行父
            test: /\.css$/i,
            use: [MiniCssExtractPlugin.loader, 'css-loader'], //, 'css-loader', 'postcss-loader'],
            // https://www.npmjs.com/package/postcss-loader#postcssOptions
            rules: [
              {
                test: /\.css$/i,
                use: [
                  {
                    loader: 'postcss-loader',
                    options: {
                      // function
                      postcssOptions: (
                        loaderContext: webpack.LoaderContext<object>
                      ) => {
                        // (?!\.)[^/]+ *
                        // const reg = minimatch.makeRe('**/module/**/*.css')
                        // console.log(reg)
                        // (?:\/|(?:(?!(?:\/|^)\.).)*?\/)?
                        const isModule = /module[/\\]\w+\.css/.test(
                          loaderContext.resourcePath
                        )
                        //  minimatch(
                        //   loaderContext.resourcePath,
                        //   '**/module/**/*.css',
                        //   {
                        //     partial: true
                        //   }
                        // )
                        // 为什么无效，缓存了吗
                        if (isModule) {
                          return {
                            config: mpc
                          }
                        }
                        // loaderContext.resourcePath
                        // config
                        return {
                          config: pc
                        }
                      }
                    }
                  }
                ]
              }
            ]
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

  it('multipleContexts case 1', async () => {
    const context = path.resolve(__dirname, './fixtures/multiple-contexts')
    const pc = path.resolve(context, 'postcss.config.js')
    const mpc = path.resolve(context, 'postcss.config.module.js')
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
            use: [
              MiniCssExtractPlugin.loader,
              'css-loader',
              {
                loader: 'postcss-loader',
                options: {
                  // function
                  postcssOptions: (
                    loaderContext: webpack.LoaderContext<object>
                  ) => {
                    const isModule = /module[/\\]\w+\.css/.test(
                      loaderContext.resourcePath
                    )
                    if (isModule) {
                      return {
                        ...require(mpc)
                      }
                    }
                    return {
                      ...require(pc)
                    }
                  }
                }
              }
            ] //, 'css-loader', 'postcss-loader'],
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
