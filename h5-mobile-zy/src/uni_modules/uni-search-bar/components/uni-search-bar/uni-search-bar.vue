<!--
 * @Description: 
 * @version: 1.0.0
 * @Author: jiying
 * @Date: 2025-05-20 16:07:10
 * @LastEditors: jiying
 * @LastEditTime: 2025-05-26 19:12:52
-->
<template>
	<view class="uni-searchbar">
		<view :style="{ borderRadius: radius + 'px', backgroundColor: bgColor }" class="uni-searchbar__box"
			:class="{ 'uni-searchbar__box--focus': inputFocus }" @click="searchClick">
			<view class="uni-searchbar__box-icon-search">
				<slot name="searchIcon">
					<uni-icons color="#cccccc" size="18" type="search" />
				</slot>
			</view>
			<input v-if="show || searchVal" :focus="showSync" :disabled="readonly" :placeholder="placeholderText"
				:maxlength="maxlength" class="uni-searchbar__box-search-input" confirm-type="search" type="text"
				v-model="searchVal" :style="{ color: textColor }" @confirm="confirm" @blur="blur" @focus="emitFocus" />
			<text v-else class="uni-searchbar__text-placeholder">{{ placeholder }}</text>
			<view v-if="show && (clearButton === 'always' || clearButton === 'auto' && searchVal !== '') && !readonly"
				class="uni-searchbar__box-icon-clear" @click="clear">
				<slot name="clearIcon">
					<uni-icons color="#cccccc" size="18" type="clear" />
				</slot>
			</view>
			<view v-if="micButton === 'always' && !readonly" class="uni-searchbar__box-icon-mic" @click="mic">
				<slot name="micIcon">
					<uni-icons color="#cccccc" size="18" type="mic" />
				</slot>
			</view>
		</view>
		<text @click="cancel" class="uni-searchbar__cancel"
			v-if="cancelButton === 'always' || show && cancelButton === 'auto'">{{ cancelTextI18n }}</text>
		<view v-if="filterButton === 'always' && !readonly" class="uni-searchbar__filter" @click="emitFilter">
			<uni-icons :color="filterValue ? '#0f56d5' : '#999999'" size="18"
				:type="filterValue ? 'filter-filled' : 'filter'" />
			<text class="uni-searchbar__filter-text">筛选</text>
		</view>
	</view>
</template>

<script>
import {
	initVueI18n
} from '@dcloudio/uni-i18n'
import messages from './i18n/index.js'
const {
	t
} = initVueI18n(messages)

/**
 * SearchBar 搜索栏
 * @description 搜索栏组件，通常用于搜索商品、文章等
 * @tutorial https://ext.dcloud.net.cn/plugin?id=866
 * @property {Number} radius 搜索栏圆角
 * @property {Number} maxlength 输入最大长度
 * @property {String} placeholder 搜索栏Placeholder
 * @property {String} clearButton = [always|auto|none] 是否显示清除按钮
 * 	@value always 一直显示
 * 	@value auto 输入框不为空时显示
 * 	@value none 一直不显示
 * @property {String} cancelButton = [always|auto|none] 是否显示取消按钮
 * 	@value always 一直显示
 * 	@value auto 输入框不为空时显示
 * 	@value none 一直不显示
 *  @property {String} micButton = [always|none] 是否显示录音按钮
 * 	@value always 一直显示
 * 	@value none 一直不显示
 *  @property {String} filterButton = [always|none] 是否显示筛选按钮
 * 	@value always 一直显示
 * 	@value none 一直不显示
 * @property {String} cancelText 取消按钮的文字
 * @property {String} bgColor 输入框背景颜色
 * @property {String} textColor 输入文字颜色
 * @property {Boolean} focus 是否自动聚焦
 * @property {Boolean} readonly 组件只读，不能有任何操作，只做展示
 * @event {Function} confirm uniSearchBar 的输入框 confirm 事件，返回参数为uniSearchBar的value，e={value:Number}
 * @event {Function} input uniSearchBar 的 value 改变时触发事件，返回参数为uniSearchBar的value，e=value
 * @event {Function} cancel 点击取消按钮时触发事件，返回参数为uniSearchBar的value，e={value:Number}
 * @event {Function} clear 点击清除按钮时触发事件，返回参数为uniSearchBar的value，e={value:Number}
 * @event {Function} blur input失去焦点时触发事件，返回参数为uniSearchBar的value，e={value:Number}
 */

export default {
	name: "UniSearchBar",
	emits: ['input', 'update:modelValue', 'clear', 'cancel', 'confirm', 'blur', 'focus'],
	props: {
		placeholder: {
			type: String,
			default: ""
		},
		radius: {
			type: [Number, String],
			default: 4
		},
		micButton: {
			type: String,
			default: "none"
		},
		clearButton: {
			type: String,
			default: "auto"
		},
		filterButton: {
			type: String,
			default: "none"
		},
		filterValue: {
			type: String,
			default: ""
		},
		cancelButton: {
			type: String,
			default: "auto"
		},
		cancelText: {
			type: String,
			default: ""
		},
		bgColor: {
			type: String,
			default: "#f5f5f5"
		},
		textColor: {
			type: String,
			default: "#000000"
		},
		maxlength: {
			type: [Number, String],
			default: 100
		},
		value: {
			type: [Number, String],
			default: ""
		},
		modelValue: {
			type: [Number, String],
			default: ""
		},
		focus: {
			type: Boolean,
			default: false
		},
		readonly: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			show: false,
			showSync: false,
			searchVal: '',
			inputFocus: false
		}
	},
	computed: {
		cancelTextI18n() {
			return this.cancelText || t("uni-search-bar.cancel")
		},
		placeholderText() {
			return this.placeholder || t("uni-search-bar.placeholder")
		}
	},
	watch: {
		// #ifndef VUE3
		value: {
			immediate: true,
			handler(newVal) {
				this.searchVal = newVal
				if (newVal) {
					this.show = true
				}
			}
		},
		// #endif
		// #ifdef VUE3
		modelValue: {
			immediate: true,
			handler(newVal) {
				this.searchVal = newVal
				if (newVal) {
					this.show = true
				}
			}
		},
		// #endif
		focus: {
			immediate: true,
			handler(newVal) {
				if (newVal) {
					if (this.readonly) return
					this.show = true;
					this.$nextTick(() => {
						this.showSync = true
					})
				}
			}
		},
		searchVal(newVal, oldVal) {
			this.$emit("input", newVal)
			// #ifdef VUE3
			this.$emit("update:modelValue", newVal)
			// #endif
		},
		filterValue(newVal) {
			if (newVal) {
				console.log('Filter value changed:', newVal);
			}
		}
	},
	methods: {
		searchClick() {
			if (this.readonly) return
			if (this.show) {
				return
			}
			this.show = true;
			this.$nextTick(() => {
				this.showSync = true
			})
		},
		mic() {
			if (this.readonly) return
			// this.$emit("mic", {
			// 	value: this.searchVal
			// });
			// TODO这里可以添加录音逻辑
			// 例如调用uni.startRecord()等方法进行录音操作, 录音结束后可以调用uni.stopRecord()停止录音, 然后可以调用uni.getRecordFile()获取录音文件路径, 最后调用语音识别API进行语音转文字操作, 最后将文字内容赋值给searchVal

		},
		clear() {
			this.searchVal = ""
			this.$nextTick(() => {
				this.$emit("clear", { value: "" })
			})
		},
		cancel() {
			if (this.readonly) return
			this.$emit("cancel", {
				value: this.searchVal
			});
			this.searchVal = ""
			this.show = false
			this.showSync = false
			// #ifndef APP-PLUS
			uni.hideKeyboard()
			// #endif
			// #ifdef APP-PLUS
			plus.key.hideSoftKeybord()
			// #endif
		},
		confirm() {
			// #ifndef APP-PLUS
			uni.hideKeyboard();
			// #endif
			// #ifdef APP-PLUS
			plus.key.hideSoftKeybord()
			// #endif
			this.$emit("confirm", {
				value: this.searchVal
			})
		},
		blur() {
			this.inputFocus = false;
			// #ifndef APP-PLUS
			uni.hideKeyboard();
			// #endif
			// #ifdef APP-PLUS
			plus.key.hideSoftKeybord()
			// #endif
			this.$emit("blur", {
				value: this.searchVal
			})
		},
		emitFocus(e) {
			this.inputFocus = true;
			this.$emit("focus", e.detail)
		},
		emitFilter(e) {
			if (this.readonly) return
			this.$emit("filter", e)
		}
	}
};
</script>

<style lang="scss">
$uni-searchbar-height: 32px;
$uni-font-size-15: 15px;
$uni-font-size-14: 14px;

.uni-searchbar {
	/* #ifndef APP-NVUE */
	display: flex;
	/* #endif */
	flex-direction: row;
	position: relative;
	padding: 6px 12px;
	background-color: $uni-bg-color;
}

.uni-searchbar__box {
	/* #ifndef APP-NVUE */
	display: flex;
	box-sizing: border-box;
	justify-content: left;
	/* #endif */
	overflow: hidden;
	position: relative;
	flex: 1;
	flex-direction: row;
	align-items: center;
	height: $uni-searchbar-height;
	line-height: $uni-searchbar-height;
	padding: 5px 13px 5px 2px;
	background-color: #f5f5f5;
	border: 1px solid transparent;

	&--focus {
		border: 1px solid #0F56D5;
	}
}

.uni-searchbar__box-icon-search {
	/* #ifndef APP-NVUE */
	display: flex;
	/* #endif */
	flex-direction: row;
	// width: 32px;
	padding: 0 5px;
	justify-content: center;
	align-items: center;
	color: #cccccc;
}

.uni-searchbar__box-search-input {
	flex: 1;
	font-size: $uni-font-size-15;
	color: $uni-text-color;
	// margin-top: 1px;
	/* #ifndef APP-NVUE */
	background-color: inherit;
	/* #endif */
}

.uni-searchbar__box-icon-clear {
	align-items: center;
	padding-left: 8px;
}

.uni-searchbar__box-icon-mic {
	align-items: center;
	padding-left: 8px;
}

.uni-searchbar__text-placeholder {
	font-size: $uni-font-size-15;
	color: $uni-text-color-grey;
	// margin-left: 5px;
	text-align: left;
	flex: 1;
}

.uni-searchbar__cancel {
	padding-left: $uni-spacing-col-lg;
	line-height: $uni-searchbar-height;
	font-size: $uni-font-size-15;
	color: $uni-text-color;
}

.uni-searchbar__filter {
	padding-left: $uni-spacing-col-lg;
	line-height: $uni-searchbar-height;
	font-size: $uni-font-size-14;
	color: #666666;
	display: flex;
	align-items: center;

	.uni-searchbar__filter-text {
		margin-left: 6px;

		&.active-filter {
			color: $uni-color-primary; // 动态改变筛选文字颜色
		}
	}
}
</style>
