## SearchBar 搜索栏

> **组件名：uni-search-bar**
> 代码块： `uSearchBar`

## 示例
[示例](./demo.vue)

## 属性说明
| 属性名          | 类型       | 默认值    | 描述                                                                 |
|-----------------|------------|-----------|----------------------------------------------------------------------|
| placeholder     | String     | ""        | 输入框占位符文本                                                   |
| radius          | Number/String | 4       | 输入框圆角大小                                                   |
| micButton       | String     | "none"    | 是否显示录音按钮，可选值为 "always" 或 "none"                     |
| clearButton     | String     | "auto"    | 是否显示清除按钮，可选值为 "always"、"auto" 或 "none"             |
| filterButton    | String     | "none"    | 是否显示筛选按钮，可选值为 "always" 或 "none"                     |
| filterValue     | String     | ""        | 筛选按钮的状态值，用于动态改变筛选按钮的颜色                       |
| cancelButton    | String     | "auto"    | 是否显示取消按钮，可选值为 "always"、"auto" 或 "none"             |
| cancelText      | String     | ""        | 取消按钮的文本，为空时使用默认国际化文本                           |
| bgColor         | String     | "#f5f5f5" | 输入框背景颜色                                                     |
| textColor       | String     | "#000000" | 输入文字颜色                                                       |
| maxlength       | Number/String | 100    | 输入最大长度                                                     |
| value           | Number/String | ""     | 输入框的值（非 v-model 模式）                                      |
| modelValue      | Number/String | ""     | 输入框的值（v-model 模式）                                         |
| focus           | Boolean    | false     | 是否自动聚焦                                                       |
| readonly        | Boolean    | false     | 是否只读                                                           |

## 事件说明
| 事件名   | 参数                          | 描述                                                                 |
|----------|-------------------------------|----------------------------------------------------------------------|
| input    | value                         | 输入框内容变化时触发，返回当前输入值                                 |
| update:modelValue | value             | v-model 模式下，输入框内容变化时触发，返回当前输入值                 |
| clear    | { value: String }            | 点击清除按钮时触发，返回当前输入值                                   |
| cancel   | { value: String }            | 点击取消按钮时触发，返回当前输入值                                   |
| confirm  | { value: String }            | 点击确认按钮或按下回车键时触发，返回当前输入值                       |
| blur     | { value: String }            | 输入框失去焦点时触发，返回当前输入值                                 |
| focus    | event                        | 输入框获得焦点时触发，返回事件对象                                   |
| filter   | event                        | 点击筛选按钮时触发，返回事件对象                                     |

## 插槽说明
| 插槽名       | 描述                                                                 |
|--------------|----------------------------------------------------------------------|
| searchIcon   | 自定义搜索图标                                                       |
| clearIcon    | 自定义清除图标                                                       |
| micIcon      | 自定义录音图标                                                       |


## 注意事项
- 如果使用 `v-model` 模式，请确保在 Vue 3 环境下使用。
- `filterButton` 和 `filterValue` 属性需要配合使用，`filterValue` 的值变化会动态改变筛选按钮的颜色。
- 在 `readonly` 模式下，组件的所有操作都将被禁用。
