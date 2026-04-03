<template>
    <view class="template-detail-page" :style="pageStyle">
        <view class="content-wrap">
            <view v-if="loading" class="state-wrap">
                <text class="state-text">加载中...</text>
            </view>

            <view v-else-if="!templateConfig" class="state-wrap">
                <text class="state-text">页面内容不存在或已失效</text>
            </view>

            <!-- 低代码组件渲染 -->
            <view v-else class="lowcode-render">
                <!-- <view class="page-title" v-if="templateConfig.title">{{ templateConfig.title }}</view> -->
                <view v-for="item in templateConfig.componentList" :key="item.id" class="lc-component-block">
                    <component :is="lcComponents[item.componentName]" v-if="lcComponents[item.componentName]"
                        :id="item.id" :data="item.propsMap" :configure="item.configure || {}"
                        :children="item.children" />
                </view>
            </view>


        </view>
    </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { components as lcComponents } from '@/components/lowcode-render/index.js'
import { getPublishedPageRender, getDraftPageRender } from '@/common/ts/api/lcApi'

const queryParams = ref({})
const loading = ref(false)
const templateConfig = ref(null)
const isWindows = ref(false)



// 页面动态样式（从页面 configure 读取背景色、高度等配置）
const pageStyle = computed(() => {
    const configure = templateConfig.value?.configure
    if (!configure) return {}
    const style = {}
    if (configure.backgroundColor) {
        style['background-color'] = configure.backgroundColor
    }
    if (configure.heightMode === 'fixed' && configure.height) {
        style['min-height'] = configure.height + 'px'
    }
    return style
})



onLoad((options) => {
    isWindows.value = checkIsWindowsClient()
    syncQueryParams(options)
    loadTemplateConfig()
})

onShow(() => {
    isWindows.value = checkIsWindowsClient()
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    syncQueryParams(currentPage?.$page?.options)
    loadTemplateConfig()
})

const syncQueryParams = (options = {}) => {
    const next = {}
    Object.keys(options || {}).forEach((key) => {
        next[key] = String(options[key])
    })
    queryParams.value = next
}

const getTemplateIdFromQuery = () => {
    const templateId = queryParams.value?.templateId
    if (templateId) {
        return decodeURIComponent(templateId)
    }

    const link = queryParams.value?.link
    if (!link) {
        return ''
    }

    try {
        const decodedLink = decodeURIComponent(link)
        const search = decodedLink.split('?')[1] || ''
        const searchParams = new URLSearchParams(search)
        return searchParams.get('templateId') || ''
    } catch (error) {
        return ''
    }
}

// 加载页面配置：优先使用低代码 API（projectKey + pageKey），兼容旧 mock（templateId）
const loadTemplateConfig = async () => {
    loading.value = true

    // 低代码项目页面：通过 projectKey + pageKey 调用后端渲染接口
    const projectKey = queryParams.value?.projectKey
    const pageKey = queryParams.value?.pageKey
    if (projectKey && pageKey) {
        try {
            const platform = isWindows.value ? 'pc' : 'mobile'
            const isPreview = queryParams.value?.preview === '1'
            const apiFn = isPreview ? getDraftPageRender : getPublishedPageRender
            const res = await apiFn(projectKey, pageKey, platform)
            if (res && res.data) {
                templateConfig.value = {
                    title: res.data.name,
                    componentList: res.data.componentList || [],
                    configure: res.data.configure || {}
                }
                document.title = res.data.name
            } else {
                templateConfig.value = null
            }
        } catch (e) {
            console.error('加载低代码页面失败', e)
            templateConfig.value = null
        }
        loading.value = false
        return
    }

    // 非低代码模式，无数据
    templateConfig.value = null
    loading.value = false
}

const checkIsWindowsClient = () => {
    if (typeof navigator === 'undefined') {
        return false
    }
    const userAgent = navigator.userAgent || ''
    return /WindowsWechat|Windows/i.test(userAgent)
}



const openInnerPage = (url) => {
    if (!url) {
        return
    }

    uni.navigateTo({
        url,
        fail: () => {
            uni.redirectTo({
                url
            })
        }
    })
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

.template-detail-page {
    width: 100%;
    background-color: transparent
}

.content-wrap {
    width: 100%;
    margin: 0 auto;
}

.state-wrap {
    min-height: 220px;
    border-radius: 12px;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
}

.state-text {
    color: #999999;
    font-size: 14px;
}

.page-title {
    font-size: 20px;
    color: #222222;
    font-weight: 600;
}

.lowcode-render .lc-component-block {
    width: 100%;
}
</style>
