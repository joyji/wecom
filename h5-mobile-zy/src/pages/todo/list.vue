<template>
  <view class="container">
    <!-- 搜索框部分，固定在顶部 -->
    <view class="fixed-search-box" >
      <uni-search-bar ref="searchBar" style="padding: 5px 12px" :isSearch="isSearch" @input="searchConfirm" @clear="clear"
        filterButton="always" placeholder="流程信息、发起人" @filter="filter" :showFilter="true"
        :cancelButton="'false'"></uni-search-bar>
    </view>

    <!-- 占位元素，防止内容被固定头部遮挡 -->
    <view class="search-placeholder"></view>

    <!-- 列表部分，使用mescroll-body实现下拉刷新和上拉加载 -->
    <mescroll-uni ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="upCallback" :up="upOption" :down="downOption" 
      style="padding-top: 54px;" >
      <!-- 加载骨架图：首次接口返回前显示 -->
      <view v-if="loading" class="skeleton-list">
        <view class="skeleton-item">
          <view class="skeleton-icon shimmer"></view>
          <view class="skeleton-content">
            <view class="skeleton-line shimmer" style="width: 100%"></view>
            <view class="skeleton-line shimmer" style="width: 75%"></view>
          </view>
        </view>
        <view class="skeleton-item">
          <view class="skeleton-icon shimmer"></view>
          <view class="skeleton-content">
            <view class="skeleton-line shimmer" style="width: 100%"></view>
            <view class="skeleton-line shimmer" style="width: 75%"></view>
          </view>
        </view>
      </view>
      <view class="todo-list" v-else-if="todoList.length>0">
        <view class="todo-item" v-for="(item, index) in todoList" :key="index" @click="getUrl(item)">
               <view class="todo-icon">
           <image :src="systemCodeImg[item?.systemCode]" style="width: 37px; height: 37px"
              mode="aspectFit" v-if="item?.systemCode"/>
              <image :src="systemCodeDefaultImg" style="width: 37px; height: 37px"
              mode="aspectFit" v-else/>
          </view>
          <view class="todo-content">
            <view class="todo-title-row">
              <view class="todo-title">{{ item.procName }}</view>
              <view class="todo-info">
                <view class="todo-meta">
                  <text class="todo-user">{{ item.procInitiatorName }}</text>
                  <text class="divider">|</text>
                  <text class="todo-time">{{ item.arriveTimeStr }}</text>
                </view>
              </view>
            </view>
            <view class="todo-desc">{{ item.procTitle }}</view>
          </view>
        </view>
      <view v-if="isShowText" class="bottom_container">
      <view class="bottom_spacer"></view>
      <view class="bottom_text">仅展示2025年1月1日起的待办数据</view>
      <view class="bottom_spacer"></view>
    </view>
      </view>
       <view v-else class="empty-data-container">
    <image
      class="empty-image"
      src="/static/image/zy-workbench/todo/noData.png"
      mode="widthFix"
    ></image>
    <text class="empty-text">暂无待办</text>
  </view>
    </mescroll-uni>
    

    <!-- 筛选抽屉 -->
    <uni-drawer ref="drawer" mode="left" :width="'80%'" @change="drawerChange">
      <view class="filter-container">
        <scroll-view class="filter-content" :scroll-y="true">
          <!-- 到达时间筛选 -->
          <view class="filter-item tag">
            <view class="filter-label">发起时间</view>
            <view class="filter-control">
              <view class="filter-options-row">
                <view v-for="(item, index) in arrivalTimeOptions" :key="index" class="filter-tag"
                  :class="{ 'filter-tag-active': item.selected }" @click="selectArrivalTime(index)">
                  {{ item.name }}
                </view>
              </view>

              <!-- 自定义日期范围选择 - 改用uni-datetime-picker -->
              <view class="custom-date-range-container" v-if="showCustomDateRange">
                <zy-datetime-picker
                  :zyUniCalendarFlotItemWeeksBoxItem="{ height: '40px', width: '40px' }"
                  :changeClose="true"
                  v-model="dateRange"
                  type="daterange"
                  @change="handleDateRangeChange"
                />
              </view>
            </view>
          </view>

          <!-- 发起人筛选 -->
          <view class="filter-item">
            <view class="filter-label">发起人</view>
            <view class="filter-control">
              <input class="filter-input" type="text" v-model="filterObj.procInitiatorName" placeholder="请输入姓名、用户名" />
            </view>
          </view>

          <!-- 流程标题筛选 -->
          <view class="filter-item">
            <view class="filter-label">流程标题</view>
            <view class="filter-control">
              <input class="filter-input" type="text" v-model="filterObj.procTitle" placeholder="请输入标题" />
            </view>
          </view>

          <!-- 流程状态筛选 -->
          <view class="filter-item tag">
            <view class="filter-label">系统类型</view>
            <view class="filter-control">
              <view class="filter-options-row">
                <view v-for="(item, index) in systemCode" :key="item.id" class="filter-tag"
                  :class="{ 'filter-tag-active': item.selected }" @click="selectSystemType(index)">
                  {{ item.label }}
                </view>
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="filter-footer">
          <button class="btn-reset" @click="resetFilter">重置</button>
          <button class="btn-confirm" @click="confirmFilter">确定</button>
        </view>
      </view>
    </uni-drawer>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, getCurrentInstance } from 'vue';
import { onLoad, onShow, onHide } from '@dcloudio/uni-app';
import wwsdk from '@/utils/wwsdk'
import MescrollBody from '@/uni_modules/mescroll-uni/components/mescroll-body/mescroll-body.vue';
import UniDrawer from '@/uni_modules/uni-drawer/components/uni-drawer/uni-drawer.vue';
import ZyDatetimePicker from '@/components/zy-datetime-picker/zy-datetime-picker.vue';
import UniDatetimePicker from '@/uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.vue';
import UniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue';
import { getMsgFlowPageList,getMsgFlow,getDictDataAPi,getDictDataImgAPi,getFilePage,getTokenBySystemCode,getDictType } from '@/common/ts/api/wwApi'

const { proxy } = getCurrentInstance() as any

// 常量定义
const STORAGE_KEY_TOKEN = 'token';
const RETRY_DELAY = 200;
let queryParams: Record<string, string> = {} || uni.getStorageSync('queryParams');
// 全局参数对象

// 处理页面参数
function handlePageOptions(options: Record<string, any> | undefined): void {
  if (options?.userId) {
    Object.keys(options).forEach(key => {
      queryParams[key] = String(options[key]);
    });

    uni.setStorageSync('queryParams', queryParams);
    console.log("🚀 ~ 处理后的 queryParams:", queryParams);
  } else {
    console.log('未传递参数');
    queryParams = uni.getStorageSync('queryParams') || {};
  }
}


// 初始化企业微信 SDK
const initWxWorkSDK = async () => {
  const appid = import.meta.env.VITE_CODE_APP_ID;
  const agentId = import.meta.env.VITE_AUTH_AGENT_ID;

  try {
    const res = await wwsdk.getAuthCode(appid, agentId);
    console.log("🚀 ~ 初始化企业微信SDK成功:", res);
     return res;
  } catch (error) {
    console.error("🚀 ~ 初始化企业微信SDK失败:", error);
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
    console.log('url', url);
    const authUrl = wwsdk.getAuthUrl(appid, agentId, url)
    window.location.href = authUrl;
  }
}
const handleClick = (item:any) => {
  console.log('handleClick', item)
  uni.showToast({
    title: '暂未支持移动审批，请在PC处理',
    icon: 'none'
  })
}

// 页面数据加载主函数
const firstFunction = async () => {
  try {
    // 获取当前页面参数
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = currentPage.options;
    handlePageOptions(options);

    // 先尝试调用接口获取数据
    const res = await getTodoList();
    console.log('res-firstFunction', res);
  } catch (error: any) {
    console.log('getTodoList调用失败', error);
    // 判断是否是token失效错误
    if (error && error.type === 'TOKEN_EXPIRED') {
      console.log('token失效，开始进行企业微信网页授权');
      // token失效，进行企业微信网页授权
      const res: any = await initWxWorkSDK();
      console.log('res-firstFunction-重新授权', res);
      if (res) {
        // 授权成功后重新获取数据
        await getTodoList();
      } else {
        console.log('初始化企业微信SDK失败');
      }
    } else {
      // 其他错误，显示错误信息
      uni.showToast({
        title: error.message || '数据加载失败',
        icon: 'none'
      });
    }
  }
};

// 页面加载
onLoad(async (options: any) => {
  console.log('onLoad---初始化企业微信SDK');
  console.log('页面加载完成', navigator.userAgent)
  isPhone.value = (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') ) ? true : false
  handlePageOptions(options);
});
const isPhone = ref()
const isTransition = ref()
const isBack = ref()

// 页面显示
onShow(() => {
  console.log('过渡页面显示show-', proxy.$global.isTransition)
    isTransition.value = proxy.$global.isTransition
    isBack.value = proxy.$global.isBack
    if (isPhone.value) {
        if (proxy.$global.isTransition) { // 检查全局变量的值
            console.log('isTransition为true，执行关闭窗口操作')
            proxy.$global.isTransition -= 1
            if(isBack.value){
              proxy.$global.isBack = false
            }else{
              // wwsdk.ww.closeWindow() // 执行关闭窗口操作
            }
        } else {
            proxy.$global.isTransition += 1
            console.log('isTransition为false，不执行关闭窗口操作')
        }
    }
  //   uni.showToast({
  //   title: `isPhone:${isPhone}~~~isTransition:${proxy.$global.isTransition}`,
  //   icon: 'none'
  // })
  console.log('list页面显示', new Date(), location.href);
  firstFunction();
});

// 定义待办事项接口
interface TodoItem {
  icon: string;
  title: string;
  desc: string;
  user: string;
  time: string;
  mobileApproval: any;
  jumpType: any;
  jumpPath: any;
  unread?: boolean;
  urgent?: boolean;
}

// 定义mescroll实例接口
interface MescrollInstance {
  resetUpScroll: () => void;
  endSuccess: () => void;
  setNoMore?: (noMore: boolean) => void;
  endErr: () => void;
  endBySize: (curSize: number, totalSize: number) => void;
  num: number;
  size: number;
}

// 搜索相关
const searchBar = ref<any>(null);
const isSearch = ref(false);
const keyword = ref('');
const pageNum = ref(1);
const pageSize = ref(10);

// 抽屉相关
const drawer = ref<any>(null);

// 筛选条件
const taskTypes = ref([
  { name: '全部', selected: true },
  { name: '业务招待', selected: false },
  { name: '项目授信', selected: false },
  { name: '客户共享', selected: false }
]);

const filterObj = reactive({
  taskType: '全部',
  arriveTimeStart: '',
  arriveTimeEnd: '',
  procInitiatorName: '', // 发起人
  procTitle: '', // 流程标题
  systemCode: '全部' // 系统类型
});

// 到达时间选项
const arrivalTimeOptions = ref([
  { name: '全部', selected: true },
  { name: '今日', selected: false },
  { name: '本周', selected: false },
  { name: '本月', selected: false },
  { name: '自定义', selected: false }
]);

// 系统类型选项
const systemCode = ref([]);
// const systemCodeImg = reactive({
//   CRM: new URL('/src/static/image/zy-workbench/todoImg/CRM.png', import.meta.url).href,
//   ELEASING: new URL('/src/static/image/zy-workbench/todoImg/ELEASING.png', import.meta.url).href,
//   MLEASING: new URL('/src/static/image/zy-workbench/todoImg/MLEASING.png', import.meta.url).href,
//   OA: new URL('/src/static/image/zy-workbench/todoImg/OA.png', import.meta.url).href,
// });
const systemCodeImg = ref({}) as any;
const systemCodeDefaultImg = ref('') as any;
systemCodeDefaultImg.value = new URL('/src/static/image/zy-workbench/todoImg/CRM.png', import.meta.url).href
// 是否显示自定义日期范围
const showCustomDateRange = ref(false);

// 日期范围选择
const dateRange = ref(['', '']);

// 获取今天的日期字符串
const getToday = (): string => {
  return formatDate(new Date());
};

// 处理日期范围变化
const handleDateRangeChange = (e: [string, string]) => {
  console.log("🚀 ~ handleDateRangeChange ~ e:", e)
  filterObj.arriveTimeStart = e[0];
  filterObj.arriveTimeEnd = e[1];
};

// mescroll实例对象
const mescrollRef = ref<{ resetUpScroll: () => void } | null>(null);

// 列表数据
const todoList = ref<TodoItem[]>([]);
const isShowText = ref(false);
// 首次加载骨架图显示控制
const loading = ref(true);
// 上拉加载的配置
const upOption = reactive({
  use: true, // 是否启用上拉加载
  auto: false, // 是否在初始化完毕之后自动执行上拉加载的回调
  page: {
    num: 0, // 当前页码,默认0,回调之前会加1,即callback(page)会从1开始
    size: 10 // 每页数据的数量
  },
  noMoreSize: 5, // 配置列表的总数量要大于等于noMoreSize才显示无更多数据
  empty: {
    tip: '', // 提示
    btnText: '' // 按钮
    // tip: '暂无相关数据', // 提示
    // btnText: '重新加载' // 按钮
  },
  textLoading: '加载中...',
  // textNoMore: '-- 没有更多了 --'
  textNoMore: ''
});
const downOption = reactive({
  use: true, // 是否启用上拉加载
  auto: false, // 是否在初始化完毕之后自动执行上拉加载的回调
  page: {
    num: 1, // 当前页码,默认0,回调之前会加1,即callback(page)会从1开始
    size: 10, // 每页数据的数量
    noMoreSize: 5 
  }
});

// mescroll组件初始化的回调
const mescrollInit = (mescroll: MescrollInstance) => {
  // 如果需要在页面挂载后就加载数据，则不需要手动调用
};

// 下拉刷新的回调
const downCallback = async (mescroll: MescrollInstance) => {
  console.log('下拉刷新的回调');
    pageNum.value = 0
    pageSize.value = 10
      mescroll.resetUpScroll();
};

// 上拉加载的回调
const upCallback = async (mescroll: MescrollInstance) => {
  try {
    console.log('上拉加载的回调');
    const Num = mescroll.num; // 页码, 从1开始
    console.log("🚀 ~ upCallback ~ Num:", Num)
    const Size = mescroll.size; // 每页数据条数
    pageNum.value = Num
    pageSize.value = Size
    // mescroll.resetUpScroll();
     let parms = {
      mixInfo:keyword.value??'',
    ...queryParams,
    ...filterParams,
      pageNo:pageNum.value,
      pageSize:pageSize.value
    }
  if(!parms.systemCode||parms.systemCode[0]==''||parms.systemCode=='全部'){
    parms.systemCode = null
  }
    let curPageData: TodoItem[] = [];
    triggerEvent('YDD202508191050019','待办中心-待办详情页-滑动搜索',{...parms})
    const res = await getMsgFlowPageList(parms)
    if (res.code==401) {
      // 判断是token失效错误
        console.log('token失效，开始进行企业微信网页授权');
        // 触发重新授权
        await firstFunction();
    } else {
      curPageData = res.data.list
      console.log('1111111111111111111111111111111111111111');
      if (Num === 1 ){
        todoList.value = curPageData;
        mescroll.endSuccess();
        mescroll.endBySize(todoList.value.length, res.data.total)
      }else{
        // 结束加载并指定是否有更多数据
        todoList.value = todoList.value.concat(curPageData);
        mescroll.endBySize(curPageData.length, res.data.total); // res.data.total 是总数据量
        mescroll.endSuccess();
      }
      if(curPageData.length < Size){
        isShowText.value = true
      }else{
        isShowText.value = false
      }
      // 第一页数据过少,显示无更多数据
      // if (Num === 1 && curPageData.length < Size) {
      //   mescroll.endBySize(curPageData.length, Size);
      // }
    }

  } catch (e: any) {
      // 结束加载并提示错误
      mescroll.endErr();
      console.error('上拉加载失败:', e);
  }
};
const getDayDifference = (date1: Date, date2: Date): number =>{
  return Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
}
const getTime = ( timestamp:any,type:any) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // 构造日期对象
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inputDate = new Date(timestamp);
  inputDate.setHours(0, 0, 0, 0);

  const diffDays = getDayDifference(today,inputDate) 
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
const getDictData= async () => {
  try {
    const res = await getDictDataAPi()
    systemCode.value = res.data
    if(filterObj.systemCode=='全部'||!filterObj.systemCode){
      selectSystemType(-1);
    }else{
      for (let i = 0; i < systemCode.value.length; i++) {
        if(systemCode.value[i].value==filterObj.systemCode){
            selectSystemType(i);
        }
        
      }
    }
  } catch (error) {
    console.log("🚀 ~ getDictData ~ error:", error)
  }
}

const getTodoList= async (val?:any) => {
  const token = uni.getStorageSync('token')
  console.log("🚀 ~  ~ token:", token)
  loading.value = true
  let parms = {
    mixInfo:keyword.value??'',
    ...queryParams,
    ...filterParams,
    pageNo:pageNum.value==0?'1':pageNum.value,
    pageSize:pageSize.value
  }
  if(!parms.systemCode||parms.systemCode[0]==''||parms.systemCode=='全部'){
    parms.systemCode = null
  }
  console.log("🚀 ~  ~ parms:", parms)
  
  // 调用接口，如果失败会自动抛出错误
  const res = await getMsgFlowPageList(parms)
  
  if (res.code==401) {
    // 判断是token失效错误
      console.log('token失效，开始进行企业微信网页授权');
      // token失效，进行企业微信网页授权
      const res: any = await initWxWorkSDK();
      console.log('res-firstFunction-重新授权', res);
      if (res) {
        // 授权成功后重新获取数据
        await getTodoList();
      } else {
        console.log('初始化企业微信SDK失败');
      }
  } else {
    const dictRes = await getDictType({type:'system_url'})
    console.log("🚀 ~ getTodoList ~ dictRes:", dictRes)
    if (dictRes.data.length > 0) {
    systemCodeImg.value = dictRes.data.reduce((acc:any, item:any) => {
        acc[item.label] = item.value
        return acc
      }, {})
    }
    todoList.value = res.data.list
    console.log('getTodoList成功加载数据');
    console.log("🚀 ~  ~ res.data.list.length:", res.data.list.length)
    console.log("🚀 ~  ~ queryParams.pageSize:", pageSize.value)
    if(res.data.list.length < pageSize.value){
      isShowText.value = true
    }else{
      isShowText.value = false
    }
    // 主数据返回后关闭骨架图
    loading.value = false
  }
}
const getTodoListTTT= async (val:any) => {
  console.log("🚀 ~ getTodoListTTT ~ val:", val)
  if(!val.systemCode||val.systemCode[0]==''||val.systemCode=='全部'){
    val.systemCode = null
  }
  // 调用接口，如果失败会自动抛出错误
  const res = await getMsgFlowPageList({mixInfo:keyword.value??'',...val})
  todoList.value = res.data.list
  console.log('getTodoListTTT成功加载数据');

  if(res.data.list.length < val.pageSize){
    isShowText.value = true
  }else{
    isShowText.value = false
  }
}
// 补充搜索方法
const searchConfirm = async (e: any) => {
  pageNum.value = 1
  pageSize.value = 10
  keyword.value = e;
  triggerEvent('YDD202508191050016','待办中心-待办详情页-头部输入搜索',{ mixInfo:keyword.value})
  try {
    await getTodoList();
  } catch (error: any) {
    // 如果是token失效，触发重新授权
    if (error && error.type === 'TOKEN_EXPIRED') {
      console.log('搜索时token失效，重新授权');
      await firstFunction();
    } else {
      console.error('搜索失败:', error);
    }
  }
};

// 清空搜索
const clear = async () => {
  keyword.value = '';
  triggerEvent('YDD202508191050017','待办中心-待办详情页-头部清空搜索',{ mixInfo:''})
  try {
    await getTodoList();
  } catch (error: any) {
    // 如果是token失效，触发重新授权
    if (error && error.type === 'TOKEN_EXPIRED') {
      console.log('清空搜索时token失效，重新授权');
      await firstFunction();
    } else {
      console.error('清空搜索失败:', error);
    }
  }
};

// 搜索数据
const searchData = () => {
  // 重置列表数据
  mescrollRef.value && mescrollRef.value.resetUpScroll();
};

// 打开筛选抽屉
const filter = () => {
    triggerEvent('YDD202508191050013','待办中心-待办详情页-筛选')
    getDictData().then(()=>{
      drawer.value.open();
    })
};

// 抽屉状态变化回调
const drawerChange = (status: boolean) => {
  console.log('抽屉状态:', status ? '打开' : '关闭');
};

// 选择任务类型
const selectTaskType = (index: number) => {
  // 重置所有选项
  taskTypes.value.forEach(item => {
    item.selected = false;
  });
  // 设置选中项
  taskTypes.value[index].selected = true;
  filterObj.taskType = taskTypes.value[index].value;
};

// 选择到达时间
const selectArrivalTime = (index: number) => {
  // 重置所有选项
  arrivalTimeOptions.value.forEach(item => {
    item.selected = false;
  });
  // 设置选中项
  arrivalTimeOptions.value[index].selected = true;

  // 获取当前日期
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayStr = formatDate(today);

  // 根据选中项设置日期范围
  if (arrivalTimeOptions.value[index].name === '全部') {
    filterObj.arriveTimeStart = '';
    filterObj.arriveTimeEnd = '';
    showCustomDateRange.value = false;
  } else if (arrivalTimeOptions.value[index].name === '今日') {
    filterObj.arriveTimeStart = todayStr;
    filterObj.arriveTimeEnd = todayStr;
    showCustomDateRange.value = false;
  } else if (arrivalTimeOptions.value[index].name === '本周') {
    // 计算本周的开始日期（星期一）
    const day = today.getDay() || 7; // 获取星期几，如果是0（星期日）则设为7
    const diff = today.getDate() - day + 1; // 计算与本周一相差的天数
    const monday = new Date(today.setDate(diff));

    filterObj.arriveTimeStart = formatDate(monday);
    filterObj.arriveTimeEnd = todayStr;
    showCustomDateRange.value = false;
  } else if (arrivalTimeOptions.value[index].name === '本月') {
    // 计算本月的开始日期
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

    filterObj.arriveTimeStart = formatDate(firstDay);
    filterObj.arriveTimeEnd = todayStr;
    showCustomDateRange.value = false;
  } else if (arrivalTimeOptions.value[index].name === '自定义') {
    showCustomDateRange.value = true;
    // 如果已有日期范围，则同步到dateRange
    if (filterObj.arriveTimeStart && filterObj.arriveTimeEnd) {
      dateRange.value = [filterObj.arriveTimeStart, filterObj.arriveTimeEnd];
    }
  }
};

// 日期格式化函数 yyyy-MM-dd
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 打开日期选择器 - 这个方法不再需要，由uni-datetime-picker组件接管
// 但保留函数以避免影响其他可能调用的地方
const openDatePicker = (type: 'start' | 'end') => {
  // 由uni-datetime-picker接管，此方法不再需要实现
  console.log('使用uni-datetime-picker替代');
};
  let filterParams: Record<string, any> = {};

// 确认筛选
const confirmFilter = async () => {
  drawer.value.close();

  // 准备筛选参数

  // 处理日期范围
  // if (filterObj.arriveTimeStart) {
    filterParams.arriveTimeStart = filterObj.arriveTimeStart;
  // }

  // if (filterObj.arriveTimeEnd) {
    filterParams.arriveTimeEnd = filterObj.arriveTimeEnd;
  // }

  // 处理发起人
  // if (filterObj.procInitiatorName) {
    filterParams.procInitiatorName = filterObj.procInitiatorName.trim();
  // }

  // 处理流程标题
  // if (filterObj.procTitle) {
    filterParams.procTitle = filterObj.procTitle.trim();
  // }

  // 处理系统类型
  // if (filterObj.systemCode !== '全部') {
    filterParams.systemCode = filterObj.systemCode.split(',');
  // }
  filterParams.pageNo =1
  filterParams.pageSize =10
  console.log('筛选参数:', filterParams);
  console.log('筛选参数:', {...queryParams,...filterParams});
  // filterParams.push({...queryParams})

  triggerEvent('YDD202508191050014','待办中心-待办详情页-筛选项确认',{...queryParams,...filterParams})
  // 使用筛选条件进行搜索
  try {
    await getTodoListTTT({...queryParams,...filterParams});
  } catch (error: any) {
    // 如果是token失效，触发重新授权
    if (error && error.type === 'TOKEN_EXPIRED') {
      console.log('确认筛选时token失效，重新授权');
      await firstFunction();
    } else {
      console.error('确认筛选失败:', error);
    }
  }
};

// 重置筛选条件
const resetFilter = async () => {
  // 重置到达时间
  selectArrivalTime(0);

  // 重置发起人
  filterObj.procInitiatorName = '';
  filterParams.procInitiatorName = '';

  // 重置流程标题
  filterObj.procTitle = '';
  filterParams.procTitle = '';

  // 重置系统类型
  selectSystemType(-1);
  filterObj.systemCode = '全部'
  filterParams.systemCode = '全部'
  // 重置日期范围
  dateRange.value = ['', ''];
  filterObj.arriveTimeStart = '';
  filterObj.arriveTimeEnd = '';
  filterParams.arriveTimeStart = '';
  filterParams.arriveTimeEnd = '';
  // 关闭自定义日期范围
  showCustomDateRange.value = false;
  let parms = {
    mixInfo:keyword.value??'',
    ...queryParams,
    ...filterParams,
    pageNo:pageNum.value==0?'1':pageNum.value,
    pageSize:pageSize.value
  }
  if(!parms.systemCode||parms.systemCode[0]==''||parms.systemCode=='全部'){
    parms.systemCode = null
  }
  console.log("🚀 ~  ~ parms:", parms)
  triggerEvent('YDD202508191050018','待办中心-待办详情页-筛选项重置',{ ...parms})
  try {
    await getTodoList();
  } catch (error: any) {
    // 如果是token失效，触发重新授权
    if (error && error.type === 'TOKEN_EXPIRED') {
      console.log('重置筛选时token失效，重新授权');
      await firstFunction();
    } else {
      console.error('重置筛选失败:', error);
    }
  }
};

// 选择系统类型
const selectSystemType = (index: number) => {
  // 重置所有选项
  systemCode.value.forEach(item => {
    item.selected = false;
  });
  if(index>=0){
 // 设置选中项
    systemCode.value[index].selected = true;
    filterObj.systemCode = systemCode.value[index].value;
    console.log("🚀 ~ selectSystemType ~ filterObj.systemCode:", filterObj.systemCode)
  }else{
    filterObj.systemCode = '';
  }
 
};
const getUrl =async (item : any) => {
  triggerEvent('YDD202508191050015','待办中心-待办详情页-点击待办',{...item})
    try {
      const res = await getTokenBySystemCode({
        systemCode:item.systemCode,
        userId:queryParams.userId
      })
      goToDetail(item,decodeURIComponent(res.data))
    } catch (error) {
      goToDetail(item)
      console.log("🚀 ~ getUrl ~ error:", error)
    }
}
// 跳转详情
const goToDetail = async (item: TodoItem,obj?:any) => {
  try {
    if(!item.mobileApproval && item.mobileApproval != null){
      uni.showToast({
        title: '暂未支持移动审批，请在PC处理',
        icon: 'none'
      })
      return
    }
    if(item && item.jumpPath && item.jumpPath.includes("/pages/index/transition")){
      // let result = ''
      // if (item.jumpPath.includes("?path=")) {
      //   result = item.jumpPath.split("?path=")[1];
      // }
       let result = ''
          const url = item.jumpPath;
          const equalIndex = url.indexOf('=');
          if (equalIndex !== -1) {
            result = url.substring(equalIndex + 1); // 取出第一个 "=" 之后的所有内容
          }
      //  result = decodeURIComponent(result)+obj;
       result = decodeURIComponent(result+obj);
      const agentId = import.meta.env.VITE_AGENT_ID
      const jumpTime = Date.now()
      console.log("🚀 ~ onMounted ~ jumpTime:", jumpTime)
      console.log("🚀 ~ onMounted ~ jumpTime:", result)
      // setTimeout(async() => {
        await wwsdk.wwConfig('ww6c12cd389a083f32', agentId)
      const res = await wwsdk.ww.launchMiniprogram({
           appid: import.meta.env.VITE_MINI_ID,
          //  path: `${result}&jumpTime=${jumpTime}`
           path: result
      }).then(()=>{
        if (isPhone.value) {
          proxy.$global.isBack = true
        }
      })
      console.log("🚀 ~ goToDetail ~ res:", res)
      // }, 10000);
    }else{
      let result = '';      // 存储第一个 "=" 之后的内容
      let firsturl = '';    // 存储第一个 "=" 之前的内容
      let lasturl = '';
      const url = item.jumpPath;
      const equalIndex = url.indexOf('=');
      if (equalIndex !== -1) {
        result = url.substring(equalIndex + 1);        // 第一个 "=" 后的内容
        firsturl = url.substring(0, equalIndex);       // 第一个 "=" 前的内容
        lasturl =  firsturl+'='+ decodeURIComponent(result)
      } else {
        lasturl =  url
      }
      window.location.href = lasturl+obj ;
    }
  } catch (error) {
    console.log("🚀 ~ goToDetail ~ error:", error)
  }
};
const baseUrl = ref(import.meta.env.VITE_DOMAIN_URL)
</script>

<style scoped lang="scss">
page {
  margin: 0;
  background-color: #F6F7F8;
}

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 固定在顶部的搜索框 */
.fixed-search-box {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  z-index: 100;
}

/* 占位元素，防止内容被固定头部遮挡 */
.search-placeholder {
  width: 100%;
  height: 42px;
  margin-bottom: 12px;
  /* 与搜索框高度一致 */
}

.todo-list {
  padding: 0 12px;
}

/* 骨架图样式 */
.skeleton-list {
  padding: 0 12px;
}
.skeleton-item {
  display: flex;
  background-color: #FFFFFF;
  border-radius: 4px;
  padding: 12px 12px 14px 9px;
  margin-bottom: 10px;
  min-height: 43px;
}
.skeleton-icon {
  width: 37px;
  height: 37px;
  border-radius: 8px;
  background-color: #f2f2f2;
  margin-right: 15px;
}
.skeleton-content { flex: 1; }
.skeleton-line {
  height: 16px;
  background-color: #f5f5f5;
  margin-top: 6px;
  &:first-child {
    margin-top: 0;
  }
}
.shimmer { position: relative; overflow: hidden; }
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
@keyframes shimmer-move { 0% { transform: translateX(0); } 100% { transform: translateX(260px); } }

.todo-item {
  display: flex;
  background-color: #FFFFFF;
  border-radius: 4px;
  padding: 12px 12px 14px 9px;
  margin-bottom: 10px;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-height: 43px;
  &:active {
    transform: scale(0.98);
    box-shadow: 0 1rpx 5rpx rgba(0, 0, 0, 0.03);
  }
  .todo-item-pc,
  a {
    width: 100%;
    display: flex;
    align-items: center;
    height: 43px;
    text-decoration: none;
  }
}

.todo-icon {
  width: 37px;
  height: 37px;
  margin-right: 15px;
  margin-top: 2px;
  position: relative;

  image {
    width: 100%;
    height: 100%;
    border-radius: 8px;
  }

  .todo-badge {
    position: absolute;
    top: -6rpx;
    right: -6rpx;
    width: 16rpx;
    height: 16rpx;
    background-color: #FF5151;
    border-radius: 50%;
    border: 2rpx solid #FFFFFF;
  }
}

.todo-content {
  flex: 1;
  overflow: hidden;
}

.todo-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  // margin-bottom: 4px;
}

.todo-title {
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  /* 让标题占据更多空间 */
  margin-right: 8px;
  /* 与右侧信息保持间距 */
}

.todo-info {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  /* 防止信息区域被压缩 */
  text-align: right;
  min-width: 80rpx;
}

.todo-meta {
  display: flex;
  align-items: center;
}

.todo-user,
.todo-time {
  font-size: 13px;
  color: #CCCCCC;
}

.divider {
  font-size: 13px;
  color: #CCCCCC;
  margin: 0 5px;
}

.urgent-icon {
  margin-top: 4rpx;
}

.todo-desc {
  font-size: 13px;
  color: #999999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  // margin-top: 4px;
}

/* 筛选抽屉样式 */
.filter-container {
  padding: 24px 12px 12px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #EEEEEE;
}

.filter-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.filter-content {
  flex: 1;
  overflow-y: auto;
  /* 允许内容滚动 */
}

.filter-item {
  margin-bottom: 15px;

  &.tag {
    .filter-label {
      margin-bottom: 10px;
    }
  }
}

.filter-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.90);
  ;
  font-weight: bold;
}

.filter-control {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.filter-options-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5%;
}

.filter-tag {
  width: 30%;
  height: 37px;
  line-height: 37px;
  background-color: #F8F8F8;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 15px;
  color: #333333;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  text-align: center;
  box-sizing: border-box;
}

.filter-tag-active {
  background-color: #E3EFFF;
  color: #0F81EB;
  border: 1px solid #0F81EB;
  position: relative;
}

.filter-tag-active::after {
  content: "";
  position: absolute;
  top: 0;
  right: -3px;
  width: 19px;
  height: 15.5px;
  background-image: url('https://gateway-in.rosino.com/prod/biz-lease-mini-gateway/admin-api/infra/file/1/get/check.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

/* 自定义日期范围样式优化 */
.custom-date-range-container {
  width: 100%;
}

.filter-input {
  width: 100%;
  height: 48px;
  padding: 0;
  font-size: 14px;
  color: #333333;
  border-bottom: 1px solid #DDDDDD;
  box-sizing: border-box;
}

.filter-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 30rpx;
}

.btn-reset,
.btn-confirm {
  flex: 1;
  margin: 0 10rpx;
  line-height: 44px;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 4px;
  text-align: center;

  &::after {
    content: '';
    border: none;
  }
}

.btn-reset {
  background-color: #FFFFFF;
  color: rgba(0, 0, 0, 0.60);
  ;
  border: 1px solid #DDDDDD;
}

.btn-confirm {
  background-color: #0F81EB;
  color: #FFFFFF;
  border: none;
}


::v-deep .mescroll-uni {
  margin-top: 54px !important;
  overflow: visible !important;
}
.bottom_container {
  width: 100%;
  display: flex;
  align-items: center;
  height: 40px; /* 可根据需要调整高度 */
}

.bottom_spacer {
  flex: 1;
  height: 1px;
  background-color: #E5E5E5;
}

.bottom_text {
  font-size: 13px;
  color: #ccc;
  padding: 0 10px; /* 可选：增加一点文字两侧间距 */
  white-space: nowrap;
}

.empty-data-container {
  width: 100vw;
  padding-top: calc((100% - 180rpx) / 2);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .empty-image {
    vertical-align: top;
    width: 151px;
  }
  .empty-text {
    margin-top: 8px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
  }
}

/* 适配暗黑模式 */
@media (prefers-color-scheme: dark) {

  page,
  .container {
    background-color: #222222;
  }

  /* 固定在顶部的搜索框 */
.fixed-search-box {
    background-color: #333333 !important;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
}
.uni-searchbar{
   background-color: #333333 !important;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
}
.uni-searchbar__box{
   background-color: #333333 !important;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
}

  .todo-item {
    background-color: #333333;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
  }

  .todo-title {
    color: #EEEEEE;
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
}
</style>