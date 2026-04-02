import request from '@/config/axios'

export interface UserVO {
  id?: string
  name?: string
  code?: string
  menuIds?: number[]
  roleId?: string
}

/**
 * 获取用户详情列表
 * @param params
 * @returns
 */
export const getRoleList = (params: PageParam) => {
  return request.get({ url: '/wecom/role/page', params })
}

/**
 * 新增角色
 * @param {name:'后端开发',code:'java'}
 * @returns
 */
export const addRoleCreate = (data: UserVO) => {
  return request.post({ url: '/wecom/role/create', data })
}

/**
 * 修改角色
 * @param {name:'后端开发',code:'java',id:'id'}
 * @returns
 */
export const addRoleUpdate = (data: UserVO) => {
  return request.put({ url: '/wecom/role/update', data })
}

/**
 * 删除角色
 * @param {id:'id'}
 * @returns
 */
export const addRoleDelete = async (id: number) => {
  return await request.delete({ url: `/wecom/role/delete?id=` + id })
}

/**
 * 获取权限信息列表
 * @param  {pageSize:'',pageNo:''}
 * @returns
 */
export const getUserlistAllSimple = () => {
  return request.get({ url: '/wecom/menu/simple-list' })
}
/**
 * 获取权限信息列表
 * @param  {pageSize:'',pageNo:''}
 * @returns
 */
export const getUserlistRoleSimple = (id: number) => {
  return request.get({ url: `/wecom/permission/list-role-menus?roleId=` + id })
}
export const addAssignRoleMenu = (data: UserVO) => {
  return request.post({ url: 'wecom/permission/assign-role-menu', data })
}
