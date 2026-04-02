import router from './router'
import type { RouteRecordRaw } from 'vue-router'
import { isRelogin } from '@/config/axios/service'
import { getAccessToken } from '@/utils/auth'
import { useTitle } from '@/hooks/web/useTitle'
import { useNProgress } from '@/hooks/web/useNProgress'
import { usePageLoading } from '@/hooks/web/usePageLoading'
import { useDictStoreWithOut } from '@/store/modules/dict'
import { useUserStoreWithOut } from '@/store/modules/user'
import { usePermissionStoreWithOut } from '@/store/modules/permission'
import { goOneIDLogin, isRedirectOneid } from '@/utils/oneID'
import { getUrlValue } from '@/utils/index'
import * as OAuth2Api from '@/api/login/oauth2'
import * as authUtil from '@/utils/auth'
import { isUrl } from '@/utils/is'

const { start, done } = useNProgress()

const { loadStart, loadDone } = usePageLoading()

const parseURL = (
  url: string | null | undefined
): { basePath: string; paramsObject: { [key: string]: string } } => {
  // 如果输入为 null 或 undefined，返回空字符串和空对象
  if (url == null) {
    return { basePath: '', paramsObject: {} }
  }

  // 找到问号 (?) 的位置，它之前是基础路径，之后是查询参数
  const questionMarkIndex = url.indexOf('?')
  let basePath = url
  const paramsObject: { [key: string]: string } = {}

  // 如果找到了问号，说明有查询参数
  if (questionMarkIndex !== -1) {
    // 获取 basePath
    basePath = url.substring(0, questionMarkIndex)

    // 从 URL 中获取查询字符串部分
    const queryString = url.substring(questionMarkIndex + 1)

    // 使用 URLSearchParams 遍历参数
    const searchParams = new URLSearchParams(queryString)
    searchParams.forEach((value, key) => {
      // 封装进 paramsObject 对象
      paramsObject[key] = value
    })
  }

  // 返回 basePath 和 paramsObject
    return { basePath, paramsObject }
}

// 路由不重定向白名单
const whiteList = [
  '/login',
  '/social-login',
  '/auth-redirect',
  '/bind',
  '/register',
  '/oauthLogin/gitee',
  '/lowcode/project',
  '/lowcode/editor',
  // '/index'
]

const isWhiteListedPath = (path: string) => {
  if (whiteList.includes(path)) {
    return true
  }
  // 兼容动态路由: /lowcode/editor/:projectKey
  return path.startsWith('/lowcode/editor/')
}

// 路由加载前
router.beforeEach(async (to, from, next) => {
  start()
  loadStart()
  if (getAccessToken()) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      // 获取所有字典
      const dictStore = useDictStoreWithOut()
      const userStore = useUserStoreWithOut()
      const permissionStore = usePermissionStoreWithOut()
      if (!dictStore.getIsSetDict) {
        await dictStore.setDictMap()
      }
      if (!userStore.getIsSetUser) {
        isRelogin.show = true
        await userStore.setUserInfoAction()
        isRelogin.show = false
        // 后端过滤菜单
        await permissionStore.generateRoutes()
        permissionStore.getAddRouters.forEach((route) => {
          router.addRoute(route as unknown as RouteRecordRaw) // 动态添加可访问路由表
        })
        const redirectPath = from.query.redirect || to.query.redirect || to.path
        // 修复跳转时不带参数的问题
        const redirect = decodeURIComponent(redirectPath as string)
        const { paramsObject: query } = parseURL(redirect)
        const nextData = to.path === redirect ? { ...to, replace: true } : { path: redirect, query }
        if (redirect.includes('effi') || redirect.includes('8089')) {
          // fixed: effi系统跳转问题
          if (isUrl(redirect)) {
            const roles = userStore.getRoles
            // 替换已存在的token参数值
            const url = new URL(redirect)
            url.searchParams.set('token', getAccessToken() || '')
            // 判断roles是否包含 'effi_admin', 如果包含则增加role参数
            if (roles.includes('effi_admin')) {
              // 替换已存在的role参数值
              url.searchParams.set('role', 'effi_admin')
            }
            window.location.href = url.toString()
          }
        } else {
          next(nextData)
        }
      } else {
        next()
      }
    }
  } else {
    if (isWhiteListedPath(to.path)) {
      next()
    } else {
      // 注释OneID逻辑，待接入时再调试
      //next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
      const { MODE } = import.meta.env
      console.log('当前环境：', MODE)
      // 20250116临时注释，环境不接入OneID
      if (MODE === 'stg1' || MODE === 'env.local' || MODE === 'dev') {
        next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
      } else {
        // oneID登录
        const clientId = import.meta.env.VITE_ONEID_clientID
        if (isRedirectOneid()) {
          const code = getUrlValue('code')
          const redirectUri = location.origin
          // 通过上一步应用系统在其callback地址中获取IAM传来的code,通过API并获取用户信息。
          const data = await OAuth2Api.getOneIdAccessToken(clientId, code, redirectUri)
          console.log('获取到的OneID数据：', data)
          authUtil.setOneIdToken(data, code)
          // 通过token获取用户信息
          /*  const profile = await OAuth2Api.getOneIdProfile(getAccessToken())
           userStore.setUserBase(profile)*/
          //authUtil.setToken(profile)
          console.log('获取到的OneID用户信息：', redirectUri)
          window.location.href = redirectUri
        } else {
          goOneIDLogin({
            oneIDUrl: import.meta.env.VITE_ONEID_URL,
            clinetId: clientId,
            redirectUrl: location.origin //to.fullPath 目前都跳转到首页
          })
        }
      }
    }
  }
})

router.afterEach((to) => {
  useTitle(to?.meta?.title as string)
  done() // 结束Progress
  loadDone()
})
