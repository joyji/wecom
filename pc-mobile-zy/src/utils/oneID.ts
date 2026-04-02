const clinetIdName = 'client_id'
import { deleteUserCache } from '@/hooks/web/useCache'
import { removeToken } from '@/utils/auth'

/**
 * 跳转oneId登录页面：目前都跳转到首页
 * @param {string} oneIDUrl 跳转oneID的地址
 * @param {string} clinetId oneID里对应系统的ID
 * @param {string} redirectUrl 路由的fullPath
 */
export const goOneIDLogin = (arg) => {
  const { oneIDUrl, clinetId, redirectUrl } = arg
  const clientID = clinetIdName + '=' + clinetId
  const baseURL = window.location.origin + '/'
  const url = (redirectUrl || '').slice(1)
  const params = url.split('?')[1] ? '?' + url.split('?')[1] : ''
  const redirectURL = 'redirect_uri=' + redirectUrl //'redirect_uri=' + baseURL + url.split('?')[0] + params
  const responseType = 'response_type=code'
  const oneIDLogin = '/esc-sso/oauth2.0/authorize'
  const origin = {
    origin: 'oneID'
  }
  const state = 'state=' + encodeURIComponent(JSON.stringify(origin))
  window.location.href =
    oneIDUrl + oneIDLogin + '?' + clientID + '&' + state + '&' + responseType + '&' + redirectURL
}

/**
 * 跳转oneId退出页面
 */
export const goOneIDLogout = () => {
  const oneIDUrl = import.meta.env.VITE_ONEID_URL
  const oneIDLogout = '/esc-sso/logout?service='
  // console.log(`退出href-`, oneIDUrl + oneIDLogout + location.href.split('?')[0]);
  window.location.href = oneIDUrl + oneIDLogout + encodeURIComponent(location.href.split('?')[0])
  removeToken()
  deleteUserCache() // 删除用户缓存
}

/**
 * oneId码值无效或者过期
 */
export const codeErrorExpired = [
  '00010201', // OneID-Code码值无效或者过期
  '00010202' // OneID-Token码值无效或者过期
]

/**
 * 移除从oneId跳转回来带上的code
 */
export const redirectRemoveCode = () => {
  const params = getAllUrlParams(window.location.href)
  const { state, code, ...newQ } = params
  let oneIdCode = ''
  let paramsNew = ''
  if (code && typeof code === 'object') {
    oneIdCode = code[code.length - 1]
    code.pop() // 移除最后一个code
    paramsNew = objectToQueryString({ ...newQ, ...{ code: code[0] } })
  } else if (code && typeof code !== 'object') {
    oneIdCode = code
    paramsNew = objectToQueryString(newQ)
  }
  return {
    url:
      window.location.origin + window.location.pathname + (paramsNew.length ? '?' + paramsNew : ''),
    oneIdCode: oneIdCode
  }
}

/**
 * 判断是否是oneId跳转回来的
 */
export const isRedirectOneid = () => {
  const params = getAllUrlParams(window.location.href)
  if (params.state && JSON.parse(decodeURIComponent(params.state)).origin === 'oneID') return true
  return false
}

/**
 * 对象拼接成所有参数
 */
const objectToQueryString = (obj) => {
  return Object.keys(obj)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
    .join('&')
}

/**
 * 解析url所有参数
 */
const getAllUrlParams = (url) => {
  // 获取URL中的查询字符串
  let queryString = url ? url.split('?')[1] : window.location.search.slice(1)
  // 解析查询字符串并返回一个对象
  const obj = {}
  if (queryString) {
    queryString = queryString.split('#')[0] // 去除URL中的hash
    const arr = queryString.split('&')
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i].split('=')
      let paramName = a[0]
      let paramValue = a[1]
      paramValue = paramValue ? decodeURIComponent(paramValue.replace(/\+/g, ' ')) : undefined
      let paramNum = undefined
      try {
        paramNum = /[0-9]+/.exec(paramName)[0]
        paramName = paramName.replace(/\[\d+\]/, '')
      } catch (e) {}

      // 如果参数名已经存在，则转化为数组
      if (obj[paramName]) {
        if (typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]]
        }
        if (paramNum) {
          obj[paramName].push(paramValue)
        } else {
          obj[paramName].push(paramValue)
        }
      } else {
        // 如果不存在，直接赋值
        obj[paramName] = paramNum ? [paramValue] : paramValue
      }
    }
  }
  return obj
}
