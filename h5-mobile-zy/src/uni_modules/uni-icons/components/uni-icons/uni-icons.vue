<template>
	<image
	  v-if="multiColorIcons.includes(type)"
      mode="aspectFit"
      :src="srcPath"
      :style="multiColorStyleObj"
    ></image>
	<template v-else>
		<text :style="styleObj" class="uni-icons"
			:class="['uniui-' + type, customPrefix, customPrefix ? type : '', spin ? 'uni-icon-spin' : '']"
			@click="_onClick">
			<slot></slot>
		</text>
  	</template>
</template>

<script>
import { fontData } from './uniicons_file_vue.js';
import NEW from './svg/NEW.svg';
import pdf from './svg/pdf.svg';
import ppt from './svg/ppt.svg';
import word from './svg/word.svg';
import exel from './svg/exel.svg';
import img from './svg/img.svg';
import oth from './svg/oth.svg';
import zip from './svg/zip.svg';
import txt from './svg/txt.svg';
import zipGif from './svg/zipGif.gif';

const getVal = (val) => {
	const reg = /^[0-9]*$/g
	return (typeof val === 'number' || reg.test(val)) ? val + 'px' : val;
}

/**
 * Icons 图标
 * @description 用于展示 icons 图标
 * @tutorial https://ext.dcloud.net.cn/plugin?id=28
 * @property {Number} size 图标大小
 * @property {String} type 图标图案，参考示例
 * @property {String} color 图标颜色
 * @property {String} customPrefix 自定义图标
 * @event {Function} click 点击 Icon 触发事件
 */
export default {
	name: 'UniIcons',
	emits: ['click'],
	props: {
		type: {
			type: String,
			default: ''
		},
		color: {
			type: String,
			default: '#333333'
		},
		size: {
			type: [Number, String],
			default: 16
		},
		customPrefix: {
			type: String,
			default: ''
		},
		fontFamily: {
			type: String,
			default: ''
		},
		spin: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			icons: fontData,
			multiColorIcons: ['exel', 'img', 'NEW', 'oth', 'pdf', 'ppt', 'word', 'zip', 'txt', 'zipGif']
		}
	},
	computed: {
		unicode() {
			let code = this.icons.find(v => v.font_class === this.type)
			if (code) {
				return code.unicode
			}
			return ''
		},
		iconSize() {
			return getVal(this.size)
		},
		styleObj() {
			if (this.fontFamily !== '') {
				return `color: ${this.color}; font-size: ${this.iconSize}; font-family: ${this.fontFamily};`
			}
			return `color: ${this.color}; font-size: ${this.iconSize};`
		},
		multiColorStyleObj() {
			return `width: ${this.iconSize}; height: ${this.iconSize};`
		},
		srcPath() {
			if (this.type == 'exel') {
				return exel
			} else if (this.type == 'img') {
				return img
			} else if (this.type == 'NEW') {
				return NEW
			} else if (this.type == 'oth') {
				return oth
			} else if (this.type == 'pdf') {
				return pdf
			} else if (this.type == 'ppt') {
				return ppt
			} else if (this.type == 'word') {
				return word
			} else if (this.type == 'zip') {
				return zip
			} else if (this.type == 'txt') {
				return txt
			} else if (this.type == 'zipGif') {
				return zipGif
			}
		}
	},
	methods: {
		_onClick() {
			this.$emit('click')
		}
	}
}
</script>

<style lang="scss">
@import './uniicons.css';

@font-face {
	font-family: uniicons;
	src: url('./uniicons.ttf') format('truetype');
}

.uni-icons {
	font-family: uniicons;
	text-decoration: none;
	text-align: center;
}

.uni-icon-spin {
  display: inline-block;
  animation: uni-icon-rotate 1s linear infinite;
}

@keyframes uni-icon-rotate {
  100% {
    transform: rotate(360deg);
  }
}
</style>
