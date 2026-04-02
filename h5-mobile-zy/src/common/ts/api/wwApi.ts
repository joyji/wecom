/*
 * @Description: 
 * @version: 1.0.0
 * @Author: jiying
 * @Date: 2025-04-18 16:52:44
 * @LastEditors: jiying
 * @LastEditTime: 2025-10-23 14:20:39
 */
import request from '../../ts/http/index'
export const grtWorkChatConfig = (url:string,agentId:string)=>{
	return request({
		url:`app-api/wecom/auth/createWxJsapiSignatureByAgentId?url=${encodeURIComponent(url)}&agentId=${agentId}`,
		method:'GET',
		body:{},
		hideLoading:true
	})
}
export const grtLoginConfig = (code:string)=>{
	return request({
		url:`app-api/wecom/auth/login-h5?code=${code}`,
		method:'GET',
		body:{},
		hideLoading:true
	})
}
export const getMsgFlow = (data : any)=>{
	return request({
		url:`app-api/msg/flow/page`,
		method:'POST',
		body:data,
		hideLoading:true
	})
}
export const getMsgFlowPageList = (data : any)=>{
	return request({
		url:`app-api/msg/flow/pageList`,
		method:'POST',
		body:data,
		hideLoading:true
	})
}

export const getDictDataAPi = ()=>{
	return request({
		url:`app-api/system/dict-data/type?type=system_code`,
		method:'GET',
		body:{},
		hideLoading:true
	})
}
export const getDictDataImgAPi = ()=>{
	return request({
		url:`app-api/system/dict-data/type?type=system_url`,
		method:'GET',
		body:{},
		hideLoading:true
	})
}

// 查询文件列表
export const getFilePage = () => {
  return request({
		url:`app-api/infra/file/pageNo=1&pageSize=100&path=public`,
		method:'GET',
		body:{},
		hideLoading:true
	})
}

// 获取权限
export function getOnlyOfficeToken(config:any) {
	return request({
		url: `app-api/infra/office/onlyOfficeToken/generate?config=${config}`,
		method: 'GET'
	});
}


// 企微工作台-业务中心获取用户菜单的接口
export const getWorkbenchMenu = (data : any)=>{
	return request({
		
		url:`app-api/wecom/menu/get-workbench-menu`,
		method:'POST',
		body:data,
		hideLoading:true
	})
}
export const getTokenBySystemCode = (data : any)=>{
	return request({
		url:`app-api/msg/flow/getTokenBySystemCode?systemCode=${data.systemCode}&userId=${data.userId}`,
		method:'POST',
		body:data,
		hideLoading:true
	})
}
export const getDictType = (data : any)=>{
	return request({
		url:`app-api/system/dict-data/type?type=${data.type}`,
		method:'GET',
		body:{},
		hideLoading:true
	})
}