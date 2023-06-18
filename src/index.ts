import { runLoaders } from 'promisify-loader-runner'
import type { RunLoaderOption } from 'promisify-loader-runner'
import loaderUtils from 'loader-utils'
import webpack from 'webpack'

type UserDefinedOptions = {
  use?: RuleUseOption
}

type LoaderType = webpack.LoaderDefinitionFunction<UserDefinedOptions>
// type s = webpack.ModuleOptions['rules']
type RuleUse = webpack.RuleSetRule['use']

type RuleUseFunctionParameters = [
  ctx: webpack.LoaderContext<UserDefinedOptions>,
  ...args: Parameters<LoaderType>
]

type RuleUseFunction = (...args: RuleUseFunctionParameters) => RuleUse

type RuleUseOption = RuleUse | RuleUseFunction

type InternalOptions = {
  use: RuleUse
  readResource: any // RunLoaderOption['readResource']
}

type GetOptionsFunction = (
  ...args: RuleUseFunctionParameters
) => InternalOptions

const getOptions: GetOptionsFunction = function (
  ctx,
  source,
  sourceMap,
  additionalData
) {
  // @ts-ignore
  const { use, readResource } = loaderUtils.getOptions(ctx)
  const useOption = use as RuleUseOption
  const realUse: RuleUse =
    typeof useOption === 'function'
      ? // @ts-ignore
        useOption(ctx, source, sourceMap, additionalData)
      : useOption
  return {
    use: realUse,
    readResource
  }
}

const loader: LoaderType = async function (source, sourceMap, additionalData) {
  const { readResource, use } = getOptions(
    this,
    source,
    sourceMap,
    additionalData
  )
  if (use === undefined) {
    // do nothing
    return source
  }
  // @ts-ignore
  const loaders: any[] = typeof use === 'string' ? [use] : use
  const { result } = await runLoaders({
    context: this,
    loaders,
    readResource,
    resource: this.resource
    // readResource
  })

  return Array.isArray(result) ? (result[0] as string | Buffer) : result ?? ''
}

export default loader
