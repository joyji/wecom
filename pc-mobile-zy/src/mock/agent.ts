// 应用基本信息，包括以下字段：
// 1. 应用名称:name
// 2. 应用描述:description
// 3. 应用ID:agentId

// 应用详情 GET
// 接口： https://qyapi.weixin.qq.com/cgi-bin/agent/get
// 入参：agentid
// 返回：agentInfo
export const agentInfo = {
  "errcode": 0,
  "errmsg": "ok",
  "agentid": 1000069,
  "name": "展业中心-dev",
  "square_logo_url": "https://wework.qpic.cn/wwpic3az/953674_6-pgyTT5RzuTeWu_1741059754/0",
  "description": "",
  "allow_userinfos": {
      "user": [
          {
              "userid": "2084017869749768968"
          },
          {
              "userid": "yushangcheng"
          },
          {
              "userid": "mamingxin"
          },
          {
              "userid": "ex-lijjinpeng"
          },
          {
              "userid": "wanzhengrong"
          },
          {
              "userid": "jiying"
          },
          {
              "userid": "yangxin"
          },
          {
              "userid": "wanfangfang"
          },
          {
              "userid": "yupengyao"
          },
          {
              "userid": "zengtingting"
          },
          {
              "userid": "ex-zhanggongwen"
          },
          {
              "userid": "hushanshan"
          },
          {
              "userid": "ex-caotan"
          },
          {
              "userid": "zhuyiling"
          },
          {
              "userid": "sunchao"
          },
          {
              "userid": "ex-wangwanbao"
          },
          {
              "userid": "guojian"
          },
          {
              "userid": "ex-dingpeng"
          },
          {
              "userid": "zhangxian"
          },
          {
              "userid": "ex-liuwang"
          },
          {
              "userid": "luguanhao"
          }
      ]
  },
  "allow_partys": {
      "partyid": [
          196
      ]
  },
  "close": 0,
  "redirect_domain": "mobile-biz-lease-outernet-dev.rosino.com",
  "report_location_flag": 0,
  "isreportenter": 0,
  "home_url": "https://mobile-biz-lease-outernet-dev.rosino.com"
}

// 获取应用在用户工作台展示的数据 POST
// 接口： https://qyapi.weixin.qq.com/cgi-bin/agent/get_workbench_data
// 入参：{
//     "agentid": 1000069,
//     "userid": "jiying"
// }
// 返回：agentData
export const agentData = {
  "errcode": 0,
  "errmsg": "ok",
  "data": {
      "type": "webview",
      "webview": {
          "url": "https://h5-mobile-zy-dev.rosino.com/#/pages/index/index?oneid=2083427157127736015",
          "jump_url": "",
          "pagepath": "",
          "height": "double_row",
          "hide_title": true,
          "enable_webview_click": true
      }
  }
}

// 设置应用在用户工作台展示的数据 POST
// 接口： https://qyapi.weixin.qq.com/cgi-bin/agent/set_workbench_data
// 入参：{
//   "agentid":1000102,
//   "userid":"jiying",
//   "type":"webview",
//   "webview": {
//       "url":"https://h5-mobile-zy-stg.rosino.com/#/pages/index/index?userid=jiying",
//       "hide_title":true,
//       "enable_webview_click":true
//   }
// }

// 获取应用在用户工作台展示的数据 GET