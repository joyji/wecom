<template>
    <view :id="props.id" class="lc-wecom-app" :style="[containerStyle, props.configure?.style]">
        <!-- 空状态 -->
        <view v-if="!images.length" class="empty-state">
            <text class="empty-text">暂无图片</text>
        </view>

        <!-- 单张图片 -->
        <a
            v-else-if="images.length === 1"
            class="single-banner"
            :href="getItemHref(images[0])"
        >
            <image :src="images[0].src" mode="aspectFill" class="single-image" />
        </a>

        <!-- 多张图片轮播 -->
        <swiper
            v-else
            class="carousel"
            circular
            autoplay
            :interval="interval"
            :indicator-dots="indicatorDots"
            :indicator-active-color="indicatorActiveColor"
        >
            <swiper-item v-for="(img, index) in images" :key="index" class="swiper-item">
                <a class="swiper-item-inner" :href="getItemHref(img)">
                    <image :src="img.src" mode="aspectFill" class="carousel-image" />
                </a>
            </swiper-item>
        </swiper>
    </view>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
    id: { type: [String, Number], default: '' },
    data: { type: Object, default: () => ({}) },
    configure: { type: Object, default: () => ({}) },
    edit: { type: Boolean, default: false }
})

// 平台检测：企微 Windows 客户端 156px，移动端 148px
const checkIsWindows = () => {
    if (typeof navigator === 'undefined') return false
    return /WindowsWechat|Windows/i.test(navigator.userAgent || '')
}

const isWindows = ref(checkIsWindows())

const containerHeight = computed(() => (isWindows.value ? '156px' : '148px'))

const containerStyle = computed(() => ({
    height: containerHeight.value
}))

// 图片列表提取
const images = computed(() => {
    const raw = props.data?.images?.value
    if (Array.isArray(raw)) return raw
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    }
    return []
})

// 轮播配置属性
const indicatorDots = computed(() => props.data?.indicatorDots?.value ?? true)
const indicatorActiveColor = computed(() => props.data?.indicatorActiveColor?.value ?? '#1677ff')
const interval = computed(() => props.data?.interval?.value ?? 3000)

// 企微跳转链接：wxwork://openurl?url=xxx
const getItemHref = (img) => {
    const link = img?.link
    if (!link) return 'javascript:void(0)'
    return `wxwork://openurl?url=${encodeURIComponent(link)}`
}
</script>

<style scoped lang="scss">
.lc-wecom-app {
    width: 100%;
    overflow: hidden;
    border-radius: 0;
}

.empty-state {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-text {
    color: #999;
    font-size: 14px;
}

.single-banner {
    display: block;
    width: 100%;
    height: 100%;
}

.single-image {
    width: 100%;
    height: 100%;
}

.carousel {
    width: 100%;
    height: 100%;
}

.swiper-item-inner {
    display: block;
    width: 100%;
    height: 100%;
}

.carousel-image {
    width: 100%;
    height: 100%;
}
</style>
