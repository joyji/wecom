import { data } from '@/mock/mini'

// 用户相关API
export const getUserList = (params: any) => {
  // 模拟用户列表
  const mockUsers = [
    {
      ...data.user,
      roles: data.roles.slice(0, 3) // 只展示前3个角色作为示例
    }
  ]
  
  // 根据查询条件过滤
  let filteredUsers = [...mockUsers]
  if (params.username) {
    filteredUsers = filteredUsers.filter(user => 
      user.username.includes(params.username)
    )
  }
  if (params.accountId) {
    filteredUsers = filteredUsers.filter(user => 
      user.accountId.includes(params.accountId)
    )
  }
  
  return {
    code: 0,
    data: {
      list: filteredUsers,
      total: filteredUsers.length
    },
    msg: 'success'
  }
}

export const assignUserRole = (userId: number, roleIds: string[]) => {
  return {
    code: 0,
    data: true,
    msg: 'success'
  }
}

// 角色相关API
export const getRoleList = () => {
  // 模拟角色列表
  const mockRoles = data.roles.map((role, index) => ({
    id: index + 1,
    name: role,
    createTime: '2023-01-01 00:00:00',
    description: `${role}的描述信息`
  }))
  
  return {
    code: 0,
    data: {
      list: mockRoles,
      total: mockRoles.length
    },
    msg: 'success'
  }
}

export const createRole = (role: any) => {
  return {
    code: 0,
    data: {
      ...role,
      id: Date.now(),
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    },
    msg: 'success'
  }
}

export const updateRole = (role: any) => {
  return {
    code: 0,
    data: true,
    msg: 'success'
  }
}

export const deleteRole = (id: number) => {
  return {
    code: 0,
    data: true,
    msg: 'success'
  }
}

export const getRoleMenuIds = (roleId: number) => {
  // 随机生成一些菜单ID
  const randomMenus = [1, 3, 6]
  
  return {
    code: 0,
    data: randomMenus,
    msg: 'success'
  }
}

export const assignRoleMenu = (roleId: number, menuIds: number[]) => {
  return {
    code: 0,
    data: true,
    msg: 'success'
  }
}

// 菜单相关API
export const getMenuList = () => {
  return {
    code: 0,
    data: data.menus || [],
    msg: 'success'
  }
}

export const createMenu = (menu: any) => {
  return {
    code: 0,
    data: {
      ...menu,
      id: Date.now()
    },
    msg: 'success'
  }
}

export const updateMenu = (menu: any) => {
  return {
    code: 0,
    data: true,
    msg: 'success'
  }
}

export const deleteMenu = (id: number) => {
  return {
    code: 0,
    data: true,
    msg: 'success'
  }
} 