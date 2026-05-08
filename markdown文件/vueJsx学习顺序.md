学习 Vue 的 JSX/TSX，最好的途径就是阅读那些**高度抽象、需要处理复杂动态渲染**的开源项目。在 Vue 生态中，最常使用 JSX 的往往是 **UI 组件库**和**企业级中后台框架**。

以下为你推荐几个在 GitHub 上极具学习价值的 Vue + JSX/TSX 项目，按学习梯度和类型为你分类：

### 1. 纯 TSX 构建的 UI 组件库（强烈推荐，最佳学习范本）

UI 组件库因为需要极高的动态性和灵活性，通常是 JSX 的重度使用者。

*   **Naive UI (tusen-ai/naive-ui)**
    *   **GitHub地址**: [https://github.com/tusen-ai/naive-ui](https://github.com/tusen-ai/naive-ui)
    *   **推荐理由**: 尤雨溪曾多次推荐的 Vue 3 组件库。它的源码**几乎全部使用 TypeScript + TSX 编写**。代码极其规范、优雅。如果你想学习如何在 Vue3 中把 TSX 的类型推导发挥到极致，以及如何用 TSX 封装高阶组件，这绝对是首选。
    *   **学习重点**: TS 类型定义、Render 函数的高级用法、Provide/Inject 在 TSX 中的结合。

*   **Ant Design Vue (vueComponent/ant-design-vue)**
    *   **GitHub地址**: [https://github.com/vueComponent/ant-design-vue](https://github.com/vueComponent/ant-design-vue)
    *   **推荐理由**: 因为 Ant Design 原本是 React 生态的，所以它的 Vue 移植版为了保持底层逻辑的一致性，大量使用了 JSX。
    *   **学习重点**: 如果你有 React 经验，看这个项目能极快地理解 React JSX 和 Vue JSX 在底层事件、插槽 (Slots)、指令 (如 `v-model` 的 JSX 写法) 上的差异。

### 2. 大型企业级 Admin 框架（适合学习业务场景）

如果你想知道在实际的业务开发（如动态表单、动态表格渲染）中如何使用 JSX，看这些项目最合适。

*   **Vue Vben Admin (vbenjs/vue-vben-admin)**
    *   **GitHub地址**: [https://github.com/vbenjs/vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)
    *   **推荐理由**: Vue 3 生态里最火的中后台解决方案之一。它在封装 `Table`（表格）和 `Form`（表单）组件时，大量使用了 TSX 来实现配置化渲染（Schema-based render）。
    *   **学习重点**: 学习如何通过 JSON 配置表驱动生成页面，以及如何在单文件组件 (`.vue`) 中穿插使用 JSX 渲染函数。

*   **Geeker Admin (HalseySpicy/Geeker-Admin)**
    *   **GitHub地址**: [https://github.com/HalseySpicy/Geeker-Admin](https://github.com/HalseySpicy/Geeker-Admin)
    *   **推荐理由**: 相比于 Vben，Geeker Admin 的体量更轻，代码更易读。它同样使用 TSX 封装了 ProTable 组件。
    *   **学习重点**: 适合初学者阅读，学习如何用 TSX 封装业务级别的复合组件。

### 3. 混合架构的标杆项目

*   **Element Plus (element-plus/element-plus)**
    *   **GitHub地址**: [https://github.com/element-plus/element-plus](https://github.com/element-plus/element-plus)
    *   **推荐理由**: 官方的 Vue 3 组件库，它是混合开发的典范。大部分常规组件使用普通的 `.vue` SFC（单文件组件），但遇到高度动态的组件（如 `Tree`、`Table`、`Virtual-List`）时，就会切换到 TSX。
    *   **学习重点**: 学习架构设计——**什么时候该用 Template，什么时候该用 JSX**。

---

### 💡 给你的 Vue JSX 学习建议：

1.  **先看官方插件文档**：在深入源码前，务必先过一遍 Vue 官方的 JSX 编译插件文档：[@vue/babel-plugin-jsx](https://github.com/vuejs/babel-plugin-jsx) （Vue3 是 `@vue/babel-plugin-jsx`），了解 Vue 中的 JSX 和 React JSX 的细微区别。
2.  **重点攻克 3 个难点**：
    *   **插槽 (Slots)**：Vue 的插槽在 JSX 中表现为 `v-slots` 或者对象传递 `{ default: () => <div></div>, header: () => <span></span> }`，这与 Template 差异很大。
    *   **指令转换**：比如 `v-model`、`v-show` 在 JSX 中如何书写，特别是带修饰符的指令（如 `v-model:title`，`v-on:click.stop`）。
    *   **类型推导 (TSX)**：学习如何为 `defineComponent` 中的 `props` 和 `emits` 声明准确的 TypeScript 类型，让 JSX 标签获得完美的类型提示。

建议你先从 **Geeker Admin 的 ProTable 组件**看起，理解业务逻辑后，再去挑战阅读 **Naive UI** 的源码！