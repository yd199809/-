/**
 *  打包开发环境
 */
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import esbuild from "esbuild";
import { createRequire } from "node:module";

const {
  values: { format },
  positionals,
} = parseArgs({
  allowPositionals: true,
  options: {
    format: {
      type: "string",
      short: "f",
      default: "esm",
    },
  },
});
console.log(format, positionals);

// 创建 sem 的 __filename
const __filename = fileURLToPath(import.meta.url);

// 创建 sem 的 __filename
const __dirname = dirname(__filename);

// 创建 require
const require = createRequire(import.meta.url);

const target = positionals.length ? positionals[0] : "vue";
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`);

console.log("entry => ", entry);

/**
 * 输出文件 --format cjs or esm
 * cjs => reactivity.cjs.js
 * esm => reactivity.esm.js
 * @type {string}
 */
const outfile = resolve(
  __dirname,
  `../packages/${target}/dist/${target}.${format}.js`
);

const pkg = require(`../packages/${target}/package.json`);
console.log("===", pkg);

esbuild
  .context({
    entryPoints: [entry], // 入口文件
    outfile, // 输出文件
    format, // 输出格式
    platform: format === "cjs" ? "node" : "browser", // 打包平台
    sourcemap: true, // 源码映射
    globalName: pkg.buildOptions.name, // 全局变量名
    bundle: true, // 打包
  })
  .then((ctx) => {
    // 监听文件变更重新打包
    return ctx.watch();
  });
