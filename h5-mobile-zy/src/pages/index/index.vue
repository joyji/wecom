<template>
  <view :style="{ 'height': isWindows ? '156px' : '212px' }"
    :class="['container', isWindows ? 'windows' : '', activeTab === 1 ? 'normal' : '']">
    <!-- 顶部导航 -->
    <!-- 标题栏，分为左右区域 -->
    <view class="header">
      <view class="left">
        <text>业务中心{{ env == 'prod' ? '' : env }}</text>
         <a v-if="isWindows && activeTab === 0" :href="'wxwork://openurl?url=' + encodeURIComponent(baseUrl + '/#/pages/index/transition?path=/pages/tabbar/market/market')"><image src="/static/image/zy-workbench/arrow.svg" style="width: 16px; height: 16px" mode="aspectFit" /></a>
      </view>
      <view class="right" v-if="userType == '0'">
        <view class="tabs">
          <view v-for="(tab, index) in tabs" :key="tab" :class="['tab', { active: activeTab === index }]"
            @click="activeTab = index">
            {{ tab }}
          </view>
        </view>
      </view>
    </view>
    <!-- 营销活动区域 -->
    <view v-show="activeTab == 0" :class="['section', isWindows ? 'windows' : '']">
      <view class="section-header" v-if="!isWindows">
        <span>营销活动</span>
        <a
          :href="'wxwork://openurl?url=' + encodeURIComponent(baseUrl + '/#/pages/index/transition?path=/pages/tabbar/market/market')"><span
            class="more">更多
            <image src="/static/image/zy-workbench/arrow.svg" style="width: 16px; height: 16px" mode="aspectFit" />
          </span>
        </a>
      </view>

      <!-- 日历组件 -->
      <view :class="['calendar', isWindows ? 'windows' : '']">
        <view class="days">
          <view v-for="(item, key, index) in data" :key="index" :class="['day', {
            'selected': key == selectedDate
          }]" @click="selectDate(key)">
            <span class="day-header">{{ weekDays[index] }}</span>
            <span>{{ truncateText(key) }}</span>
          </view>
        </view>
        <!-- 事件列表 -->
        <view class="event">
          <view class="left">
            <!-- 事件轮播区域 -->
            <view class="event-carousel" v-if="eventList.length > 0">
              <transition name="slide-fade">
                <view class="event-item" :key="currentEventIndex">
                  <a :href="'wxwork://openurl?url=' + encodeURIComponent(baseUrl + '/#/pages/index/transition?path=' + currentEvent.path)">
                    <view class="event-dot-container"> 
                      <view :class="['event-dot', {
                        'red': currentEvent.planType === '1',
                        'orange': currentEvent.planType === '0'
                      }]"></view>
                    </view>
                    <view class="event-time">{{ currentEvent.startTime }}</view>
                    <view class="event-title">{{ currentEvent.marketName }}</view>
                  </a>
                </view>
              </transition>
            </view>
            <view v-else>
              <view class="event-time">暂无计划</view>
            </view>
          </view>
          <view class="right">
            <view class="event-btn" v-if="data && data[selectedDate]?.buttonType == 'plan'">
              <a
                :href="'wxwork://openurl?url=' + encodeURIComponent(baseUrl + '/#/pages/index/transition?path=subpkgCRM/pages/planCreated/index?startTime=' + selectedDate + ' 09:00&endTime=' + selectedDate +' 13:00')">+
                建计划</a>
            </view>
            <view class="event-btn" v-if="data && data[selectedDate]?.buttonType == 'record'">
              <a
                :href="'wxwork://openurl?url=' + encodeURIComponent(baseUrl + '/#/pages/index/transition?path=subpkgCRM/pages/planCreated/index?startTime=' + selectedDate + ' 09:00&endTime=' + selectedDate +' 13:00')">+
                建记录</a>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 统计卡片区域 -->
    <view v-show="activeTab == 1" :class="['statistics', { 'cards': true, 'windows' : isWindows }]">
      <view class="left">
      </view>
      <view class="icons" v-if="menu == '1'">
        <view class="icon-item">
          <image src="/static/image/zy-workbench/home.svg" style="width: 38px; height: 38px" mode="aspectFit" />
          <view class="text">首页</view>
        </view>
        <view class="icon-item">
          <image src="/static/image/zy-workbench/flow.svg" style="width: 38px; height: 38px" mode="aspectFit" />
          <view class="text">流程</view>
        </view>
      </view>
      <view class="cards" v-if="menu == '2'">
          <a :href="'wxwork://openurl?url=' + encodeURIComponent('https://wxaurl.cn/aCJWZpPQaVi')" class="card-item">
            <image src="/static/image/zy-workbench/todo.svg" style="width: 18px; height: 21px" mode="aspectFit" />
            <view class="count">6</view>
            <view class="text">我的待办</view>
          </a>
        <view class="card-item">
          <image src="/static/image/zy-workbench/circulate.svg" style="width: 18px; height: 21px" mode="aspectFit" />
          <view class="count">6</view>
          <view class="text">传阅我的</view>
        </view>
      </view>
    </view>


  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app';
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
// userid 是用户的域账号  
// oneid 是用户的唯一id  
// userType 0是同时有大单+普惠 1是只有大单  2是只有普惠   
// menu是在普惠的时候才有的参数  1是业务+流程  2是只有流程
const userid = ref('')
const oneid = ref('')
const userType = ref('')
const menu = ref('')
const isWindows = ref(false)
const isPad = ref(false)
const baseUrl = ref(import.meta.env.VITE_DOMAIN_URL)
const env = import.meta.env.MODE
console.log('当前环境:', env, baseUrl.value)
onLoad((options) => {
  console.log('onLoad', options, navigator.userAgent)
  userid.value = options.userid || ''
  oneid.value = options.oneid || ''
  userType.value = options.userType || ''
  menu.value = options.menu || ''
  isWindows.value = navigator.userAgent.includes('WindowsWechat')
  isPad.value = navigator.userAgent.includes('iPad')

  if (userType.value == '0') {
    // 如果是同时有大单和普惠的用户，默认显示大对公
    activeTab.value = 0
  } else if (userType.value == '1') {
    // 如果只有大单，显示大对公
    activeTab.value = 0
  } else if (userType.value == '2') {
    // 如果只有普惠，显示医疗科技
    activeTab.value = 1
}
})

const windowHeight = ref(0)
onMounted(() => {
  getData()
  windowHeight.value = uni.getSystemInfoSync().windowHeight
  console.log('windowHeight', windowHeight.value)
  startCarousel()
})

// 组件卸载前清除定时器
onBeforeUnmount(() => {
  stopCarousel()
})

// 顶部导航数据
const tabs = ['大对公', '医疗科技']
const activeTab = ref(0)

const getFormattedDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的，所以要加1，并且需要保证是两位数
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const truncateText = (dateString) => {
  let month = dateString.match(/\d{2}$/)[0];
  month = month.replace(/^0/, '');
  return month;
}

const data = ref({})
const eventList = ref([])
const getData = async () => {
  try {
    const res = await uni.request({
      url: `${import.meta.env.VITE_API_BASE_URL}biz-crm-market/mobile/market/mobileWork/list`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        "oneid": oneid.value
      }
    })

    console.log('获取数据成功:', res)
    if (res.data?.code == "00000000") {
      data.value = res.data.data || {}
      eventList.value = data.value[selectedDate.value].planList || []
    } else {
      console.error('获取数据失败:', res.message)
    }
  } catch (error) {
    console.error('请求数据失败1:', error)
  }
}

// 日历相关数据
const weekDays = ['一', '二', '三', '四', '五', '六', '日']
const today = ref(getFormattedDate())
const selectedDate = ref('')
selectedDate.value = today.value
// 模拟事件数据


const currentEventIndex = ref(0)
const timer = ref(null)

// 计算当前显示的事件
const currentEvent = computed(() => eventList.value[currentEventIndex.value])

// 切换到下一个事件
const showNextEvent = () => {
  currentEventIndex.value = (currentEventIndex.value + 1) % eventList.value.length
}

// 启动定时器
const startCarousel = () => {
  timer.value = setInterval(showNextEvent, 5000) // 每3秒切换一次
}

// 停止定时器
const stopCarousel = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

// 选择日期
const selectDate = (key) => {
  selectedDate.value = key
  eventList.value = data.value[key].planList || []
  currentEventIndex.value = 0
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

  &.normal {
    background: url("/static/image/zy-workbench/background.png") no-repeat center bottom;
    background-size: cover;
  }

  &.windows {
    background-size: cover;
    background-color: #ffffff;
    .header {
      .left {
        display: flex;
        align-items: center;

        uni-image {
          display: block;
        }
      }
    }

    .content {
      .left {

        .title {
          padding-left: 10px;

          uni-text {
            padding-left: 5px;
          }
        }
      }

      .icon-row {
        &:first-child {
          margin-bottom: 18px;
          margin-top: 6px;
        }
      }
    }
  }

  /* 添加标题栏样式 */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: transparent;
    height: 40px;
    padding: 10px;
    box-sizing: border-box;

    .left {
      font-size: 13px;
      color: #a3a6a9;
      font-weight: 400;
    }

    .right {
      a {
        text-decoration: none;
        font-size: 12px;
        color: #333;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        .text {
          margin-left: 5px;
        }
      }
    }
  }

}

.tabs {
  display: flex;
  justify-content: space-around;
  width: 129px;
  background-color: #F1F1F1;
  padding: 4px 3px;
  border-radius: 4px;

  .tab {
    font-size: 12px;
    color: #999999;
    position: relative;
    width: 60px;
    height: 20px;
    line-height: 20px;
    text-align: center;

    &.active {
      color: #333333;
      font-weight: 500;
      background-color: #fff;
      border-radius: 4px;
    }
  }
}

.section {
  background-color: #F0FAFF;
  border-radius: 4px;
  padding: 12px 16px 0;
  margin: 5px 10px 0;

  &.windows {
    padding: 2px 16px 0;
    margin: 0 10px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: #333333;
    font-weight: bold;

    a {
      text-decoration: none;
    }

    .more {
      font-weight: normal;
      display: flex;
      align-items: center;
      text-decoration: none;
      color: #333333;
    }
  }
}

.calendar {
  margin-top: 10px;
  &.windows {
    margin-top: 5px;
    .days {
      display: flex;
      justify-content: space-around;;
      margin-bottom: 2px;
    }
  }

  .week-days {
    display: flex;
    justify-content: space-around;;
    text-align: center;
    margin-bottom: 12px;
    font-size: 12px;
    color: #999;
  }

  .days {
    display: flex;
    justify-content: space-around;;
    margin-bottom: 12px;
  }

  .day {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #000000;
    border-radius: 4px;
    position: relative;
    width: 40px;
    height: 52px;
    font-weight: bold;

    &.selected {
      background-image: linear-gradient(142deg, #4891F7 0%, #94D5F6 100%);
      color: #fff;

      .day-header {
        color: #fff;
      }

    }

    .day-header {
      font-size: 12px;
      color: #999999;
    }

  }

  .event {
    padding: 12px 0;
    border-top: 1px solid #D7EBF5;

    display: flex;
    justify-content: space-between;
    align-items: center;

    .left {
      display: flex;
      align-items: center;
      flex: 1;

      .event-carousel {
        position: relative;
        height: 24px; // 固定高度，避免内容切换时的抖动
        line-height: 24px;
        width: 100%;
        overflow: hidden;
      }

      .event-item {
        position: absolute;
        width: 100%;
        display: flex;
        align-items: center;
        height: 24px;
        a {
          position: absolute;
          width: 100%;
          display: flex;
          align-items: center;
          height: 24px;
          text-decoration: none;
        }
      }

      .event-dot-container {
        display: flex;
        align-items: center;
        width: 12px;
        height: 24px;
      }
      .event-dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: transparent;
        // margin-right: 8px;

        &.red {
          background: red;
        }
        &.orange {
          background: #FF6430;
        }
      }

      .event-time {
        font-size: 12px;
        color: #999999;
        margin-right: 8px;
        height: 24px;
      }

      .event-title {
        font-size: 13px;
        color: #333333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

    }


    .right {
      width: 72px;
      margin-left: 5px;
    }

    .event-btn {
      width: 72px;
      height: 24px;
      line-height: 24px;
      text-align: center;
      background-color: #0F56D5;
      border-radius: 4px;
      font-size: 12px;
      color: #fff;

      a {
        text-decoration: none;
        color: #fff;
      }
    }
  }
}

// 滑动过渡效果
.slide-fade-enter-active {
  transition: all 0.5s ease;
}

.slide-fade-leave-active {
  transition: all 0.5s ease;
}

.slide-fade-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.statistics {
  display: flex;
  flex-direction: row;
  padding-top: 45px;
  padding-right: 30px;

  &.cards {
    padding-top: 16px;
    padding-right: 20px;
    &.windows {
      padding-top: 0;
      .card-item {
        height: 100px;
      }
      uni-image {
        display: block;
        margin: 9px auto 0;
      }
    }
  }

  .left {
    flex: 1;
  }

  .icons {
    width: 110px;
    display: flex;
    justify-content: space-between;
    text-align: center;

    .text {
      font-size: 13px;
      color: #333333;
      font-weight: bold;
      margin-top: 8px;
    }
  }

  .cards {
    width: 168px;
    display: flex;
    justify-content: space-between;
    text-align: center;

    .card-item {
      width: 80px;
      height: 120px;
      background: #F4F5F9;
      border-radius: 4px;
      text-decoration: none;
    }

    uni-image {
      display: block;
      margin: 19px auto 0;
    }

    .count {
      font-size: 30px;
      color: #0F56D5;
      font-weight: bold;
      margin-top: 8px;
    }

    .text {
      font-size: 13px;
      color: #999999;
    }
  }
}
</style>
