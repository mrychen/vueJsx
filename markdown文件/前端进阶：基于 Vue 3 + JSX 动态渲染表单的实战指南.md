# 前端进阶：基于 Vue 3 + JSX 动态渲染表单的实战指南与 TSX 语法拓展

在现代前端开发中，面对复杂的、高度可配置的业务需求（例如各种审批流、动态问卷、低代码表单），传统的 `<template>` 模板写法往往会显得臃肿且难以维护，满屏的 `v-if` 和冗长的代码会让组件变得难以阅读。

这时候，结合 Vue 3 的 Composition API 与 JSX（或者说是 TSX），使用**配置驱动（Schema-driven）**的模式来渲染组件，是一种非常优雅、扩展性极强的解决方案。

本文将以一个实际的业务场景——**“动态审批表单”**（基于你的 `useChangeForm.tsx`）为例，带你深入学习这种高级模式，并在最后**为你详细拓展 Vue 3 下的 JSX/TSX 核心语法**。

---

## 1. 为什么要在 Vue 3 中使用 JSX？

Vue 3 官方虽然推荐使用 `<template>`（因为它能提供编译时的静态提升等极致优化），但在某些“高度动态化”的场景下，JSX 的优势不可替代：

1. **图灵完备的渲染能力**：JSX 本质上就是 JavaScript。你不需要去记 `v-if`、`v-for` 等指令的特定用法，你可以直接使用原生 JS 的 `if/else`、`switch`、`Array.map()`、`reduce` 等一切逻辑来控制 UI 渲染。
2. **真正的配置化驱动（Schema-driven）**：可以将 UI 结构抽象为一个 JSON 或对象数组（配置表），然后通过遍历这个配置表直接渲染出 UI。这甚至为“后端下发 JSON 直接生成前端页面”打下了基础。
3. **极致的类型安全**：在 `.tsx` 文件中，配合 TypeScript，所有的组件 Props 都能得到严格的类型检查。拼写错误或类型不匹配会在你敲代码时直接标红，而不是等到运行时才报错。

---

## 2. 核心概念：配置化表单的组成

在这个实战案例中，我们实现动态表单主要分为三个核心部分：
1. **配置表（Schema）**：定义表单里有哪些字段（`prop`）、什么类型（`type`）、什么 UI 组件、有什么校验规则（`rules`）。
2. **基础渲染器（Base Renderer）**：一个专门用来把单个“配置项”转换为“真实 DOM/VNode”的工厂函数。formItemRender()
3. **组合容器（Container）**：遍历 Schema，将所有的渲染器组合起来，暴露给外部（如 `.vue` 文件）使用。

---

## 3. 实战解析：`useChangeForm.tsx`

让我们拆解这段经典代码，看看它底层的精妙之处。

### 第一步：定义底层的基础渲染器 (`formItemRender`)

我们需要一个基础工厂函数，无论 Schema 传来的是输入框、文本域还是数字框，它都能统一渲染成 Vant 的 `<van-field>` 组件，并自动绑定对应的属性。

```tsx
// useChangeForm.tsx
import { ref } from 'vue';

export const useChangeForm = () => {
  const formRef = ref<any>();

  // 基础表单项渲染函数
  const formItemRender = (
    // 解构出当前列的配置 (formCol) 和 绑定的表单对象 (form)
    { formCol, form }: any, 
    // 可选的自定义内容渲染器（用于处理插槽等复杂场景）
    contentRenderer?: (formCol: any, form: any) => any ,
  ) => {
    return (
      <van-field
        // 1. 双向绑定：等同于模板里的
        v-model={form[formCol.prop]} 
        autosize
        // 2. 动态属性：利用 ?. 防御性编程，赋予默认值
        type={formCol?.type || 'text'}
        maxlength={formCol?.maxlength || 255}
        placeholder={formCol?.placeholder || '请输入'}
        name={formCol.prop}
        rules={formCol.rules}
        required={formCol.required}
        label={formCol?.label}
        showWordLimit={formCol?.showWordLimit}
        class={formCol?.class || ''}
        
        // 3. 高级技巧：条件挂载插槽/属性
        // 如果传入了 contentRenderer，则将其作为 input 具名插槽传入
        {...(contentRenderer && {
          {/* input是一个具名插槽的名字*/}
          input: () => contentRenderer(formCol, form),
        })}
      />
    );
  };
  // ...
```
**深度解析**：
* `{...(contentRenderer && { input: () => contentRenderer(...) })}` 这是一个非常高级且优雅的 JSX 技巧。它利用了对象的展开运算符 `...`。
  * 如果 `contentRenderer` 存在，它会展开 `{ input: 渲染函数 }`，相当于给 `<van-field>` 传了一个名为 `input` 的 prop（在 Vant 中等同于 input 插槽）。
  * 如果不存在，`contentRenderer && ...` 返回 false 值，展开后相当于什么都没传，干干净净。避免了写丑陋的 `if-else`。

### 第二步：定义配置字典（Schema）

将业务逻辑抽象为配置对象。不同的业务场景（如 `common` 普通审批、`contracts` 合约部审批）对应不同的配置数组。

```tsx
  const columns = {
    // 场景 A：通用审批
    common: {
      formCol: [
        {
          prop: 'approvalRemark',
          type: 'textarea',
          label: '审批意见：',
          maxlength: 255,
          showWordLimit: true,
          required: true,
          rules: [{ required: true, message: '请输入审批意见' }],
          // 【核心】：每个配置项自带自己的 renderer 方法，调用上面的基础渲染器
          renderer: ({ formCol, form }: any) => formItemRender({ formCol, form }),
        },
      ],
    },
    // 场景 B：合约部审批（带有分组和更复杂的校验）
    contracts: {
      formCol: [
        {
          title: '基础金额信息', // 甚至可以配置区块标题
          col: [
            {
              prop: 'approvedAmount',
              type: 'number',
              label: '审定金额：',
              required: true,
              maxlength: 16,
              rules: [
                { required: true, message: '审定金额不能为空' },
                {
                  // 复杂的正则校验直接写在 Schema 里
                  validator: (value: string) => {
                    if (!value) return true;
                    return /^\d{1,9}(\.\d{1,6})?$/.test(value);
                  },
                  message: '整数最多9位，小数最多6位',
                },
              ],
              contentRenderer: (formCol: any, form: any) => (
                <div class="custom-slot">
                  <span>{formCol.hint || '可输入审批意见，最多255字'}</span>
                  <van-button
                    size="small"
                    type="primary"
                    onClick={() => {
                      form[formCol.prop] = '自动填充默认审批意见'
                    }}
                  >
                    一键填充
                  </van-button>
                </div>
              ),
              renderer: ({ formCol, form }: any) => formItemRender({ formCol, form },formCol.contentRenderer),
            }
          ]
        }
      ]
    }
  };
```

### 第三步：组合暴露（Render Function）

我们将 Schema 遍历，转换为可直接被 `.vue` 组件调用的 JSX 渲染函数。

```tsx
  // 这里用 ref 包裹是为了在某些场景下保持响应式，但实际上作为一个返回 VNode 的函数集合，直接导出一个普通对象也可以。
  const renderForm = ref<any>({
    // 渲染 common 模块
    common: ({ reportForm }: any) => (
      // <> </> 是 Fragment 语法，表示一个虚拟的根节点，不会渲染出多余的 DOM 元素
      <>
        {columns['common'].formCol.map((element) =>
          element.renderer({ formCol: element, form: reportForm }),
        )}
      </>
    ),
    // 渲染 contracts 模块（处理了嵌套的 col 数组）
    contracts: ({ reportForm }: any) => (
      <>
        {columns['contracts'].formCol.map((element) => (
          <>
            {/* 动态渲染标题 */}
            {element.title && <div class="titleTip">{element.title}</div>}
            {/* 遍历渲染内部表单项 */}
            {element.col.map((item: any) =>
              item.renderer({ formCol: item, form: reportForm }),
            )}
          </>
        ))}
      </>
    ),
  });

  return {
    formRef,
    renderForm,
  };
};
```

---

## 4. 在 Vue 组件中如何使用？

在传统的 `.vue` 文件中，你可以非常清爽地使用这个 Hook 产出的渲染函数。你会发现 `.vue` 文件里的 `<template>` 变得极其干净！

```vue
<!-- contract.vue -->
<template>
  <div class="form-container">
    <!-- 所有的表单项 DOM 都不见啦，被收敛到了 tsx 中 -->
    <van-form ref="formRef">
      <!-- 重点：像调用动态组件一样直接执行渲染函数 -->
      <component 
        :is="isContract === '1' ? renderForm.contracts : renderForm.common" 
        :reportForm="reportForm" 
      />
    </van-form>
    
    <van-button @click="handelApply">提交</van-button>
  </div>
</template>

<script setup lang="tsx">
import { ref } from 'vue';
import { useChangeForm } from './hooks/useChangeForm';

// 引入 Hook
const { formRef, renderForm } = useChangeForm();

// 统一的状态管理对象，TSX 渲染器内部的 v-model 会自动修改这里的值！
const reportForm = ref({
  approvalRemark: '',
  approvedAmount: '',
  // ...
});

const isContract = ref('1');

const handelApply = () => {
  formRef.value.validate().then(() => {
    console.log('表单验证通过，提交数据：', reportForm.value);
  });
};
</script>
```

**实战总结**：
* **视图与逻辑极度分离**：`.vue` 文件专注于“状态（数据）”和“行为（提交/校验逻辑）”，而繁杂的 DOM 结构全交给了 `.tsx`。
* **应对需求变更是降维打击**：如果产品经理要求加一个“备注”字段，你完全不需要改动 HTML 模板，只需要在 Schema 数组里 push 一个对象即可。

---
<br/>

# 🚀 附录：Vue 3 JSX / TSX 核心语法速成指南

如果你习惯了 Vue 的 `<template>`，刚接触 JSX 可能会有点不适应。记住一句话：**在 JSX 中，除了标签本身，一切动态内容都要用单花括号 `{}` 括起来，里面写原生 JS 表达式。**

### 1. 插值表达式 (Interpolation)
* **Template**: `<div>{{ message }}</div>`
* **JSX**: `<div>{ message.value }</div>` *(注意：在 TSX 中使用 ref 需要手动 `.value`，除非是在模板/Reactive 对象中)*

### 2. 条件渲染 (`v-if` / `v-show`)
JSX 没有 `v-if`，使用原生 JS 的三元表达式或逻辑与 `&&`。

* **Template**:
  ```html
  <div v-if="isShow">可见</div>
  <div v-else>不可见</div>
  <div v-show="isHidden">隐藏</div>
  ```
* **JSX**:
  ```tsx
  // v-if 等价写法 (三元表达式)
  { isShow.value ? <div>可见</div> : <div>不可见</div> }
  
  // 只有 v-if 没有 v-else (逻辑与)
  { isShow.value && <div>可见</div> }
  
  // v-show 在 Vue 3 的 JSX 插件中是被直接支持的！
  <div v-show={isHidden.value}>隐藏</div>
  ```

### 3. 列表渲染 (`v-for`)
JSX 没有 `v-for`，使用原生的 `Array.map()`。

* **Template**:
  ```html
  <ul>
    <li v-for="(item, index) in list" :key="item.id">{{ item.name }}</li>
  </ul>
  ```
* **JSX**:
  ```tsx
  <ul>
    { list.value.map((item, index) => (
      <li key={item.id}>{ item.name }</li>
    )) }
  </ul>
  ```

### 4. 属性绑定 (`v-bind` / `:`)
不需要冒号，直接用 `{}`。

* **Template**: `<img :src="imgUrl" :class="dynamicClass" />`
* **JSX**: `<img src={imgUrl.value} class={dynamicClass.value} />`
* **批量绑定 (v-bind="obj")**: 
  * JSX 中使用展开运算符：`<div {...obj}></div>`

### 5. 事件绑定 (`v-on` / `@`)
将 `@` 替换为 `on` + 首字母大写（驼峰命名）。

* **Template**: `<button @click="handleClick" @change="handleChange">点击</button>`
* **JSX**: `<button onClick={handleClick} onChange={handleChange}>点击</button>`

**事件修饰符**（如 `.stop`, `.prevent`）：
Vue 3 官方 Babel 插件提供了一些快捷方式，也可以手动处理。
* **Template**: `<div @click.stop="handleClick"></div>`
* **JSX 手动处理 (推荐)**: 
  ```tsx
  <div onClick={(e) => { e.stopPropagation(); handleClick(); }}></div>
  ```
* **JSX 修饰符语法 (如果配置了插件)**: `<div onClick={withModifiers(handleClick, ['stop'])}></div>`

### 6. 双向绑定 (`v-model`)
Vue 3 的 JSX 插件原生支持了 `v-model`。

* **Template**: 
  ```html
  <input v-model="text" />
  <custom-comp v-model:visible="isShow" v-model:title.trim="titleStr" />
  ```
* **JSX**:
  ```tsx
  // 基础 v-model
  <input v-model={text.value} />
  
  // 指定 prop 名称和修饰符的 v-model（格式：v-model={[变量, 'prop名', ['修饰符']]}）
  <custom-comp 
    v-model={[isShow.value, 'visible']} 
    v-model={[titleStr.value, 'title', ['trim']]} 
  />
  ```

### 7. 插槽 (Slots)
这是 `<template>` 到 JSX 转变最大的地方。在 JSX 中，插槽本质上就是**传递返回 VNode 的函数**。

* **子组件定义插槽**:
  ```tsx
  // MyComponent.tsx
  const MyComponent = (props, { slots }) => {
    return (
      <div>
        <header>{ slots.header ? slots.header() : '默认头部' }</header>
        <main>{ slots.default ? slots.default() : '默认内容' }</main>
        <footer>{ slots.footer?.({ data: '作用域插槽数据' }) }</footer>
      </div>
    )
  }
  ```

* **父组件使用插槽**:
  有两种主流写法。
  **写法 1：通过 `v-slots` 属性传递（推荐，结构清晰）**
  ```tsx
  <MyComponent v-slots={{
    default: () => <span>这是默认插槽</span>,
    header: () => <h1>这是头部插槽</h1>,
    footer: (scopeProps) => <div>作用域数据：{scopeProps.data}</div>
  }} />
  ```
  **写法 2：将默认插槽作为 children，其他插槽通过 props 传递（常见于组件库）**
  ```tsx
  <MyComponent header={() => <h1>这是头部</h1>}>
    <span>这是默认插槽 (Children)</span>
  </MyComponent>
  ```

掌握了以上 7 点，你就可以在 Vue 3 中游刃有余地编写极具扩展性的 JSX 代码了！