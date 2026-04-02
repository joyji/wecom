<template>
  <view
    class="zy-uni-calendar-item__weeks-box"
    :class="{
      'zy-uni-calendar-item--disable': weeks.disable,
      'zy-uni-calendar-item--before-checked-x': weeks.beforeMultiple,
      'zy-uni-calendar-item--multiple': weeks.multiple,
      'zy-uni-calendar-item--after-checked-x': weeks.afterMultiple
    }"
    @click="choiceDate(weeks)"
    @mouseenter="handleMousemove(weeks)"
  >
    <view
      class="zy-uni-calendar-item__weeks-box-item"
      :class="{
        'zy-uni-calendar-item--checked': calendar.fullDate === weeks.fullDate && (calendar.userChecked || !checkHover),
        'zy-uni-calendar-item--checked-range-text': checkHover,
        'zy-uni-calendar-item--before-checked': weeks.beforeMultiple,
        'zy-uni-calendar-item--multiple': weeks.multiple,
        'zy-uni-calendar-item--after-checked': weeks.afterMultiple,
        'zy-uni-calendar-item--disable': weeks.disable
      }"
      :style="zyUniCalendarFlotItemWeeksBoxItem"
    >
      <view
        v-if="weeks.isToday || weeks.afterMultiple || weeks.beforeMultiple"
        :class="{
          'zy-uni-calendar-item--today': weeks.isToday,
          'zy-uni-calendar-item--today-t':
            weeks.beforeMultiple ||
            weeks.afterMultiple ||
            (calendar.fullDate === weeks.fullDate && (calendar.userChecked || !checkHover))
        }"
      >
        {{ weeks.afterMultiple ? '结束' : weeks.beforeMultiple ? '开始' : weeks.isToday ? '今日' : '' }}</view
      >
      <text v-if="selected && weeks.extraInfo" class="zy-uni-calendar-item__weeks-box-circle"></text>
      <text
        class="zy-uni-calendar-item__weeks-box-text zy-uni-calendar-item__weeks-box-text-disable zy-uni-calendar-item--checked-text"
        >{{ weeks.date }}</text
      >
    </view>
    <!-- 小红点今日样式 -->
    <!-- <view :class="{ 'zy-uni-calendar-item--today': weeks.isToday }"></view> -->
    <!-- <view
      v-if="weeks.isToday"
      :class="{
        'zy-uni-calendar-item--today': weeks.isToday,
        'zy-uni-calendar-item--today-t': calendar.fullDate === weeks.fullDate && (calendar.userChecked || !checkHover)
      }"
      >今日</view
    > -->
  </view>
</template>

<script>
export default {
  props: {
    weeks: {
      type: Object,
      default() {
        return {}
      }
    },
    calendar: {
      type: Object,
      default: () => {
        return {}
      }
    },
    selected: {
      type: Array,
      default: () => {
        return []
      }
    },
    checkHover: {
      type: Boolean,
      default: false
    },
    zyUniCalendarFlotItemWeeksBoxItem: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    choiceDate(weeks) {
      this.$emit('change', weeks)
    },
    handleMousemove(weeks) {
      return
      this.$emit('handleMouse', weeks)
    }
  }
}
</script>

<style lang="scss">
.zy-uni-calendar-item__weeks-box {
  flex: 1;
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: column;
  justify-content: center;
  align-items: center;
  // margin: 1px 0;
  position: relative;
}

.zy-uni-calendar-item__weeks-box-text {
  font-size: 16px;
  // font-family: Lato-Bold, Lato;
  font-weight: 600;
  color: #333333;
}

.zy-uni-calendar-item__weeks-box-item {
  position: relative;
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 47px;
  height: 55px;
  /* #ifdef H5 */
  cursor: pointer;
  /* #endif */
}

.zy-uni-calendar-item__weeks-box-circle {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: #dd524d;
}

.zy-uni-calendar-item__weeks-box .zy-uni-calendar-item--disable {
  cursor: default;
}

.zy-uni-calendar-item--disable .zy-uni-calendar-item__weeks-box-text-disable {
  color: #d1d1d1;
}

.zy-uni-calendar-item--today {
  position: absolute;
  top: 1px;
  font-size: 9px;
  color: #999999;
  text-align: center;
}
.zy-uni-calendar-item--today-t {
  position: absolute;
  top: 1px;
  font-size: 9px;
  color: #ffffff;
  text-align: center;
}

.zy-uni-calendar-item--extra {
  color: #dd524d;
  opacity: 0.8;
}

.zy-uni-calendar-item__weeks-box .zy-uni-calendar-item--checked {
  background-color: #0f56d5;
  border-radius: 4px;
  box-sizing: border-box;
  // border: 3px solid $uni-text-color-inverse;
  color: #ffffff !important;
}

.zy-uni-calendar-item--checked .zy-uni-calendar-item--checked-text {
  color: #ffffff;
}

.zy-uni-calendar-item--multiple .zy-uni-calendar-item--checked-range-text {
  color: #333333;
}

.zy-uni-calendar-item--multiple {
  background-color: #0f56d5;
  background: rgba(22, 119, 255, 0.1);
  width: 100%;
  // color:$uni-text-color-inverse;
}

.zy-uni-calendar-item--multiple .zy-uni-calendar-item--before-checked,
.zy-uni-calendar-item--multiple .zy-uni-calendar-item--after-checked {
  background-color: #0f56d5;
  border-radius: 4px;
  box-sizing: border-box;
}
.zy-uni-calendar-item--before-checked {
  // border-top-left-radius: 4px;
  // border-bottom-left-radius: 4px;
  width: 100%;
}
.zy-uni-calendar-item--after-checked {
  // border-top-right-radius: 4px;
  // border-bottom-right-radius: 4px;
  width: 100%;
}

.zy-uni-calendar-item--before-checked .zy-uni-calendar-item--checked-text,
.zy-uni-calendar-item--after-checked .zy-uni-calendar-item--checked-text {
  color: #ffffff;
}

.zy-uni-calendar-item--before-checked-x {
  background-color: #0f56d5;
  border-radius: 4px;
  box-sizing: border-box;
}

.zy-uni-calendar-item--after-checked-x {
  background-color: #0f56d5;
  border-radius: 4px;
  box-sizing: border-box;
}
</style>
