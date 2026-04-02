<template>
  <view class="container">
    <zy-datetime-picker
      :changeClose="true"
      type="date"
      :value="single"
      start="2025-5-2"
      end="2025-5-30"
      @change="change"
    >
      <template #calender-header-slot>
        <view class="custom-header">自定义弹窗头部内容</view>
      </template>
      <template #calender-footer-slot>
        <view class="custom-footer">自定义弹窗脚部内容</view>
      </template>
    </zy-datetime-picker>
    <zy-datetime-picker :changeClose="true" v-model="dateRange" type="daterange" start="2025-5-2" end="2025-5-30" />
    <zy-datetime-picker :insert="false" type="date" :value="single" start="2025-5-2" end="2025-5-30" @change="change" />
    <zy-datetime-picker :insert="false" v-model="dateRange" type="daterange" start="2025-5-2" end="2025-5-30" />

    <zy-datetime-picker
      :isShowAllways="true"
      type="date"
      :value="single"
      start="2025-5-2"
      end="2025-5-30"
      @change="change"
    />
    <zy-datetime-picker :isShowAllways="true" v-model="dateRange" type="daterange" start="2025-5-2" end="2025-5-30" />
    <zy-datetime-picker :isShowAllways="true" v-model="dateRange" type="daterange" start="2025-5-2" end="2025-5-30">
      <template #header-slot>
        <view class="custom-header">自定义头部内容</view>
      </template>
      <template #footer-slot>
        <view class="custom-footer">自定义脚部内容</view>
      </template>
    </zy-datetime-picker>
  </view>
</template>

<script>
export default {
  data() {
    return {
      single: '2021-04-3',
      dateRange: ['2025-5-2', '2025-5-30']
    }
  },
  watch: {
    dateRange: {
      deep: true,
      handler(newVal) {
        console.log('🚀 ~ newVal:', newVal)
      }
    }
  },
  methods: {
    change(e) {
      this.single = e
    }
  }
}
</script>

<style>
.container {
  padding: 20px;
}
</style>
