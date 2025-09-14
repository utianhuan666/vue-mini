/**
 * 打包开发环境
 *
 * node scripts/dev.js --format esm
 */
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import esbuild from 'esbuild'
import { createRequire } from 'node:module'
/**
 * 解析命令行参数
 */
const {
  values: { format },
  positionals,
} = parseArgs({
  allowPositionals: true,
  options: {
    format: {
      type: 'string',
      short: 'f',
      default: 'esm',
    },
  },
})

//创建 esm的filename
const __filename = fileURLToPath(import.meta.url)
//创建 esm的__dirname
const __dirname = dirname(__filename)

const require = createRequire(import.meta.url)

const target = positionals.length ? positionals[0] : 'vue'

const entry = resolve(__dirname, `../packages/${target}/src/index.ts`)
const outfile = resolve(
  __dirname,
  `../packages/${target}/dist/${target}.${format}.js`
)

const pkg = require(`../packages/${target}/package.json`)
console.log(pkg)

esbuild.context({
  entryPoints: [entry],//入口文件
  outfile,//输出文件
  format,//打包格式 cjs esm iife
  platform: format === 'cjs' ? 'node' : 'browser',//指定打包平台
  sourcemap: true,//开启sourceMap方便调试
  bundle: true,//把所有的依赖打包到一个文件中
  globalName: pkg.buildOptions?.name,//打包成iife格式时，挂载到window的变量名
}).then((ctx) => ctx.watch())//监听文件变化，自动打包

