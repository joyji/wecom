/*
 * @Description:
 * @version: 1.0.0
 * @Author: jiying
 * @Date: 2025-06-26 14:07:47
 * @LastEditors: jiying
 * @LastEditTime: 2025-07-02 16:39:00
 */
import request from '@/config/axios'

// 获得授权信息
export const getAuthorize = (clientId: string) => {
  return request.get({ url: '/system/oauth2/authorize?clientId=' + clientId })
}

// 发起授权
export const authorize = (
  responseType: string,
  clientId: string,
  redirectUri: string,
  state: string,
  autoApprove: boolean,
  checkedScopes: string[],
  uncheckedScopes: string[]
) => {
  // 构建 scopes
  const scopes = {}
  for (const scope of checkedScopes) {
    scopes[scope] = true
  }
  for (const scope of uncheckedScopes) {
    scopes[scope] = false
  }
  // 发起请求
  return request.post({
    url: '/system/oauth2/authorize',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    params: {
      response_type: responseType,
      client_id: clientId,
      redirect_uri: redirectUri,
      state: state,
      auto_approve: autoApprove,
      scope: JSON.stringify(scopes)
    }
  })
}

// TODO： oneID对接 - 获取access_token
export const getOneIdAccessToken = (clientId: string, code: string, redirectUri: string) => {
  return request.post({
    url: '/system/auth/sso-login',
    data: {
      clientId: clientId,
      code: code,
      redirectUri: redirectUri
    }
  })
}
// TODO： oneID对接 - 通过token获取用户信息
export const getOneIdProfile = (accessToken: string) => {
  return request.get({
    url: '/system/oauth2/userInfo?token=' + accessToken
  })
}
