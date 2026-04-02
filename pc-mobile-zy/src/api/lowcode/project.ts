/**
 * 低代码页面配置 - API
 */
import request from '@/config/axios'

// 获取项目分页列表
export const getProjectList = (params?: any) => {
  return request.get({ url: '/system/lc-project/page', params: params || { pageNo: 1, pageSize: 100 } })
}

// 获取项目详情（含所有页面）
export const getProject = (projectKey: string) => {
  return request.get({ url: '/system/lc-project/get?projectKey=' + projectKey })
}

// 创建项目
export const createProject = (data: { name: string; description?: string }) => {
  return request.post({ url: '/system/lc-project/create', data })
}

// 全量保存（项目信息 + 所有页面内容），返回完整详情含新生成的 pageKey
export const saveProject = (data: any) => {
  return request.post({ url: '/system/lc-project/save-full', data })
}

// 发布项目
export const publishProject = (projectKey: string) => {
  return request.post({ url: '/system/lc-project/publish?projectKey=' + projectKey })
}

// 删除项目
export const deleteProject = (projectKey: string) => {
  return request.delete({ url: '/system/lc-project/delete?projectKey=' + projectKey })
}
