<!-- components/PdfViewer.vue -->
<template>
  <div class="pdf-viewer">
    <div v-if="loading" class="pdf-toast">文件加载中...</div>
    <div v-if="error" style="color: red;">⚠️ {{ error }}</div>
    <div class="pdf-canvas-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as pdfjsLib from 'pdfjs-dist';

// 使用本地 worker（推荐）
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const props = defineProps({
  src: String // PDF 文件 URL
});

const loading = ref(false);
const error = ref('');
let pdfDoc = null;
let pageNum = 1;
let resizeTimer = null;
let restoreViewport = null;

const renderPage = async (num) => {
  const container = document.querySelector('.pdf-canvas-container');
  if (!pdfDoc || !container) return;

  try {
    const page = await pdfDoc.getPage(num);

    // 获取容器宽度（响应式）
    const containerWidth = container.clientWidth || window.innerWidth - 20;

    // 设备像素比（高清屏支持）
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // 最大支持 2x，避免内存溢出

    // 计算缩放：按容器宽度等比缩放
    const viewport = page.getViewport({ scale: 1 });
    const scale = containerWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    // 创建 canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // 设置实际绘制分辨率（高清）
    canvas.width = scaledViewport.width * dpr;
    canvas.height = scaledViewport.height * dpr;

    // 设置显示尺寸（CSS）
    canvas.style.width = `${scaledViewport.width}px`;
    canvas.style.height = `${scaledViewport.height}px`;
    canvas.style.marginBottom = '10px';
    canvas.style.display = 'block';
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';

    // 缩放上下文（自动适应 DPR）
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    // ❗ 关键：禁止图像平滑插值（防模糊）
    context.imageSmoothingEnabled = false;
    // context.imageSmoothingQuality = 'high'; // 可选，性能较低

    // 渲染页面（使用 screen intent 提升文本清晰度）
    await page.render({
      canvasContext: context,
      viewport: scaledViewport,
      intent: 'screen', // 专为屏幕显示优化的文字渲染
      renderInteractiveForms: false,
    }).promise;

    container.appendChild(canvas);

    // 继续加载下一页
    if (pageNum < pdfDoc.numPages) {
      pageNum++;
      renderPage(pageNum);
    }
  } catch (err) {
    console.error(`页面 ${num} 渲染失败`, err);
    error.value = `第${num}页加载失败`;
  }
};

// 动态设置 viewport（适配安全区和缩放）
function updateViewportForPDF() {
  let coverSupport = false;
  if (window.CSS && typeof window.CSS.supports === 'function') {
    coverSupport =
      window.CSS.supports('top: env(safe-area-inset-top)') ||
      window.CSS.supports('top: constant(safe-area-inset-top)');
  }

  const meta = document.querySelector('meta[name="viewport"]');
  if (!meta) return;

  // 保存原始 viewport
  if (!meta.dataset.originalContent) {
    meta.dataset.originalContent = meta.content;
  }

  // 允许最大放大到 10 倍，便于查看细节
  const newContent = `width=device-width, initial-scale=1.0, maximum-scale=10.0, minimum-scale=0.5, user-scalable=yes${coverSupport ? ', viewport-fit=cover' : ''}`;
  meta.setAttribute('content', newContent);

  return () => {
    // 恢复原始 viewport
    if (meta.dataset.originalContent) {
      meta.setAttribute('content', meta.dataset.originalContent);
    }
  };
}
const loadPdf = async () => {
  if (!props.src) return;

  loading.value = true;
  error.value = '';

  try {
    const url = decodeURIComponent(props.src.trim());
    const res = await fetch(url, {
      credentials: 'omit' // 不发送 cookie
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const arrayBuffer = await res.arrayBuffer();
    const uintArray = new Uint8Array(arrayBuffer, 0, 4);

    // 检查是否为 PDF (%PDF)
    if (!(uintArray[0] === 0x25 && uintArray[1] === 0x50 && uintArray[2] === 0x44 && uintArray[3] === 0x46)) {
      throw new Error('不是有效的 PDF 文件');
    }

    // 加载 PDF 文档
    pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    pageNum = 1;

    // 清空旧内容并开始渲染
    const container = document.querySelector('.pdf-canvas-container');
    if (container) container.innerHTML = '';
    renderPage(pageNum);

  } catch (err) {
    console.error('PDF 加载失败:', err);
    error.value =
      err.message.includes('网络') || err.message.includes('HTTP')
        ? '网络异常'
        : err.message.includes('有效')
          ? '文件格式错误'
          : '加载失败';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  restoreViewport = updateViewportForPDF();

  // 监听窗口变化（如横竖屏切换），重新渲染
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const container = document.querySelector('.pdf-canvas-container');
      if (container) container.innerHTML = '';
      if (pdfDoc) {
        pageNum = 1;
        renderPage(1);
      }
    }, 300);
  });
});

onUnmounted(() => {
  if (restoreViewport) restoreViewport();
  clearTimeout(resizeTimer);
});

// 监听 src 变化重新加载
watch(() => props.src, loadPdf, { immediate: true });
</script>

<style scoped>
.pdf-canvas-container {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  box-sizing: border-box;
}

.pdf-canvas-container canvas {
  max-width: 100% !important;
  height: auto !important;
  display: block;
  margin: 0 auto;

  /* 强制清晰渲染，防止模糊 */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
  -ms-interpolation-mode: nearest-neighbor;
}

.pdf-viewer {
  position: relative;
  overflow-y: auto;
  height: 100vh !important;
  touch-action: pinch-zoom; /* 允许双指缩放 */
}

.pdf-toast {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 14px 24px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 16px;
  border-radius: 8px;
  z-index: 200;
  pointer-events: none;
  text-align: center;
}
</style>
