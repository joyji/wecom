<template>
  <view class="container" :style="{ 'height': isWindows ? '156px' : '147px' }">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="left">
        <text>待办中心{{ env == 'prod' ? '' : env }}</text>
      </view>
      <view class="right" v-if="total > 0" @click="handleLinkClick">
        <a
          :href="wxWorkUrl">
          <text class="number_box"><text class="number">{{ total }}</text>项待办</text>
          <image src="/static/image/zy-workbench/arrow.svg" style="width: 16px; height: 16px" mode="aspectFit" />
        </a>
      </view>
    </view>
    <!-- 加载骨架图 -->
    <view v-if="loading" class="skeleton-list">
      <view class="skeleton-item">
        <view class="skeleton-icon shimmer"></view>
        <view class="skeleton-content">
          <view class="skeleton-line shimmer" style="width: calc(100vw - 68px)"></view>
          <view class="skeleton-line shimmer" style="width: calc(100vw - 141px)"></view>
        </view>
      </view>
      <view class="skeleton-item">
        <view class="skeleton-icon shimmer"></view>
        <view class="skeleton-content">
          <view class="skeleton-line shimmer" style="width: calc(100vw - 68px)"></view>
          <view class="skeleton-line shimmer" style="width: calc(100vw - 141px)"></view>
        </view>
      </view>
    </view>
    <!-- 待办列表 -->
    <view v-else-if="todoList && todoList.length > 0" class="todo-list">
      <view class="todo-item" v-for="(item, index) in todoList" :key="index">
        <!-- <view v-if="item.mobileApproval || item.mobileApproval == null" > -->
        <a :href="item.getUrl" v-if="item.mobileApproval || item.mobileApproval == null">
          <view class="todo-icon" @click="handleLinkClickT(item)">
            <image :src="systemCodeImg[item.systemCode] || systemCodeDefaultImg" style="width: 30px; height: 30px" mode="aspectFit" />
          </view>
          <view class="todo-content" @click="handleLinkClickT(item)">
            <view class="todo-title">
              <text class="todo-text">{{ item.procName }}</text>
              <text class="todo-extend">
                <text class="todo-user">{{ item.procInitiatorName?.length > 4 ? item.procInitiatorName.substring(0,4) + '...' : item.procInitiatorName }}</text>
                <text class="todo-divider">|</text>
                <text class="todo-date">{{ item.arriveTimeStr }}</text>
              </text>
            </view>
            <view class="todo-info">
              <text class="todo-user">{{ item.procTitle }}</text>
            </view>
          </view>
        </a>
        <!-- </view> -->
        <view v-else class="todo-item-pc" @click="handleClick(item)">
          <view class="todo-icon">
            <image :src="systemCodeImg[item.systemCode] || systemCodeDefaultImg" style="width: 30px; height: 30px" mode="aspectFit" />
          </view>
          <view class="todo-content">
            <view class="todo-title">
              <text class="todo-text">{{ item.procName }}</text>
              <text class="todo-extend">
                <text class="todo-user">{{ item.procInitiatorName?.length > 4 ? item.procInitiatorName.substring(0,4) + '...' : item.procInitiatorName }}</text>
                <text class="todo-divider">|</text>
                <text class="todo-date">{{ item.arriveTimeStr }}</text>
              </text>
            </view>
            <view class="todo-info">
              <text class="todo-user">{{ item.procTitle }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="empty-data-container">
      <image class="empty-image" src="/static/image/zy-workbench/todo/noData.png" mode="widthFix"></image>
      <text class="empty-text">暂无待办</text>
    </view>
  </view>
</template>

<script setup>

import { ref, reactive, onMounted } from 'vue'
import { onLoad, onShow, onHide } from '@dcloudio/uni-app'
import { getMsgFlow, getFilePage, getDictDataImgAPi, getTokenBySystemCode, getDictType } from '@/common/ts/api/wwApi'

const env = import.meta.env.MODE
const baseUrl = ref(import.meta.env.VITE_DOMAIN_URL)

const isWindows = ref(false)
const isPad = ref(false)
const total = ref('0')
// 加载状态：接口返回前展示骨架图
const loading = ref(true)

// 待办数据
const todoList = ref([])
// const systemCodeImg = reactive({
//   CRM: new URL('/src/static/image/zy-workbench/todoImg/CRM.png', import.meta.url).href,
//   ELEASING: new URL('/src/static/image/zy-workbench/todoImg/ELEASING.png', import.meta.url).href,
//   MLEASING: new URL('/src/static/image/zy-workbench/todoImg/MLEASING.png', import.meta.url).href,
//   OA: new URL('/src/static/image/zy-workbench/todoImg/OA.png', import.meta.url).href,
// });
const systemCodeImg = ref({});
const systemCodeDefaultImg = ref('');
systemCodeDefaultImg.value = new URL('/src/static/image/zy-workbench/todoImg/CRM.png', import.meta.url).href;
let queryParams = {};
const wxWorkUrl = ref('');

onLoad((options) => {
  console.log('todo onLoad', options)

  isWindows.value = navigator.userAgent.includes('WindowsWechat')
  isPad.value = navigator.userAgent.includes('iPad')
  // 将参数统一存入一个对象中
  if (options) {
    Object.keys(options).forEach(key => {
      queryParams[key] = String(options[key]);
    });
  } else {
    console.log('未传递参数');
  }
})

onMounted(() => {
})

onShow(async () => {
  // 页面加载时获取传递的参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options;
  // 将参数统一存入一个对象中
  if (options) {
    Object.keys(options).forEach(key => {
      queryParams[key] = String(options[key]);
    });
  } else {
    console.log('未传递参数');
  }
  console.log("🚀 ~ Object.keys ~ queryParams:", queryParams)
  const dictRes = await getDictType({ type: 'system_url' })
  if (dictRes.data.length > 0) {
    systemCodeImg.value = dictRes.data.reduce((acc, item) => {
      acc[item.label] = item.value
      return acc
    }, {})
  }
  
  // 构建完整的wxwork URL
  const queryString = objectToQueryString(queryParams);
  wxWorkUrl.value = 'wxwork://openurl?url=' + encodeURIComponent(baseUrl.value + '/#/pages/todo/list' + queryString);
  console.log("🚀 ~ wxWorkUrl:", wxWorkUrl)
  getTodoList()
  // TODO: 获取待办列表, 并更新todoList

})

const handleClick = (item) => {
  triggerEvent('YDD202508191050011', '待办中心-点击待办', item)
  console.log('handleClick', item)
  uni.showToast({
    title: '暂未支持移动审批，请在PC处理',
    icon: 'none'
  })
}
const handleLinkClick = () => {
  triggerEvent('YDD202508191050012', '待办中心-' + total.value + '项待办')
}
const handleLinkClickT = (item) => {
  triggerEvent('YDD202508191050011', '待办中心-点击待办', item)
}

// const getUrl =async (item) => {
//     let url =''
//     let result = ''
//     if(item && item.jumpPath && item.jumpPath.includes("/pages/index/transition")){
//       if (item.jumpPath.includes("?path=")) {
//         result = item.jumpPath.split("?path=")[1];
//       }
//        url='wxwork://openurl?url=' + encodeURIComponent(baseUrl.value + '/#/pages/index/transition?path='+ result )
//     }else{
//        url='wxwork://openurl?url=' + encodeURIComponent(item.jumpPath)
//     }
//     let res = ''
//     try {
//       res = await getTokenBySystemCode({
//         systemCode:item.systemCode,
//         userId:queryParams.userId
//       })
//       console.log("🚀 ~ getUr1111111111111111111111111111111111111l ~ url:", url)
//       return url='wxwork://openurl?url=' + encodeURIComponent(baseUrl.value + '/#/pages/index/transition?path='+ result + res.data)
//     } catch (error) {
//       console.log("🚀 ~ getDictData ~ error:", error)
//       console.log("🚀 ~ getUr2222222222222222222222222222222222222l ~ url:", url)
//       return url
//     }
// }
const getUrl = (item) => {
  if (item && item.jumpPath && item.jumpPath.includes("/pages/index/transition")) {
    let result = ''
    if (item.jumpPath.includes("?path=")) {
      result = item.jumpPath.split("?path=")[1];
    }
    console.log("🚀 ~ getUrl ~ ok", 'wxwork://openurl?url=' + encodeURIComponent(baseUrl.value + '/#/pages/index/transition?path=' + result))
    return 'wxwork://openurl?url=' + encodeURIComponent(baseUrl.value + '/#/pages/index/transition?path=' + result)
  } else {
    console.log("🚀 ~ getUrlresult2222222222222 ~ ", 'wxwork://openurl?url=' + encodeURIComponent(item.jumpPath))
    return 'wxwork://openurl?url=' + encodeURIComponent(item.jumpPath)
  }
}
const getTime = (timestamp, type) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // 构造日期对象
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inputDate = new Date(timestamp);
  inputDate.setHours(0, 0, 0, 0);

  const diffDays = (today - inputDate) / (1000 * 60 * 60 * 24);

  switch (type) {
    case 'YMD':
      return `${year}-${month}-${day}`;
    case 'MD':
      return `${month}-${day}`;
    case 'relative':
      if (diffDays === 0) return '今天';
      if (diffDays === 1) return '昨天';
      if (diffDays < 0) return `${year}-${month}-${day}`;
      return `${month}-${day}`;
    default:
      return `${year}-${month}-${day}`;
  }
};
const getTodoList = async () => {
  try {
    loading.value = true
    const res = await getMsgFlow({
      ...queryParams,
      pageNo: 1,
      pageSize: 2
    })
    todoList.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.log('getTodoList error', e)
    todoList.value = []
    total.value = 0
  } finally {
    // 接口主数据返回后即可展示列表或空态
    loading.value = false
    // 后续补充跳转链接参数
    getTodoListT()
  }
}
const getTodoListT = () => {
  for (let i = 0; i < todoList.value.length; i++) {
    getTodoListTS(todoList.value[i], i)
  }
}
const getTodoListTS = async (item, i) => {
  try {
    const res = await getTokenBySystemCode({
      systemCode: item.systemCode,
      userId: queryParams.userId
    })
    todoList.value[i].jumpPath = todoList.value[i].jumpPath //+ res.data  // decodeURIComponent()
    if (todoList.value[i] && todoList.value[i].jumpPath && todoList.value[i].jumpPath.includes("/pages/index/transition")) {
      let result = ''
      const url = todoList.value[i].jumpPath;
      const equalIndex = url.indexOf('=');
      if (equalIndex !== -1) {
        result = url.substring(equalIndex + 1); // 取出第一个 "=" 之后的所有内容
      }
      console.log(item.procName, "11111111111111111", todoList.value[i].getUrl)
      todoList.value[i].getUrl = 'wxwork://openurl?url=' + encodeURIComponent(baseUrl.value + '/#/pages/index/transition?path=' + result)
    } else {
      let result = '';      // 存储第一个 "=" 之后的内容
      let firsturl = '';    // 存储第一个 "=" 之前的内容
      const url = todoList.value[i].jumpPath;
      const equalIndex = url.indexOf('=');
      if (equalIndex !== -1) {
        result = url.substring(equalIndex + 1);        // 第一个 "=" 后的内容
        firsturl = url.substring(0, equalIndex);       // 第一个 "=" 前的内容
        todoList.value[i].getUrl = 'wxwork://openurl?url=' + encodeURIComponent(firsturl + '=' + decodeURIComponent(result))
      } else {
        // 如果没有 "=", 可以选择将整个 URL 赋给 firsturl，或者留空
        firsturl = url; // 或者根据需求设为其他值
        console.log(item.procName, "222222222222222222222", todoList.value[i].getUrl)
        todoList.value[i].getUrl = 'wxwork://openurl?url=' + encodeURIComponent(firsturl)
      }
    }
  } catch (error) {
    console.log("🚀 ~ getTodoListTS ~ error:", error)
  }
}
const objectToQueryString = (params) => {
  const searchParams = new URLSearchParams();

  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString() ? `?${searchParams.toString()}` : '';
}
</script>

<style scoped lang="scss">
page {
  margin: 0;
}

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.container {
  width: 100%;
  background-color: #ffffff;
}

/* 顶部标题栏样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  height: 40px;
  padding: 0 10px;
  box-sizing: border-box;

  .left {
    font-size: 13px;
    font-weight: 400;
    color: #A3A6A9;
  }

  .right {
    a {
      text-decoration: none;
      font-size: 12px;
      color: #333;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .number_box {
        font-family: PingFangSC-Regular;
        font-size: 13px;
        color: #333333;
        letter-spacing: 0;
        line-height: 18px;
        font-weight: 400;
      }

      .number {
        font-size: 13px;
        color: #FC6500;
        letter-spacing: 0;
        line-height: 18px;
        font-weight: 400;
      }

      .text {
        margin-left: 5px;
      }
    }
  }
}

/* 待办列表样式 */
.todo-list {
  padding-left: 16px;
}

/* 骨架图样式 */
.skeleton-list {
  padding-left: 16px;
}
.skeleton-item {
  display: flex;
  align-items: center;
  height: 43px;
  &:first-child {
    border-bottom: 1px solid #F8F8F8;
    padding-bottom: 2px;
  }
}
.skeleton-icon {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background-color: #f2f2f2;
  margin-right: 15px;
}
.skeleton-content {
  flex: 1;
}
.skeleton-line {
  height: 16px;
  background-color: #F5F5F5;
  margin-top: 3px;
}
.shimmer {
  position: relative;
  overflow: hidden;
}
.shimmer::after {
  content: "";
  position: absolute;
  top: 0;
  left: -150px;
  width: 120px;
  height: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%);
  animation: shimmer-move 1.2s ease-in-out infinite;
}
@keyframes shimmer-move {
  0% { transform: translateX(0); }
  100% { transform: translateX(260px); }
}

.todo-item {
  display: flex;
  align-items: center;
  height: 43px;
  position: relative;

  .todo-item-pc,
  a {
    position: absolute;
    width: 100%;
    display: flex;
    align-items: center;
    height: 43px;
    text-decoration: none;
  }

  &:first-child {
    border-bottom: 1px solid #F8F8F8;
    padding-bottom: 4px;
  }

  &:last-child {
    padding-top: 4px;
  }
}

.todo-icon {
  margin-right: 15px;
  display: flex;
}

.todo-content {
  flex: 1;
}

.todo-title {
  font-size: 13px;
  color: #333333;
  font-weight: 500;
  display: flex;
  align-items: center;
  max-width: calc(100vw - 61px);
  .todo-text {
    flex: 1;
    font-size: 13px;
    color: #333333;
    letter-spacing: 0;
    line-height: 13px;
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0; /* 添加此行以确保在flex容器中正确省略文本 */
  }

  .todo-extend {
    font-size: 12px;
    color: #CCCCCC;
    margin-right: 16px;
    display: flex;
    align-items: center;
    font-weight: 400;
    font-family: PingFangSC-Regular;
    letter-spacing: 0;
    text-align: right;
    width: 130px;
    justify-content: right;
    
    .todo-user {}

    .todo-divider {
      line-height: 10px;
      height: 10px;
      width: 1px;
      background-color: #F5F5F5;
      display: inline-block;
      overflow: hidden;
      margin: 0 6px;
    }

    .todo-date {}
  }
}

.todo-info {
  font-size: 12px;
  color: #999999;
  display: flex;
  align-items: center;
  max-width: calc(100vw - 61px);
  font-family: PingFangSC-Regular;

  .todo-user {
    margin-right: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  //   .todo-company {
  //     margin-right: 8px;
  //   }

  //   .todo-date {
  //     margin-left: auto;
  //   }
}

.empty-data-container {
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .empty-image {
    vertical-align: top;
    width: 145px;
  }

  .empty-text {
    margin-top: 8px;
    font-size: 12px;
    color: #666666
  }
}

/* 适配暗黑模式 */
@media (prefers-color-scheme: dark) {

  page,
  .container {
    background-color: #222222;
  }

  .fixed-search-box {
    background-color: #333333 !important;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
  }

  .todo-item {
    background-color: #333333;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
  }

  .todo-title {
    color: #EEEEEE;

    .todo-text {
      color: #EEEEEE;
    }
  }

  .todo-desc,
  .todo-time {
    color: #AAAAAA;
  }

  .todo-user {
    color: #CCCCCC;
  }

  .filter-container {
    background-color: #333333;
  }

  .filter-title {
    color: #EEEEEE;
  }

  .filter-label {
    color: #DDDDDD;
  }

  .filter-tag {
    background-color: #444444;
    color: #BBBBBB;
  }

  .filter-tag-active {
    background-color: rgba(15, 129, 235, 0.3);
    color: #69B4FF;
  }

  .filter-input {
    background-color: #444444;
    border-color: #555555;
    color: #EEEEEE;

    &::placeholder {
      color: #888888;
    }
  }

  .btn-reset {
    background-color: #444444;
    color: #BBBBBB;
    border-color: #555555;
  }

  .todo-badge {
    border-color: #333333;
  }

  /* 顶部标题栏样式 */
  .header {
    background-color: #222222;


    .left {
      color: #EEEEEE;
    }

    .right {
      a {
        color: #EEEEEE;

        .number_box {
          color: #EEEEEE;
        }
      }
    }


  }
}
</style>
