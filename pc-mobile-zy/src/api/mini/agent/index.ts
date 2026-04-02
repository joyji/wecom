import request from '@/config/axios'

export interface UserVO {
  userId?: string
  agentId?: string
  url?: string
  enableWebviewClick?: boolean
  roleIds?: string[]
}

export interface MenuVO {
  id?: string
  agentId: string
  name: string
  icon?: string | undefined
  description: string
  allow_userinfos?:
    | {
        user: {
          userid: string
        }[]
      }
    | undefined
  allow_partys?:
    | {
        partyid: number[]
      }
    | undefined
  status: number
  redirectDomain?: string | undefined
  homeUrl?: string | undefined
}

/**
 * 获取用户详情列表
 * @param params
 * @returns
 */
export const getApplicationList = (params: PageParam) => {
  return request.get({ url: '/wecom/application/page', params })
}

export const getInfoApplicationList = (id: number | string) => {
  return request.get({ url: '/wecom/application/getInfo?id=' + id })
}

// 新增应用
export const createMenu = (data: MenuVO) => {
  return request.post({ url: '/wecom/application/create', data })
}

// 修改应用
export const updateMenu = (data: MenuVO) => {
  return request.put({ url: '/wecom/application/update', data })
}

// 删除菜单
export const deleteMenu = (id: number | string) => {
  return request.delete({ url: '/wecom/application/delete?id=' + id })
}

/**
 * 获取角色精简信息列表
 * @param  {pageSize:'',pageNo:''}
 * @returns
 */
export const getUserlistAllSimple = (params: PageParam) => {
  return request.get({ url: '/wecom/role/list-all-simple', params })
}

/**
 * 获得用户拥有的角色编号列表
 * @param {oneId}
 * @returns
 */
export const getUserlistSserRoles = (params: PageParam) => {
  return request.get({ url: '/wecom/permission/list-user-roles', params })
}

/**
 * 赋予用户角色
 * @param {"userId": 2149529877794007330,
 *    "roleIds": [
 *        10,
 *       9
 *   ]}
 * @returns
 */
export const getPermissionUserRoles = (data: UserVO) => {
  return request.post({ url: '/wecom/permission/assign-user-role', data })
}

/**
 * 获取工作台数据
 * @param {
 *    userId
 *    agentId
 *   }
 * @returns
 */
export const getWorkbenchDataByAgentId = (params: PageParamT) => {
  return request.get({ url: '/wecom/application/getWorkbenchDataByAgentId', params })
}

/**
 * 批量设置工作台数据
 * @param
 * {
 *   "agentId": "",
 *   "userId": "",
 *   "url": "",
 *   "enableWebviewClick": true,
 *   "jumpUrl": "",
 *   "pagePath": "",
 *   "userIdList": []
 * }
 * @returns
 */
export const batchSave = (data: UserVO) => {
  return request.post({ url: '/wecom/application/batchSave', data })
}
/**
 * 设置工作台数据
 * @param
 * {
 *   "agentId": "",
 *   "userId": "",
 *   "url": "",
 *   "enableWebviewClick": true,
 *   "jumpUrl": "",
 *   "pagePath": "",
 *   "userIdList": []
 * }
 * @returns
 */
export const applicationSave = (data: UserVO) => {
  return request.post({ url: '/wecom/application/save', data })
}
