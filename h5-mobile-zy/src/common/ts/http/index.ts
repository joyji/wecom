/*
 * @Description: 
 * @version: 1.0.0
 * @Author: jiying
 * @Date: 2025-10-13 19:40:29
 * @LastEditors: jiying
 * @LastEditTime: 2025-10-15 17:42:49
 */
const baseUrl = import.meta.env.VITE_API_BASE_URL
type HttpMethod ='POST' | 'OPTIONS' | 'GET' | 'HEAD' | 'PUT' | 'DELETE' | 'TRACE'
type ContentType ='JSON' | 'FORM_URLENCODED'
const DEFAULT_METHOD : HttpMethod ='GET'
const DEFAULT_CONTENT_TYPE:ContentType ='JSON'

interface Request {
	url:string,
	method:HttpMethod,
	body?:any,
	hideLoading?:boolean,
	contenType?:ContentType,
	headers?:any,
	timeout?:number
}
const request = async({
	url='',
	method=DEFAULT_METHOD,
	body={},
	hideLoading=true,
	contenType =DEFAULT_CONTENT_TYPE,
	headers={},
	timeout=30000
}:Request):Promise<any> =>{
	if(!hideLoading){
		uni.showLoading({
			mask:true
		})
	}
	url = url.indexOf('https://')>-1?url: baseUrl + url;
	//增加时间戳
	if(url.indexOf('?')>-1){
		url+='&ts='+(new Date()).getTime();
	}else{
		url+='?ts='+(new Date()).getTime();
	}
	const requestUrl =url
	const token =uni.getStorageSync('token')||''
	const authHeaders ={
		'X-Access-Token':token,
		'Authorization':token
	}
	try{
		const res:any =await uni.request({
			url:requestUrl,
			method:method,
			data:body,
			header:Object.assign(authHeaders,headers),
			timeout,
			enableCache:true
		})
		const { data }:any =res
		if(res.data.code===500){
			//重新登录
			return Promise.resolve(data)
		}
		if(res.data.code===401){ 
			//重新登录
			return Promise.resolve(data)
		}
		if(res.data.code===200 || res.data.code === 0){
			return Promise.resolve(data)
		}
		return Promise.reject(res.data.message)
	}catch(error){
		return Promise.reject('请求失败')
	}finally{
		if(!hideLoading) {
			uni.hideLoading()
		}
	}
}
export default request