/*
  需求：给元素添加背景水印。

  思路：
    1、使用 canvas 绘制水印文字，并生成 base64 图片。
    2、将生成的图片设置为元素的 background-image。
    3、通过透明度和倾斜角度，让水印显示在页面背景中。

  使用示例：
    <div v-waterMarker="{ text: '版权所有', textColor: 'rgba(180, 180, 180, 0.4)' }"></div>
*/

import type { Directive } from "vue";

/**
 * 创建 canvas 水印并设置到目标元素的背景上。
 *
 * @param text - 水印显示文本
 * @param parentNode - 需要添加水印背景的元素
 * @param font - 水印文字样式，默认 "16px Microsoft JhengHei"
 * @param textColor - 水印颜色，默认 "rgba(180, 180, 180, 0.3)"
 */
const addWaterMarker = (text: string, parentNode: HTMLElement, font?: string, textColor?: string) => {
  // 1. 创建 canvas 元素，用于绘制水印图片
  const canvas: HTMLCanvasElement = document.createElement("canvas");
  parentNode.appendChild(canvas);

  // 2. 设置 canvas 大小，决定水印图片的重复间距
  canvas.width = 205;
  canvas.height = 140;
  canvas.style.display = "none";

  // 3. 获取 2D 绘图上下文，并绘制水印文字
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  context.rotate((-20 * Math.PI) / 180); // 使文本倾斜，增强水印效果
  context.font = font || "16px Microsoft JhengHei"; // 如果没有传入字体，使用默认字体
  context.fillStyle = textColor || "rgba(180, 180, 180, 0.3)"; // 默认半透明灰色
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 10, canvas.height / 2);

  // 4. 将 canvas 图片转换成 base64 URL，并设置为元素背景图
  parentNode.style.backgroundImage = `url(${canvas.toDataURL("image/png")})`;
};

const waterMarker: Directive = {
  mounted(el, binding) {
    // mounted 钩子在指令首次绑定到元素上时执行
    // binding.value 中保存了 v-waterMarker 传入的配置对象
    addWaterMarker(binding.value.text, el as HTMLElement, binding.value.font, binding.value.textColor);
  }
};

export default waterMarker;
