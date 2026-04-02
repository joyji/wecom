<template>
  <view class="zy-uni-date">
    <!-- 头部插槽 -->
    <slot name="header-slot"></slot>
    <view class="zy-uni-date-editor" @click="show">
      <slot>
        <view
          class="zy-uni-date-editor--x"
          :class="{ 'zy-uni-date-editor--x__disabled': disabled, 'zy-uni-date-x--border': border }"
        >
          <view v-if="!isRange" class="zy-uni-date-x zy-uni-date-single">
            <uni-icons class="icon-calendar" type="calendar" color="#c0c4cc" size="22"></uni-icons>
            <view class="zy-uni-date__x-input">{{ displayValue || singlePlaceholderText }}</view>
          </view>

          <view v-else class="zy-uni-date-x zy-uni-date-range">
            <uni-icons class="icon-calendar" type="calendar" color="#c0c4cc" size="22"></uni-icons>
            <view class="zy-uni-date__x-input text-center">{{
              displayRangeValue.startDate || startPlaceholderText
            }}</view>

            <view class="range-separator">{{ rangeSeparator }}</view>

            <view class="zy-uni-date__x-input text-center">{{ displayRangeValue.endDate || endPlaceholderText }}</view>
          </view>

          <view v-if="showClearIcon" class="zy-uni-date__icon-clear" @click.stop="clear">
            <uni-icons type="clear" color="#c0c4cc" size="22"></uni-icons>
          </view>
        </view>
      </slot>
    </view>

    <view v-show="pickerVisible" class="zy-uni-date-mask--pc" @click="close"></view>
    <Calendar
      v-if="pickerVisibleT || isShowAllways"
      ref="mobile"
      :clearDate="false"
      :changeClose="changeClose"
      :isShowAllways="isShowAllways"
      :date="calendarDate"
      :type="type"
      :defTime="mobileCalendarTime"
      :start-date="calendarRange.startDate"
      :end-date="calendarRange.endDate"
      :selectableTimes="mobSelectableTime"
      :startPlaceholder="startPlaceholder"
      :endPlaceholder="endPlaceholder"
      :default-value="defaultValue"
      :pleStatus="endMultipleStatus"
      :showMonth="false"
      :range="isRange"
      :hasTime="hasTime"
      :insert="insert"
      :hideSecond="hideSecond"
      :selectOtherMonth="selectOtherMonth"
      :zyUniCalendarFlotItemWeeksBoxItem="zyUniCalendarFlotItemWeeksBoxItem"
      :zyUniCalendarFlotWeeksContent="zyUniCalendarFlotWeeksContent"
      :zyUniCalendarFlotWeeksHeader="zyUniCalendarFlotWeeksHeader"
      :zyUniCalendarFlotWeeks="zyUniCalendarFlotWeeks"
      :zyUniCalendarFlot="zyUniCalendarFlot"
      @confirm="mobileChange"
      @maskClose="close"
      @change="calendarClick"
    >
      <template #calender-header-slot>
        <slot name="calender-header-slot"></slot>
      </template>
      <template #calender-footer-slot>
        <slot name="calender-footer-slot"></slot>
      </template>
    </Calendar>
    <!-- 脚部插槽 -->
    <slot name="footer-slot"> </slot>
  </view>
</template>
<script>
/**
 * DatetimePicker 时间选择器
 * @description 同时支持 PC 和移动端使用日历选择日期和日期范围
 * @tutorial https://ext.dcloud.net.cn/plugin?id=3962
 * @property {String} type 选择器类型
 * @property {String|Number|Array|Date} value 绑定值
 * @property {String} placeholder 单选择时的占位内容
 * @property {String} start 起始时间
 * @property {String} end 终止时间
 * @property {String} start-placeholder 范围选择时开始日期的占位内容
 * @property {String} end-placeholder 范围选择时结束日期的占位内容
 * @property {String} range-separator 选择范围时的分隔符
 * @property {Boolean} border = [true|false] 是否有边框
 * @property {Boolean} disabled = [true|false] 是否禁用
 * @property {Boolean} clearIcon = [true|false] 是否显示清除按钮（仅PC端适用）
 * @property {Boolean} changeValueFormat = [true|false] 是否改变时间格式（默认XXXX年XX月XX日）false为（XXXX-XX-XX）
 * @property {[String} defaultValue 选择器打开时默认显示的时间
 * @event {Function} change 确定日期时触发的事件
 * @event {Function} maskClick 点击遮罩层触发的事件
 * @event {Function} show 打开弹出层
 * @event {Function} close 关闭弹出层
 * @event {Function} clear 清除上次选中的状态和值
 *  @property {Boolean} insert = [true|false] 插入模式,默认为true
 * 	@value true 弹窗模式
 * 	@value false 插入模式
 **/
import Calendar from './calendar.vue'
// import TimePicker from './time-picker.vue'
import { initVueI18n } from '@dcloudio/uni-i18n'
import i18nMessages from './i18n/index.js'
import { getDateTime, getDate, getTime, getDefaultSecond, dateCompare, checkDate, fixIosDateFormat } from './util'

export default {
  name: 'ZyDatetimePicker',

  // options: {
  //   // #ifdef MP-TOUTIAO
  //   virtualHost: false,
  //   // #endif
  //   // #ifndef MP-TOUTIAO
  //   virtualHost: true
  //   // #endif
  // },
  components: {
    Calendar
    // TimePicker
  },
  data() {
    return {
      isRange: false,
      hasTime: false,
      displayValue: '',
      inputDate: '',
      calendarDate: '',
      pickerTime: '',
      calendarRange: {
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: ''
      },
      displayRangeValue: {
        startDate: '',
        endDate: ''
      },
      tempRange: {
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: ''
      },
      // 左右日历同步数据
      startMultipleStatus: {
        before: '',
        after: '',
        data: [],
        fulldate: ''
      },
      endMultipleStatus: {
        before: '',
        after: '',
        data: [],
        fulldate: ''
      },
      pickerVisible: false,
      pickerVisibleT: false,
      pickerPositionStyle: null,
      isEmitValue: false,
      isPhone: false,
      isFirstShow: true,
      i18nT: () => {}
    }
  },
  props: {
    insert: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      default: 'date'
    },
    value: {
      type: [String, Number, Array, Date],
      default: ''
    },
    modelValue: {
      type: [String, Number, Array, Date],
      default: ''
    },
    start: {
      type: [Number, String],
      default: ''
    },
    end: {
      type: [Number, String],
      default: ''
    },
    returnType: {
      type: String,
      default: 'string'
    },
    placeholder: {
      type: String,
      default: ''
    },
    startPlaceholder: {
      type: String,
      default: ''
    },
    endPlaceholder: {
      type: String,
      default: ''
    },
    rangeSeparator: {
      type: String,
      default: '-'
    },
    border: {
      type: [Boolean],
      default: true
    },
    disabled: {
      type: [Boolean],
      default: false
    },
    clearIcon: {
      type: [Boolean],
      default: false
    },
    hideSecond: {
      type: [Boolean],
      default: false
    },
    defaultValue: {
      type: [String, Object, Array],
      default: ''
    },
    changeValueFormat: {
      type: [Boolean],
      default: true
    },
    changeClose: {
      type: [Boolean],
      default: false
    },
    isShowAllways: {
      type: [Boolean],
      default: false
    },
    zyUniCalendarFlot: {
      type: Object,
      default: () => ({})
    },
    zyUniCalendarFlotWeeks: {
      type: Object,
      default: () => ({})
    },
    zyUniCalendarFlotWeeksHeader: {
      type: Object,
      default: () => ({})
    },
    zyUniCalendarFlotWeeksContent: {
      type: Object,
      default: () => ({})
    },
    zyUniCalendarFlotItemWeeksBoxItem: {
      type: Object,
      default: () => ({})
    },
    selectOtherMonth: {
      type: [Boolean],
      default: false
    }
  },
  watch: {
    type: {
      immediate: true,
      handler(newVal) {
        this.hasTime = newVal.indexOf('time') !== -1
        this.isRange = newVal.indexOf('range') !== -1
      }
    },
    // #ifndef VUE3
    value: {
      immediate: true,
      handler(newVal) {
        if (this.isEmitValue) {
          this.initPicker(newVal)
          this.isEmitValue = false
          return
        }
        this.initPicker(newVal)
      }
    },
    // #endif
    // #ifdef VUE3
    modelValue: {
      immediate: true,
      handler(newVal) {
        if (this.isEmitValue) {
          this.initPicker(newVal)
          this.isEmitValue = false
          return
        }
        this.initPicker(newVal)
      }
    },
    // #endif
    start: {
      immediate: true,
      handler(newVal) {
        if (!newVal) return
        this.calendarRange.startDate = getDate(newVal)
        if (this.hasTime) {
          this.calendarRange.startTime = getTime(newVal)
        }
      }
    },
    end: {
      immediate: true,
      handler(newVal) {
        if (!newVal) return
        this.calendarRange.endDate = getDate(newVal)
        if (this.hasTime) {
          this.calendarRange.endTime = getTime(newVal, this.hideSecond)
        }
      }
    },
    isShowAllways: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          setTimeout(() => {
            this.show()
          }, 600)
        }
      }
    }
  },
  computed: {
    timepickerStartTime() {
      const activeDate = this.isRange ? this.tempRange.startDate : this.inputDate
      return activeDate === this.calendarRange.startDate ? this.calendarRange.startTime : ''
    },
    timepickerEndTime() {
      const activeDate = this.isRange ? this.tempRange.endDate : this.inputDate
      return activeDate === this.calendarRange.endDate ? this.calendarRange.endTime : ''
    },
    mobileCalendarTime() {
      const timeRange = {
        start: this.tempRange.startTime,
        end: this.tempRange.endTime
      }
      return this.isRange ? timeRange : this.pickerTime
    },
    mobSelectableTime() {
      return {
        start: this.calendarRange.startTime,
        end: this.calendarRange.endTime
      }
    },
    datePopupWidth() {
      // todo
      return this.isRange ? 653 : 301
    },

    /**
     * for i18n
     */
    singlePlaceholderText() {
      return this.placeholder || (this.type === 'date' ? this.selectDateText : this.selectDateTimeText)
    },
    startPlaceholderText() {
      return this.startPlaceholder || this.startDateText
    },
    endPlaceholderText() {
      return this.endPlaceholder || this.endDateText
    },
    selectDateText() {
      return this.i18nT('uni-datetime-picker.selectDate')
    },
    selectDateTimeText() {
      return this.i18nT('uni-datetime-picker.selectDateTime')
    },
    selectTimeText() {
      return this.i18nT('uni-datetime-picker.selectTime')
    },
    startDateText() {
      return this.startPlaceholder || this.i18nT('uni-datetime-picker.startDate')
    },
    startTimeText() {
      return this.i18nT('uni-datetime-picker.startTime')
    },
    endDateText() {
      return this.endPlaceholder || this.i18nT('uni-datetime-picker.endDate')
    },
    endTimeText() {
      return this.i18nT('uni-datetime-picker.endTime')
    },
    okText() {
      return this.i18nT('uni-datetime-picker.ok')
    },
    clearText() {
      return this.i18nT('uni-datetime-picker.clear')
    },
    showClearIcon() {
      return (
        this.clearIcon &&
        !this.disabled &&
        (this.displayValue || (this.displayRangeValue.startDate && this.displayRangeValue.endDate))
      )
    }
  },
  created() {
    this.initI18nT()
    this.platform()
  },
  methods: {
    initI18nT() {
      const vueI18n = initVueI18n(i18nMessages)
      this.i18nT = vueI18n.t
    },
    initPicker(newVal) {
      if ((!newVal && !this.defaultValue) || (Array.isArray(newVal) && !newVal.length)) {
        this.$nextTick(() => {
          this.clear(false)
        })
        return
      }

      if (!Array.isArray(newVal) && !this.isRange) {
        if (newVal) {
          this.displayValue = this.inputDate = this.calendarDate = getDate(newVal)
          if (this.hasTime) {
            this.pickerTime = getTime(newVal, this.hideSecond)
            this.displayValue = `${this.displayValue} ${this.pickerTime}`
          }
        } else if (this.defaultValue) {
          this.inputDate = this.calendarDate = getDate(this.defaultValue)
          if (this.hasTime) {
            this.pickerTime = getTime(this.defaultValue, this.hideSecond)
          }
        }
      } else {
        const [before, after] = newVal
        if (!before && !after) return
        const beforeDate = getDate(before)
        const beforeTime = getTime(before, this.hideSecond)

        const afterDate = getDate(after)
        const afterTime = getTime(after, this.hideSecond)
        const startDate = beforeDate
        const endDate = afterDate
        this.tempRange.startDate = startDate
        // this.displayRangeValue.startDate = this.tempRange.startDate = startDate
        this.tempRange.endDate = endDate
        // this.displayRangeValue.endDate = this.tempRange.endDate = endDate
        if (this.changeValueFormat) {
          const [oys, oms, ods] = startDate.split('-')
          const [oye, ome, ode] = endDate.split('-')
          this.displayRangeValue.startDate = `${oys}年${oms}月${ods}日`
          this.displayRangeValue.endDate = `${oye}年${ome}月${ode}日`
        } else {
          this.displayRangeValue.startDate = startDate
          this.displayRangeValue.endDate = endDate
        }

        if (this.hasTime) {
          this.displayRangeValue.startDate = `${beforeDate} ${beforeTime}`
          this.displayRangeValue.endDate = `${afterDate} ${afterTime}`
          this.tempRange.startTime = beforeTime
          this.tempRange.endTime = afterTime
        }
        const defaultRange = {
          before: beforeDate,
          after: afterDate
        }
        this.startMultipleStatus = Object.assign({}, this.startMultipleStatus, defaultRange, {
          which: 'right'
        })
        this.endMultipleStatus = Object.assign({}, this.endMultipleStatus, defaultRange, {
          which: 'left'
        })
      }
    },
    updateLeftCale(e) {
      const left = this.$refs.left
      // 设置范围选
      left.cale.setHoverMultiple(e.after)
      left.setDate(this.$refs.left.nowDate.fullDate)
    },
    updateRightCale(e) {
      const right = this.$refs.right
      // 设置范围选
      right.cale.setHoverMultiple(e.after)
      right.setDate(this.$refs.right.nowDate.fullDate)
    },
    platform() {
      if (typeof navigator !== 'undefined') {
        this.isPhone = navigator.userAgent.toLowerCase().indexOf('mobile') !== -1
        return
      }
      // #ifdef MP-WEIXIN

      const { windowWidth } = uni.getWindowInfo()

      // #endif
      // #ifndef MP-WEIXIN
      /* eslint-disable @typescript-eslint/no-redeclare */
      const { windowWidth } = uni.getSystemInfoSync()
      /* eslint-enable @typescript-eslint/no-redeclare */
      // #endif
      this.isPhone = windowWidth <= 500
      this.windowWidth = windowWidth
    },
    show() {
      this.$emit('show')
      if (this.disabled) return
      if (this.pickerVisibleT) return (this.pickerVisibleT = false)
      this.platform()
      // if (this.isPhone) {
      this.pickerVisibleT = true
      setTimeout(() => {
        this.$refs.mobile.open()
      }, 0)
      // return
      // }
      this.pickerPositionStyle = {
        top: '10px'
      }
      const dateEditor = uni.createSelectorQuery().in(this).select('.zy-uni-date-editor')
      dateEditor
        .boundingClientRect(rect => {
          if (this.windowWidth - rect.left < this.datePopupWidth) {
            this.pickerPositionStyle.right = 0
          }
        })
        .exec()
      // setTimeout(() => {
      //   this.pickerVisible = !this.pickerVisible
      //   if (!this.isPhone && this.isRange && this.isFirstShow) {
      //     this.isFirstShow = false
      //     const { startDate, endDate } = this.calendarRange
      //     if (startDate && endDate) {
      //       if (this.diffDate(startDate, endDate) < 30) {
      //         this.$refs.right.changeMonth('pre')
      //       }
      //     } else {
      //       this.$refs.right.changeMonth('next')
      //       if (this.isPhone) {
      //         this.$refs.right.cale.lastHover = false
      //       }
      //     }
      //   }
      // }, 50)
    },
    close() {
      setTimeout(() => {
        this.pickerVisible = false
        this.pickerVisibleT = false
        this.$emit('maskClick', this.value)
        // this.$refs.mobile && this.$refs.mobile.close()
        if (this.$refs.mobile) {
          this.$refs.mobile.close()
        }
      }, 20)
    },
    setEmit(value) {
      if (this.returnType === 'timestamp' || this.returnType === 'date') {
        if (!Array.isArray(value)) {
          if (!this.hasTime) {
            value = value + ' ' + '00:00:00'
          }
          value = this.createTimestamp(value)
          if (this.returnType === 'date') {
            value = new Date(value)
          }
        } else {
          if (!this.hasTime) {
            value[0] = value[0] + ' ' + '00:00:00'
            value[1] = value[1] + ' ' + '00:00:00'
          }
          value[0] = this.createTimestamp(value[0])
          value[1] = this.createTimestamp(value[1])
          if (this.returnType === 'date') {
            value[0] = new Date(value[0])
            value[1] = new Date(value[1])
          }
        }
      }

      console.log('🚀 ~ setEmit ~ value:', value)
      let date = this.formatDateString(value)
      this.$emit('update:modelValue', date)
      this.$emit('input', date)
      this.$emit('change', date)
      this.isEmitValue = true
      if (this.pickerVisibleT) {
        this.pickerVisibleT = false
      }
    },
    formatDateString(input) {
      // 判断是否是数组输入
      const isArray = Array.isArray(input)
      const values = isArray ? input : [input]

      const results = values.map(str => {
        // 使用正则提取年、月、日
        const match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
        if (!match) {
          throw new Error(`Invalid date format: ${str}`)
        }

        const year = match[1]
        let month = match[2]
        let day = match[3]

        // 补前导零
        month = String(month).padStart(2, '0')
        day = String(day).padStart(2, '0')

        return `${year}-${month}-${day}`
      })

      return isArray ? results : results[0]
    },
    createTimestamp(date) {
      date = fixIosDateFormat(date)
      return Date.parse(new Date(date))
    },
    singleChange(e) {
      this.calendarDate = this.inputDate = e.fulldate
      if (this.hasTime) return
      this.confirmSingleChange()
    },
    confirmSingleChange() {
      if (!checkDate(this.inputDate)) {
        const now = new Date()
        this.calendarDate = this.inputDate = getDate(now)
        this.pickerTime = getTime(now, this.hideSecond)
      }

      let startLaterInputDate = false
      let startDate, startTime
      if (this.start) {
        let startString = this.start
        if (typeof this.start === 'number') {
          startString = getDateTime(this.start, this.hideSecond)
        }
        ;[startDate, startTime] = startString.split(' ')
        if (this.start && !dateCompare(startDate, this.inputDate)) {
          startLaterInputDate = true
          this.inputDate = startDate
        }
      }

      let endEarlierInputDate = false
      let endDate, endTime
      if (this.end) {
        let endString = this.end
        if (typeof this.end === 'number') {
          endString = getDateTime(this.end, this.hideSecond)
        }
        ;[endDate, endTime] = endString.split(' ')
        if (this.end && !dateCompare(this.inputDate, endDate)) {
          endEarlierInputDate = true
          this.inputDate = endDate
        }
      }
      if (this.hasTime) {
        if (startLaterInputDate) {
          this.pickerTime = startTime || getDefaultSecond(this.hideSecond)
        }
        if (endEarlierInputDate) {
          this.pickerTime = endTime || getDefaultSecond(this.hideSecond)
        }
        if (!this.pickerTime) {
          this.pickerTime = getTime(Date.now(), this.hideSecond)
        }
        this.displayValue = `${this.inputDate} ${this.pickerTime}`
      } else {
        this.displayValue = this.inputDate
      }
      this.setEmit(this.displayValue)
      this.pickerVisible = false
    },
    leftChange(e) {
      const { before, after } = e.range
      this.rangeChange(before, after)
      const obj = {
        before: e.range.before,
        after: e.range.after,
        data: e.range.data,
        fulldate: e.fulldate
      }
      this.startMultipleStatus = Object.assign({}, this.startMultipleStatus, obj)
      this.$emit('calendarClick', e)
    },
    rightChange(e) {
      const { before, after } = e.range
      this.rangeChange(before, after)
      const obj = {
        before: e.range.before,
        after: e.range.after,
        data: e.range.data,
        fulldate: e.fulldate
      }
      this.endMultipleStatus = Object.assign({}, this.endMultipleStatus, obj)
      this.$emit('calendarClick', e)
    },
    mobileChange(e) {
      let time = ''
      if (this.isRange) {
        const { before, after } = e.range
        if (!before) {
          return
        }

        this.handleStartAndEnd(before, after, true)

        if (this.hasTime) {
          const { startTime, endTime } = e.timeRange
          this.tempRange.startTime = startTime
          this.tempRange.endTime = endTime
        }

        this.confirmRangeChange()
      } else {
        if (this.hasTime) {
          this.displayValue = e.fulldate + ' ' + e.time
          time = e.fulldate + ' ' + e.time
        } else {
          if (this.changeValueFormat) {
            const [y, m, d] = e.fulldate.split('-')
            this.displayValue = `${y}年${m}月${d}日`
          } else {
            this.displayValue = e.fulldate
          }
          time = e.fulldate
        }
        this.setEmit(time)
        this.calendarDate = time
      }
      this.$refs.mobile.close()
    },
    rangeChange(before, after) {
      if (!(before && after)) return
      this.handleStartAndEnd(before, after, true)
      if (this.hasTime) return
      this.confirmRangeChange()
    },
    confirmRangeChange() {
      if (!this.tempRange.startDate || !this.tempRange.endDate) {
        this.pickerVisible = false
        return
      }
      if (!checkDate(this.tempRange.startDate)) {
        this.tempRange.startDate = getDate(Date.now())
      }
      if (!checkDate(this.tempRange.endDate)) {
        this.tempRange.endDate = getDate(Date.now())
      }

      let start, end

      let startDateLaterRangeStartDate = false
      let startDateLaterRangeEndDate = false
      let startDate, startTime

      let compareStartDateString = this.tempRange.startDate
      let compareEndDateString = this.tempRange.endDate
      if (this.hasTime) {
        compareStartDateString = `${this.tempRange.startDate} ${this.tempRange.startTime}`
        compareEndDateString = `${this.tempRange.endDate} ${this.tempRange.endTime}`
      }

      if (this.start) {
        let startString = this.start
        if (typeof this.start === 'number') {
          startString = getDateTime(this.start, this.hideSecond)
        }
        ;[startDate, startTime] = startString.split(' ')
        if (this.start && !dateCompare(this.start, compareStartDateString)) {
          startDateLaterRangeStartDate = true
          this.tempRange.startDate = startDate
        }
        if (this.start && !dateCompare(this.start, compareEndDateString)) {
          startDateLaterRangeEndDate = true
          this.tempRange.endDate = startDate
        }
      }
      let endDateEarlierRangeStartDate = false
      let endDateEarlierRangeEndDate = false
      let endDate, endTime
      if (this.end) {
        let endString = this.end
        if (typeof this.end === 'number') {
          endString = getDateTime(this.end, this.hideSecond)
        }
        ;[endDate, endTime] = endString.split(' ')

        if (this.end && !dateCompare(compareStartDateString, this.end)) {
          endDateEarlierRangeStartDate = true
          this.tempRange.startDate = endDate
        }
        if (this.end && !dateCompare(compareEndDateString, this.end)) {
          endDateEarlierRangeEndDate = true
          this.tempRange.endDate = endDate
        }
      }
      if (!this.hasTime) {
        start = this.displayRangeValue.startDate = this.tempRange.startDate
        end = this.displayRangeValue.endDate = this.tempRange.endDate
      } else {
        if (startDateLaterRangeStartDate) {
          this.tempRange.startTime = startTime || getDefaultSecond(this.hideSecond)
        } else if (endDateEarlierRangeStartDate) {
          this.tempRange.startTime = endTime || getDefaultSecond(this.hideSecond)
        }
        if (!this.tempRange.startTime) {
          this.tempRange.startTime = getTime(Date.now(), this.hideSecond)
        }

        if (startDateLaterRangeEndDate) {
          this.tempRange.endTime = startTime || getDefaultSecond(this.hideSecond)
        } else if (endDateEarlierRangeEndDate) {
          this.tempRange.endTime = endTime || getDefaultSecond(this.hideSecond)
        }
        if (!this.tempRange.endTime) {
          this.tempRange.endTime = getTime(Date.now(), this.hideSecond)
        }
        start = this.displayRangeValue.startDate = `${this.tempRange.startDate} ${this.tempRange.startTime}`
        end = this.displayRangeValue.endDate = `${this.tempRange.endDate} ${this.tempRange.endTime}`
      }
      if (!dateCompare(start, end)) {
        ;[start, end] = [end, start]
      }
      if (this.changeValueFormat) {
        const [ys, ms, ds] = start.split('-')
        const [ye, me, de] = end.split('-')
        this.displayRangeValue.startDate = `${ys}年${ms}月${ds}日`
        this.displayRangeValue.endDate = `${ye}年${me}月${de}日`
      } else {
        this.displayRangeValue.startDate = start
        this.displayRangeValue.endDate = end
      }
      const displayRange = [start, end]

      this.setEmit(displayRange)
      this.pickerVisible = false
    },
    handleStartAndEnd(before, after, temp = false) {
      if (!before) return
      if (!after) after = before
      const type = temp ? 'tempRange' : 'range'
      const isStartEarlierEnd = dateCompare(before, after)
      this[type].startDate = isStartEarlierEnd ? before : after
      this[type].endDate = isStartEarlierEnd ? after : before
    },
    /**
     * 比较时间大小
     */
    dateCompare(startDate, endDate) {
      // 计算截止时间
      startDate = new Date(startDate.replace('-', '/').replace('-', '/'))
      // 计算详细项的截止时间
      endDate = new Date(endDate.replace('-', '/').replace('-', '/'))
      return startDate <= endDate
    },

    /**
     * 比较时间差
     */
    diffDate(startDate, endDate) {
      // 计算截止时间
      startDate = new Date(startDate.replace('-', '/').replace('-', '/'))
      // 计算详细项的截止时间
      endDate = new Date(endDate.replace('-', '/').replace('-', '/'))
      const diff = (endDate - startDate) / (24 * 60 * 60 * 1000)
      return Math.abs(diff)
    },

    clear(needEmit = true) {
      if (!this.isRange) {
        this.displayValue = ''
        this.inputDate = ''
        this.pickerTime = ''
        if (this.isPhone) {
          // this.$refs.mobile && this.$refs.mobile.clearCalender()
          if (this.$refs.mobile) {
            this.$refs.mobile.clearCalender()
          }
        } else {
          // this.$refs.pcSingle && this.$refs.pcSingle.clearCalender()
          if (this.$refs.pcSingle) {
            this.$refs.pcSingle.clearCalender()
          }
        }
        if (needEmit) {
          this.$emit('change', '')
          this.$emit('input', '')
          this.$emit('update:modelValue', '')
        }
      } else {
        this.displayRangeValue.startDate = ''
        this.displayRangeValue.endDate = ''
        this.tempRange.startDate = ''
        this.tempRange.startTime = ''
        this.tempRange.endDate = ''
        this.tempRange.endTime = ''
        if (this.isPhone) {
          // this.$refs.mobile && this.$refs.mobile.clearCalender()
          if (this.$refs.mobile) {
            this.$refs.mobile.clearCalender()
          }
        } else {
          // this.$refs.left && this.$refs.left.clearCalender()
          if (this.$refs.left) {
            this.$refs.left.clearCalender()
          }
          // this.$refs.right && this.$refs.right.clearCalender()
          if (this.$refs.right) {
            this.$refs.right.clearCalender()
          }
          // this.$refs.right && this.$refs.right.changeMonth('next')
          if (this.$refs.right) {
            this.$refs.right.changeMonth('next')
          }
        }
        if (needEmit) {
          this.$emit('change', [])
          this.$emit('input', [])
          this.$emit('update:modelValue', [])
        }
      }
    },

    calendarClick(e) {
      this.$emit('calendarClick', e)
    }
  }
}
</script>

<style lang="scss">
.zy-uni-date {
  width: 100%;
  flex: 1;
}

.zy-uni-date-x {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: #ffffff;
  color: #666666;
  font-size: 14px;
  flex: 1;

  .icon-calendar {
    padding-left: 3px;
  }

  .range-separator {
    height: 35px;
    /* #ifndef MP */
    padding: 0 2px;
    /* #endif */
    line-height: 35px;
  }
}

.zy-uni-date-x--border {
  box-sizing: border-box;
  border-radius: 4px;
  border: 1px solid #dcdcdc;
}

.zy-uni-date-editor--x {
  display: flex;
  align-items: center;
  position: relative;
}

.zy-uni-date-editor--x .zy-uni-date__icon-clear {
  padding-right: 3px;
  display: flex;
  align-items: center;
  /* #ifdef H5 */
  cursor: pointer;
  /* #endif */
}

.zy-uni-date__x-input {
  width: auto;
  height: 35px;
  /* #ifndef MP */
  padding-left: 5px;
  /* #endif */
  position: relative;
  flex: 1;
  line-height: 35px;
  font-size: 14px;
  overflow: hidden;
}

.text-center {
  text-align: center;
}

.zy-uni-date__input {
  height: 40px;
  width: 100%;
  line-height: 40px;
  font-size: 14px;
}

.zy-uni-date-range__input {
  text-align: center;
  max-width: 142px;
}

.zy-uni-date-picker__container {
  position: relative;
}

.zy-uni-date-mask--pc {
  position: fixed;
  bottom: 0px;
  top: 0px;
  left: 0px;
  right: 0px;
  background-color: rgba(0, 0, 0, 0);
  transition-duration: 0.3s;
  z-index: 996;
}

.zy-uni-date-single--x {
  background-color: #ffffff;
  position: absolute;
  top: 0;
  z-index: 999;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.zy-uni-date-range--x {
  background-color: #ffffff;
  position: absolute;
  top: 0;
  z-index: 999;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.zy-uni-date-editor--x__disabled {
  opacity: 0.3;
  cursor: default;
}

.zy-uni-date-editor--logo {
  width: 16px;
  height: 16px;
  vertical-align: middle;
}

/* 添加时间 */
.popup-x-header {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;
}

.popup-x-header--datetime {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;
  flex: 1;
}

.popup-x-body {
  display: flex;
}

.popup-x-footer {
  padding: 0 15px;
  border-top-color: #f1f1f1;
  border-top-style: solid;
  border-top-width: 1px;
  line-height: 40px;
  text-align: right;
  color: #666666;
}

.popup-x-footer text:hover {
  color: #0f56d5;
  cursor: pointer;
  opacity: 0.8;
}

.popup-x-footer .confirm-text {
  margin-left: 20px;
  color: #0f56d5;
}

.zy-uni-date-changed {
  text-align: center;
  color: #333333;
  border-bottom-color: #f1f1f1;
  border-bottom-style: solid;
  border-bottom-width: 1px;
}

.zy-uni-date-changed--time text {
  height: 50px;
  line-height: 50px;
}

.zy-uni-date-changed .zy-uni-date-changed--time {
  flex: 1;
}

.zy-uni-date-changed--time-date {
  color: #333333;
  opacity: 0.6;
}

.mr-50 {
  margin-right: 50px;
}

/* picker 弹出层通用的指示小三角, todo：扩展至上下左右方向定位 */
.uni-popper__arrow,
.uni-popper__arrow::after {
  position: absolute;
  display: block;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  border-top-width: 0;
}

.uni-popper__arrow {
  filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.03));
  top: -6px;
  left: 10%;
  margin-right: 3px;
  border-bottom-color: #ebeef5;
}

.uni-popper__arrow::after {
  content: ' ';
  top: 1px;
  margin-left: -6px;
  border-bottom-color: #ffffff;
}
</style>
