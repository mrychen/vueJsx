import { createApp } from "vue";
import App from "./App.vue";

// 全局样式重置：清除浏览器默认样式，避免不同浏览器间样式差异。
import "@/styles/reset.scss";
// 全局公共样式：包含项目通用颜色、排版、布局等基础样式。
import "@/styles/common.scss";
// iconfont 图标样式：引入项目使用的 iconfont 字体图标样式。
import "@/assets/iconfont/iconfont.scss";
// 项目自定义字体样式：通常包含字体文件声明和字体族定义。
import "@/assets/fonts/font.scss";
// Element Plus UI 库的基础样式。
import "element-plus/dist/index.css";
// Element Plus 暗黑主题的 CSS 变量样式，支持暗黑模式展示。
import "element-plus/theme-chalk/dark/css-vars.css";
// 自定义 Element Plus 暗黑主题样式，用于覆盖或增强默认暗黑主题样式。
import "@/styles/element-dark.scss";
// 自定义 Element Plus 样式，用于覆盖默认主题、调整组件间距、颜色等。
import "@/styles/element.scss";
// svg 图标注册：通过虚拟模块自动注册 SVG 图标组件。
import "virtual:svg-icons-register";
// 引入 Element Plus 组件库的插件对象，后续用于注册到 Vue 应用。
import ElementPlus from "element-plus";
// 引入 Element Plus 内置图标集，后续统一注册为全局组件。
import * as Icons from "@element-plus/icons-vue";
// 自定义指令集合，例如权限校验、拖拽、粘贴处理等指令。
import directives from "@/directives/index";
// Vue Router 路由配置实例，用于管理页面导航。
import router from "@/routers";
// 国际化配置实例，用于支持多语言切换和文本翻译。
import I18n from "@/languages/index";
// Pinia 状态管理实例，用于管理全局应用状态。
import pinia from "@/stores";
// 全局错误处理函数，用于捕获 Vue 组件渲染和生命周期中的异常。
import errorHandler from "@/utils/errorHandler";

// 创建 Vue 根应用实例，App 组件是整个应用的入口组件。
const app = createApp(App);

// 配置全局错误处理器：当 Vue 组件渲染过程发生错误时，统一交给 errorHandler 处理。
app.config.errorHandler = errorHandler;

// 全局注册 Element Plus 图标组件。
// 这样在模板中可以直接使用 <Check />、<Close /> 等图标组件。
Object.keys(Icons).forEach(key => {
  app.component(key, Icons[key as keyof typeof Icons]);
});

// 按顺序挂载插件和插件实例：
// 1. ElementPlus：注册 Element UI 组件库
// 2. directives：注册自定义 Vue 指令
// 3. router：启用路由功能
// 4. I18n：启用国际化支持
// 5. pinia：启用状态管理
// 最后挂载到 id 为 #app 的 DOM 元素。
app.use(ElementPlus).use(directives).use(router).use(I18n).use(pinia).mount("#app");
