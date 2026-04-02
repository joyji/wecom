import request from '@/config/axios'

export interface UserVO {
  userId: string
  roleIds: string[]
}

/**
 * 获取用户详情列表
 * @param params
 * @returns
 */
export const getUserList = (data: UserVO) => {
  return request.post({ url: '/msg/flow/flow-cost-page', data })
}
export const flowExport = (params: any) => {
  return request.download({ url: '/msg/flow/export', params })
}
