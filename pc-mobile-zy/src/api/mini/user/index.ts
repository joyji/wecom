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
export const getUserList = (params: PageParam) => {
  return request.get({ url: '/wecom/user/page', params })
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
