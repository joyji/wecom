<template>
  <div class="container">
    <swiper
      class="swiper"
      :modules="modules"
      :initial-slide="currentIndex"
      @swiper="onSwiper"
      @slideChange="onSlideChange"
    >
      <swiper-slide v-for="(imgUrl, index) in imageList" :key="index">
        <div class="image-wrapper" :id="'image-wrapper-' + index">
          <img
            :src="imgUrl"
            class="preview-image"
            :ref="(el) => setImgRef(el, index)"
          />
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { ref, onMounted, onUpdated } from 'vue'
import AlloyFinger from 'alloyfinger'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Scrollbar, A11y, Zoom } from 'swiper/modules'

import 'swiper/swiper-bundle.css'

// ========== 数据定义 ==========
const imageList = ref([
      'https://mzy-outernet-stg.rosino.com/out/file/biz-mit-stg1/public/extracted/mit/20250815/4b2d0ba0601f426dab99ac57a29b0c6b.jpg',
      'https://mzy-outernet-stg.rosino.com/out/file/biz-mit-stg1/public/extracted/mit/20250815/4b2d0ba0601f426dab99ac57a29b0c6b.jpg',
      'https://mzy-outernet-stg.rosino.com/out/file/biz-mit-stg1/public/extracted/mit/20250815/4b2d0ba0601f426dab99ac57a29b0c6b.jpg'
    ])
const currentIndex = ref(0)
const imgRefs = ref([])

// ========== Swiper 配置 ==========
const modules = [Navigation, Pagination, Scrollbar, A11y, Zoom]

// ========== 获取 URL 参数 ==========
const getQueryParam = (param) => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(param)
}

// ========== 设置 ref ==========
const setImgRef = (el, index) => {
  imgRefs.value[index] = el
}

// ========== 初始化手势 ==========
const initAllGestures = () => {
  const wrapperEls = document.querySelectorAll('.image-wrapper')
  wrapperEls.forEach((wrapper, index) => {
    const imgEl = wrapper.querySelector('img')
    if (imgEl && !imgEl.dataset.gestureInit) {
      new AlloyFinger(wrapper, {
        pinch: (evt) => {
          imgEl.style.transform = `scale(${evt.scale})`
        },
        doubleTap: () => {
          imgEl.style.transform = imgEl.style.transform === 'scale(2)' ? 'scale(1)' : 'scale(2)'
        },
        tap: () => {
          closePreview()
        }
      })
      imgEl.dataset.gestureInit = 'true'
    }
  })
}

// ========== 关闭预览页 ==========
const closePreview = () => {
  window.history.back()
}

// ========== Swiper 初始化回调 ==========
const currentSwiper = ref(null)
const onSwiper = (swiper) => {
  currentSwiper.value = swiper
}
const onSlideChange = () => {
  console.log('当前 slide 索引:', currentSwiper.value.realIndex)
}

// ========== 生命周期 ==========
onMounted(() => {
  const images = getQueryParam('images')
  if (images) {
    try {
    //   imageList.value = JSON.parse(decodeURIComponent(images))|| [
    //   'https://mzy-outernet-stg.rosino.com/out/file/biz-mit-stg1/public/extracted/mit/20250815/4b2d0ba0601f426dab99ac57a29b0c6b.jpg',
    //   'https://mzy-outernet-stg.rosino.com/out/file/biz-mit-stg1/public/extracted/mit/20250815/4b2d0ba0601f426dab99ac57a29b0c6b.jpg',
    //   'https://mzy-outernet-stg.rosino.com/out/file/biz-mit-stg1/public/extracted/mit/20250815/4b2d0ba0601f426dab99ac57a29b0c6b.jpg'
    // ]
    } catch (e) {
      console.error('解析图片列表失败:', e)
    }
  }
  initAllGestures()
})

onUpdated(() => {
  initAllGestures()
})
</script>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
}

.swiper {
  width: 100%;
  height: 100%;
}

.image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.preview-image {
  width: 90%;
  height: 90%;
  object-fit: contain;
  transition: transform 0.3s ease;
}
</style>
