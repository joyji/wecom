/*
 * @Description: 企业微信sdk通用方法
 * @version: 0.0.1
 * @Author: jiying
 * @Date: 2024-08-19 13:48:18
 * @LastEditors: jiying
 * @LastEditTime: 2025-10-14 13:28:10
 */

import * as ww from '@wecom/jssdk'
import { grtWorkChatConfig,grtLoginConfig } from '@/common/ts/api/wwApi'

const removeURLParam = (url: string,name: string) => {
    var e = eval('/'+name+'=[^&]*&?/g');//参数，例如：“age=18&”，&可有可无，/g表示匹配全局而不是匹配的第一个。
    return url.replace(e, '');
  }
  
const getUrlParam = (name: string) => { // 获取url参数
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    const result = window.location.search.substr(1).match(reg);
    return result ? decodeURIComponent(result[2]) : null;
}
const getAuthUrl = (appid: string, agentid: string, url?: string) => { // 网页授权链接
    // `https://open.weixin.qq.com/connect/oauth2/authorize?appid=ww6c12cd389a083f32&agentid=1000070&redirect_uri=https://mobile-biz-lease-outernet.sinopharmholding-fl.com&response_type=code&scope=weixin&state=weixin#wechat_redirect`
    // 配置参数
    const opt = {
        appid: appid, // 企业微信的appid
        agentid: agentid, // 应用ID
        redirect_uri: encodeURIComponent(url ? url : window.location.href), // 重定向地址，需外网地址，需要进行UrlEncode
        response_type: 'code', // 返回类型，固定为：code
        scope: 'snsapi_privateinfo' // 应用授权作用域, 可选值： snsapi_base：静默授权，可获取成员的基础信息（UserId）；snsapi_privateinfo：手动授权，可获取成员的详细信息，包含头像、二维码等敏感信息（此时要求成员必须在应用可见范围内）。
    };
    const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${opt.appid}&agentid=${opt.agentid}&redirect_uri=${opt.redirect_uri}&response_type=${opt.response_type}&scope=${opt.scope}&state=weixin#wechat_redirect`;
    // 重新跳转到当前位置
    // console.log(authUrl);
    
    return authUrl
}

const wwRegister = (corpId: string, agentId: string, list: string[] = ['launchMiniprogram', 'closeWindow','onHistoryBack','hideAllNonBaseMenuItem','hideMenuItems', 'previewFile', 'sendChatMessage','shareWechatMessage','onUserCaptureScreen', 'onMenuShareAppMessage','closeWindow','scanQRCode','openEnterpriseChat'])=>{ // 注册应用信息
    ww.register({
        corpId: corpId, // 当前用户所属企业ID（或公众号的 appId）
        agentId: agentId, // 企业微信第三方应用的AgentID
        jsApiList: list, // 需要使用的JS接口列表
        async getConfigSignature(url) {
            // 根据 url 生成 config 签名信息（需要开发者自行实现）
            // 返回 { timestamp, nonceStr, signature }
            // console.log('getConfigSignature-url',location.href.split('#')[0])
            const {data} = await grtWorkChatConfig(location.href.split('#')[0], agentId)  
			// console.log('getConfigSignature-结构',data)
            // const options = {
            //     ticket: 'HoagFKDcsGMVCIY2vOjf9gBO2ct2EpTiKju3HYEjJct6_yE5HYpiYqYqnZ8BmNWJ_LN61bMZFJmMdKqbTuNFYA',
            //     nonceStr: 'W2McrMaz3DKviOD6',
            //     // 将时间戳转换为字符串以解决类型不匹配问题
            //     timestamp: Math.floor(new Date().getTime()/1000),
            //     url: location.href.split('#')[0]
            // }
            // const webData = ww.getSignature(options)
            const { timestamp, nonceStr, signature } = data
            return { timestamp, nonceStr, signature}              
        },
        async getAgentConfigSignature(url) {
            // const data = ww.getSignature({
            //   ticket: '32Mit2FmAb6DZjDLKuHC6Q==', // 企微jsapi ticket
            //   nonceStr: 'W2McrMaz3DKviOD6', // 随机字符串
            //   timestamp: 1749437483, // 时间戳  
            //   url: url,
            // })
            const {data} = await grtWorkChatConfig(location.href.split('#')[0], agentId)
            // console.log('agent结构',data)
            const { timestamp, nonceStr, signature } = data
            return { timestamp, nonceStr, signature }  
        },
        onConfigSuccess: (res) => {
            // console.log('config success', res)
        },
        onConfigFail: (res) => {
            // console.log('config fail', res)
        },
        onConfigComplete: () => {
            // console.log('config complete')
        },
        onAgentConfigSuccess: (res) => {
            // console.log('agent config success', res)
        },
        onAgentConfigFail: (res) => {
            // console.log('agent config fail', res)
        },
        onAgentConfigComplete: () => {
            // console.log('agent config complete')
        }
    })
}

export default {
    isWeChat: () => {
        return ww.env.isWeChat
    },
    isWeCom: () => {
        return ww.env.isWeCom
    },
    getAuthCode: async (corpId: string, agentId: string) => {
        let code = getUrlParam('code');
        let state = getUrlParam('state');
        // console.log('code', code, 'state', state);
        if (!code) {
          const authUrl = getAuthUrl(corpId, agentId) // getAuthUrl('ww6c12cd389a083f32', '100060')
          window.location.href =authUrl;
        } else {
			let res={}
            console.log('企微params',code)
            uni.removeStorageSync('token');
			res = await grtLoginConfig(code)
            console.log('grtLoginConfig',code,res);
            if(res.code === 0) {
				uni.setStorageSync('token',res.data?.accessToken)
                const token =uni.getStorageSync('token')||''
                // console.log("🚀 ~ getAuthCode: ~ to9ken:", token)
                wwRegister(corpId, agentId)
                ww.hideAllNonBaseMenuItem()
                // test
                ww.onUserCaptureScreen(function() {console.log('111')})
                ww.onHistoryBack(function() {
                    console.log('点击了返回按钮');
                    return true;
                })
                return true
            } else  {
                //TODO: 登录失败, 重新授权code 
                alert('登录失败')
                uni.clearStorageSync()
                const locationUrl = window.location.href
                const locationOrigin = window.location.origin
                const isHasPage = locationUrl.split('/pages')
                let path = '';
                if(isHasPage.length > 1) {
                    path = `pages${isHasPage[1]}`
                } 
                const url = `${locationOrigin}/#/${path}`
                console.log('locationUrl', locationUrl);
                // let url = removeURLParam(locationUrl, 'code')
                // url = removeURLParam(url, 'state')
                console.log('url', url);
                const authUrl = getAuthUrl(corpId, agentId, url) // getAuthUrl('ww6c12cd389a083f32', '100060')
                window.location.href = authUrl;
				//window.location.replace(authUrl);
            }
        }
    },
    wwConfig: (corpId: string, agentId: string, list: string[] = []) => { // 初始化企微sdk配置
        // 注册应用信息
        wwRegister(corpId, agentId)

        // test
        ww.onUserCaptureScreen(function() {console.log('111')})
        // ww.hideMenuItems({menuList: ['menuItem:setFont', 'menuItem:refresh','menuItem:favorite','menuItem:share:timeline','menuItem:openWithQQBrowser','menuItem:openWithSafari','menuItem:copyUrl','menuItem:share:wechat','menuItem:share:appMessage']})//设置隐藏某些微信按钮
        // ww.hideAllNonBaseMenuItem();
    },
    getAuthUrl: getAuthUrl,
    ww
}