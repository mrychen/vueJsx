// 这个文件定义了一些高级 TypeScript 类型工具，用于处理对象类型的转换和操作。
// 这些类型不会产生运行时代码，只在编译时提供类型检查和推导。

/**
 * ObjToKeyValUnion<T>
 * 将对象类型 T 的每个属性转换为 { key: K; value: T[K] } 形式的联合类型。
 * 例如：如果 T = { a: string; b: number }，则结果为 { key: "a"; value: string } | { key: "b"; value: number }
 * 用途：当你需要将对象的键值对作为联合类型处理时，比如动态生成表单字段或类型安全的键值映射。
 */
type ObjToKeyValUnion<T> = {
  [K in keyof T]: { key: K; value: T[K] };
}[keyof T];

/**
 * ObjToKeyValArray<T>
 * 将对象类型 T 的每个属性转换为 [K, T[K]] 形式的元组联合类型。
 * 例如：如果 T = { a: string; b: number }，则结果为 ["a", string] | ["b", number]
 * 用途：当你需要将对象转换为键值对数组形式时，比如用于函数参数或数据结构转换。
 */
type ObjToKeyValArray<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];

/**
 * ObjToSelectedValueUnion<T>
 * 提取对象类型 T 中所有属性值的类型，形成一个联合类型。
 * 例如：如果 T = { a: string; b: number; c: boolean }，则结果为 string | number | boolean
 * 用途：当你只关心对象属性的值类型集合时，比如某个函数可以接受对象中任一属性的值作为参数。
 */
type ObjToSelectedValueUnion<T> = {
  [K in keyof T]: T[K];
}[keyof T];

/**
 * Optional<T, K extends keyof T>
 * 将对象类型 T 中指定的属性 K 变为可选属性，其他属性保持不变。
 * 例如：如果 T = { a: string; b: number; c: boolean }，K = "b" | "c"，则结果为 { a: string; b?: number; c?: boolean }
 * 用途：用于修改对象类型，使某些字段变为可选，常用于组件 props 或函数参数的类型扩展。
 */
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * GetOptional<T>
 * 从对象类型 T 中提取所有本身就是可选的属性，形成一个新的对象类型。
 * 例如：如果 T = { a: string; b?: number; c?: boolean }，则结果为 { b?: number; c?: boolean }
 * 用途：当你需要单独处理对象的可选字段时，比如构建校验函数或生成部分更新类型。
 */
type GetOptional<T> = {
  [P in keyof T as T[P] extends Required<T>[P] ? never : P]: T[P];
};
