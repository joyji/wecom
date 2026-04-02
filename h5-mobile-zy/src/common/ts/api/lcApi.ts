/*
 * @Description: 
 * @version: 1.0.0
 * @Author: jiying
 * @Date: 2026-03-31 11:26:39
 * @LastEditors: jiying
 * @LastEditTime: 2026-04-01 15:51:45
 */
/**
 * 低代码页面配置 API
 */
import httpRequest from '../http/index'

/**
 * 获取已发布的低代码页面渲染数据
 * @param projectKey 项目Key
 * @param pageKey 页面Key
 * @param platform 平台类型: 'mobile' | 'pc'
 */
export const getPublishedPageRender = (projectKey, pageKey, platform = 'mobile') => {
  return httpRequest({
    url: 'app-api/system/lc-page/render',
    method: 'GET',
    body: { projectKey, pageKey, platform }
  })
}

/**
 * 获取草稿低代码页面渲染数据（预览用）
 * @param projectKey 项目Key
 * @param pageKey 页面Key
 * @param platform 平台类型: 'mobile' | 'pc'
 */
export const getDraftPageRender = (projectKey, pageKey, platform = 'mobile') => {
  return httpRequest({
    url: 'app-api/system/lc-page/draft-render',
    method: 'GET',
    body: { projectKey, pageKey, platform }
  })
}
