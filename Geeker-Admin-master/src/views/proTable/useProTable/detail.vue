<template>
  <div class="card content-box">
    <span class="text">我是 ProTable 详情页，属于 ProTable 下面的子集 🍓🍇🍈🍉</span>
    <span class="text">params:{{ route.params }}</span>
    <span class="text">query:{{ route.query }}</span>
  </div>
</template>

<script setup lang="ts" name="useProTableDetail">
// 【Vue解释】：使用 vue-router 提供的 useRoute 组合式函数获取当前路由信息（如 params 和 query）。
import { useRoute } from "vue-router";
const route = useRoute();
</script>
