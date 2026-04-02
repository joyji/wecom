<template>
    <view class="template-page" :style="{ 'height': isWindows ? '156px' : '148px' }">
        <view class="content-wrap">
            <view v-if="bannerList.length === 0" class="empty-wrap">
                <text class="empty-text">暂无模板内容</text>
            </view>

            <a v-else-if="bannerList.length === 1" class="single-banner" :href="getBannerHref(bannerList[0])">
                <image class="banner-image" :src="bannerList[0].imageUrl" mode="aspectFill" />
            </a>

            <swiper v-else class="banner-swiper" circular autoplay :interval="3000" :duration="500" indicator-dots
                indicator-active-color="#1677ff">
                <swiper-item v-for="item in bannerList" :key="item.templateId" class="swiper-item">
                    <a class="swiper-item-inner" :href="getBannerHref(item)">
                        <image class="banner-image" :src="item.imageUrl" mode="aspectFill" />
                    </a>
                </swiper-item>
            </swiper>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'

const queryParams = ref({})
const isWindows = ref(false)
const bannerList = ref([])
const baseUrl = ref(import.meta.env.VITE_DOMAIN_URL)

onLoad((options) => {
    isWindows.value = navigator.userAgent.includes('WindowsWechat')
    syncQueryParams(options)
    bannerList.value = getWorkbenchBanners()
})

onShow(() => {
    isWindows.value = navigator.userAgent.includes('WindowsWechat')
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    syncQueryParams(currentPage?.$page?.options)
    bannerList.value = getWorkbenchBanners()
})

const syncQueryParams = (options = {}) => {
    const next = {}
    Object.keys(options || {}).forEach((key) => {
        next[key] = String(options[key])
    })
    queryParams.value = next
}

// 后续可替换为 PC 配置接口返回数据
const getWorkbenchBanners = () => {
    const group = queryParams.value?.group || 'multi'
    if (group === 'single') {
        return [
            {
                templateId: 'announcement',
                imageUrl: 'https://mzy-outernet-stg.rosino.com/out/file/biz-mit-stg3/public/20260330/c75b4a166858479d9c40b7a2aff25819.jpg',
                detailLink: '/pages/template/detail?templateId=announcement'
            }
        ]
    }

    return [
        {
            templateId: 'announcement',
            imageUrl: '/static/image/zy-workbench/template/banner-1.png',
            detailLink: '/pages/template/detail?templateId=announcement'
        },
        {
            templateId: 'policy',
            imageUrl: '/static/image/zy-workbench/template/banner-2.png',
            detailLink: '/pages/template/detail?templateId=policy'
        },
        {
            templateId: 'activity',
            imageUrl: '/static/image/zy-workbench/template/banner-3.png',
            detailLink: '/pages/template/detail?templateId=activity'
        }
    ]
}

const getBannerHref = (item) => {
    if (!item) {
        return ''
    }
    const targetUrl = buildDetailUrl(item)
    return `wxwork://openurl?url=${encodeURIComponent(`${baseUrl.value}/#${targetUrl}`)}`
}

const buildDetailUrl = (item) => {
    const baseLink = item.detailLink || '/pages/template/detail'
    const [path, search = ''] = baseLink.split('?')
    const searchParams = new URLSearchParams(search)

    if (!searchParams.get('templateId') && item.templateId) {
        searchParams.set('templateId', item.templateId)
    }
    if (item.detailLink) {
        searchParams.set('link', encodeURIComponent(item.detailLink))
    }

    const query = searchParams.toString()
    return query ? `${path}?${query}` : path
}
</script>

<style scoped lang="scss">
page {
    margin: 0;
}

html,
body {
    height: 100%;
    margin: 0;
    padding: 0;
}

.template-page {
    width: 100%;
    background-color: #ffffff;
    overflow: hidden;
}

.content-wrap {
    width: 100%;
    height: 100%;
}

.empty-wrap {
    height: 100%;
    border-radius: 12px;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-text {
    color: #999999;
    font-size: 14px;
}

.single-banner,
.swiper-item-inner {
    width: 100%;
    height: 100%;
    display: block;
    overflow: hidden;
    background: #ffffff;
}

.banner-swiper {
    width: 100%;
    height: 100%;
}

.swiper-item {
    width: 100%;
    height: 100%;
    padding: 0;
    box-sizing: border-box;
}

.banner-image {
    width: 100%;
    height: 100%;
    display: block;
}

.banner-bg {
    width: 100%;
    height: 100%;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}
</style>
