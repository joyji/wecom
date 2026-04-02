import request from '@/config/axios'

export interface MenuVO {
  id?: number
  parentId: number
  name: number | string
  permission: number | string
  type: number | string
  sort: number | string
  path: number | string
  icon: number | string
  component: number | string | null
  componentName?: number | string | null
  status: number | string
  visible: boolean
  keepAlive: boolean
  alwaysShow?: boolean
  createTime: Date
}

// 查询菜单列表
export const getMenuList = (params) => {
  return request.get({ url: '/wecom/menu/page', params })
}

// 新增菜单
export const createMenu = (data: MenuVO) => {
  return request.post({ url: '/wecom/menu/create', data })
}

// 修改菜单
export const updateMenu = (data: MenuVO) => {
  return request.put({ url: '/wecom/menu/update', data })
}

// 删除菜单
export const deleteMenu = (id: number | string) => {
  return request.delete({ url: '/wecom/menu/delete?id=' + id })
}
