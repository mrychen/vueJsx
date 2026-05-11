// 这个文件用于扩展全局类型定义，告诉 TypeScript 浏览器环境中 Navigator 对象还包含额外的属性。

declare global {
  interface Navigator {
    /**
     * Internet Explorer / Edge 旧版本提供的方法，用于直接保存 Blob 数据为文件或打开文件下载对话框。
     * 这个函数并不是所有浏览器都支持，因此在代码中使用时需要先做兼容性判断。
     */
    msSaveOrOpenBlob: (blob: Blob, fileName: string) => void;

    /**
     * 某些老旧浏览器或国际化 API 中可能存在的浏览器语言字段。
     * 这个字段不是标准 Navigator 属性，通常为扩展字段，用于兼容老版本浏览器。
     */
    browserLanguage: string;
  }
}

// 确保这个文件被视为模块，否则 TypeScript 不会将其全局声明合并到项目中。
export { };