<!--
 * @Description: 
 * @version: 1.0.0
 * @Author: jiying
 * @Date: 2025-06-16 17:52:02
 * @LastEditors: jiying
 * @LastEditTime: 2025-09-29 11:11:28
-->
<template>
    <view class="login-container" :style="isLandscape ? { overflow: 'hidden' } : {}">
        <image
              src="/static/image/zy-workbench/login.gif"
              mode="widthFix"
              class="login-img"
              alt="Scan"
              :style="
        isLandscape ? { position: 'absolute', transform: 'translateY(10%)', overflow: 'hidden', margingTop: '0' } : {}
      "
            />
            <view v-if="isTransition == 1 && isPhone" :style="isLandscape ? { bottom: '8%' } : isTablet ? { bottom: '33%' } : {}" class="login-text">跳转中...</view>
            <template v-else>
                <view v-show="showFirstText" :style="isLandscape ? { bottom: '8%' } : isTablet ? { bottom: '33%' } : {}" class="login-text">跳转中...</view>
                <view v-show="!showFirstText" :style="isLandscape ? { bottom: '8%' } : isTablet ? { bottom: '33%' } : {}" class="login-text">跳转中...</view>
            </template>
    </view>
</template>

<script setup>
import wwsdk from '@/utils/wwsdk'
import { onMounted, ref, getCurrentInstance } from 'vue'
import { onLoad,onShow } from '@dcloudio/uni-app';
const { proxy } = getCurrentInstance()

const showFirstText = ref(true)
const isLandscape = ref(false)
const isPhone = ref()
const isTablet = ref(false)
const isTransition = ref()
const path = ref('')
const endTime = ref('')

const checkOrientation = () => {
  const systemInfo = uni.getSystemInfoSync()
  const { windowWidth, windowHeight } = systemInfo
  console.log("🚀 ~ checkOrientation ~ windowWidth:", windowWidth)
  console.log("🚀 ~ checkOrientation ~ windowHeight:", windowHeight)
  isLandscape.value = windowWidth > windowHeight
}
onLoad((options) => {
  checkOrientation()

    console.log('页面加载完成', navigator.userAgent)
    isPhone.value = (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') ) ? true : false
    isTablet.value = navigator.userAgent.includes('iPad')  ? true : false
    path.value = options.path || ''
    endTime.value = options.endTime || ''
});
onMounted(async () => {
    // 初始化企业微信SDK
    console.log('onMounted---', path.value)
    const agentId = import.meta.env.VITE_AGENT_ID
    const jumpTime = Date.now()
    console.log("🚀 ~ onMounted ~ jumpTime:", jumpTime)
    await wwsdk.wwConfig('ww6c12cd389a083f32', agentId)
    
    const params = {
      appid: import.meta.env.VITE_MINI_ID,
      path: endTime.value ? `${path.value}&endTime=${endTime.value}&jumpTime=${jumpTime}` : `${path.value}&jumpTime=${jumpTime}`,//'pages/tabbar/market/market',
    }

    triggerEvent('$webTransition', '业务中心H5过渡',  {
      path: path.value,
      params: params
    })

    const res = await wwsdk.ww.launchMiniprogram(params)

    console.log('launchMiniprogram res', res)
    triggerEvent('$webTransitionRes', '业务中心H5响应', res)
    setTimeout(()=>{ 
        wwsdk.ww.closeWindow()
    }, 1000)
    // wwsdk.ww.closeWindow() // 关闭当前窗口

    // 设置定时器切换文本
    // setInterval(() => {
    //     showFirstText.value = !showFirstText.value
    // }, 2000) // 每2秒切换一次
})

onShow(() => {
    console.log('过渡页面显示show-1111111', proxy.$global.isTransition)
    isTransition.value = proxy.$global.isTransition
    if (isPhone.value) {
        if (proxy.$global.isTransition) { // 检查全局变量的值
            console.log('isTransition为true，执行关闭窗口操作')
            proxy.$global.isTransition -= 1
            wwsdk.ww.closeWindow() // 执行关闭窗口操作
        } else {
            proxy.$global.isTransition += 1
            console.log('isTransition为false，不执行关闭窗口操作')
        }
    }
})

</script>

<style scoped lang="scss">
page {
    background-color: #f0f7ff;
}
.login-container {
  height: 100vh;
  position: relative;
  width: 100vw;
  min-width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  background-color: #f0f7ff;
  overflow: visible; // 允许内容溢出
}

.login-img {
  width: 100vw;
  height: auto;
  display: block;
  margin-top: -30%;
  padding: 0;
  object-fit: none;
}

.login-text {
     font-size: 18px;
    color: #333333;
  position: absolute;
  bottom: 36%;
  z-index: 999;
}
</style>