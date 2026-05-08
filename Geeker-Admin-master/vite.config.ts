import { defineConfig, loadEnv, ConfigEnv, UserConfig } from "vite";
import { resolve } from "path";
import { wrapperEnv } from "./build/getEnv";
import { createProxy } from "./build/proxy";
import { createVitePlugins } from "./build/plugins";
import pkg from "./package.json";
import dayjs from "dayjs";

// 读取 package.json 中的依赖和项目信息，用于在构建时注入应用元信息。
const { dependencies, devDependencies, name, version } = pkg;
const __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  // 生成当前构建时间，方便在程序中展示版本和构建时间信息。
  lastBuildTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
};

// Vite 官方配置入口。
// defineConfig 提供类型推导和更好的 IDE 支持。
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // 项目根目录，通常是当前工作目录。
  // 具体目录是?根据 Vite 的运行位置决定的，通常是项目根目录。
  const root = process.cwd();
  // 根据当前运行模式加载对应的 .env 文件，例如 .env.development 或 .env.production。
  const env = loadEnv(mode, root);
  // 包装 env 变量，将字符串形式的环境变量转换为对应类型，并提取自定义配置项。
  const viteEnv = wrapperEnv(env);

  return {
    // 部署时的公共基础路径，一般用于静态资源请求前缀:一般是:'/' 或 './'，根据实际部署环境调整。
    base: viteEnv.VITE_PUBLIC_PATH,
    // Vite 根目录配置，与 projectRoot 一致。
    root,
    resolve: {
      alias: {
        // 项目内部路径别名，方便使用 @ 直接定位 src 目录。
        "@": resolve(__dirname, "./src"),
        // 兼容 vue-i18n ESM/CJS 版本导入，确保打包时使用指定格式。
        "vue-i18n": "vue-i18n/dist/vue-i18n.cjs.js"
      }
    },
    define: {
      // 在项目任何地方，可以通过 window.__APP_INFO__ 访问这些信息。
      // 向应用注入全局常量，构建时会直接替换为字符串字面量。
      __APP_INFO__: JSON.stringify(__APP_INFO__)
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 预处理器全局注入变量文件，无需在每个 SCSS 文件中手动 import。
          additionalData: `@import "@/styles/var.scss";`
        }
      }
    },
    server: {
      // 允许外部设备访问本地服务。
      host: "0.0.0.0",
      // 本地开发服务器端口。
      port: viteEnv.VITE_PORT,
      // 启动后是否自动在浏览器中打开页面。
      open: viteEnv.VITE_OPEN,
      // 启用跨域请求支持，适用于本地调试接口联调。
      cors: true,
      // 代理配置，从环境变量中读取并创建相应规则，以避免前端跨域问题。
      // 例如将 /api 请求代理到后端服务地址。
      proxy: createProxy(viteEnv.VITE_PROXY)
    },
    // 插件入口，由 build/plugins.ts 创建，包含 Vue、SVG、组件自动导入等插件。
    plugins: createVitePlugins(viteEnv),
    esbuild: {
      // 仅在构建时清除 console.log 和 debugger 语句，不会影响开发环境。
      pure: viteEnv.VITE_DROP_CONSOLE ? ["console.log", "debugger"] : []
    },
    build: {
      // 输出目录，默认 dist。
      outDir: "dist",
      // 使用 esbuild 进行代码压缩，速度更快。
      minify: "esbuild",
      // 如果需要更强的 console 删除能力，可改为 terser，并开启 terserOptions。
      // esbuild 打包速度快，但不支持按配置完整删除 console 日志；terser 支持更细粒度优化。
      // minify: "terser",
      // terserOptions: {
      //   compress: {
      //     drop_console: viteEnv.VITE_DROP_CONSOLE,
      //     drop_debugger: true
      //   }
      // },
      // 是否生成 source map，生产环境默认关闭可减小构建体积。
      sourcemap: false,
      // 是否显示压缩后的 gzipped 大小报告，关闭可以减少构建时间。
      reportCompressedSize: false,
      // 当输出 chunk 超过 2000 KB 时，Vite 会发出警告，方便定位体积异常的 bundle。
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          // 自定义静态资源输出目录和命名规则。
          // 便于对 JS、CSS、图片、字体等文件进行分类管理。
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
        }
      }
    }
  };
});
