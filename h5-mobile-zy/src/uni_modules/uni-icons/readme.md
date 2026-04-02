<!--
 * @Description: 
 * @version: 1.0.0
 * @Author: jiying
 * @Date: 2025-05-20 16:22:40
 * @LastEditors: jiying
 * @LastEditTime: 2025-06-03 18:18:14
-->
## Icons 图标
> **组件名：uni-icons**
> 代码块： `uIcons`

用于展示 icons 图标的组件。

### 属性说明
| 属性名 | 类型 | 默认值 | 说明 |
|--|--|--|--|
| type | String | '' | 图标类型，参考示例 |
| color | String | '#333333' | 图标颜色 |
| size | Number/String | 16 | 图标大小，支持数字或带单位字符串 |
| customPrefix | String | '' | 自定义图标前缀 |
| fontFamily | String | '' | 自定义字体 |
| spin | Boolean | false | 旋转效果，默认为 false |

### 事件
| 事件名 | 说明 |
|--|--|
| click | 点击图标时触发 |

### 使用示例
```html
<uni-icons type="home" size="24" color="#007AFF" @click="onClick"></uni-icons>
```

### 注意事项
- 支持自定义图标前缀，通过 `customPrefix` 属性设置。
- 支持自定义字体，通过 `fontFamily` 属性设置。