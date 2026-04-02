### [查看原始文档](https://uniapp.dcloud.io/component/uniui/uni-datetime-picker)

## ZyDatetimePicker 日期选择器

## 示例

[示例](./demo.vue)

## Props

| 属性名                            | 类型           | 默认值 | 说明                                                        |
| --------------------------------- | -------------- | ------ | ----------------------------------------------------------- |
| insert                            | Boolean        | true   | 是否是插入类型                                              |
| type                              | String         | date   | 时间类型（date/daterange）                                  |
| changeValueFormat                 | Boolean        | true   | 是否改变时间格式（默认XXXX年XX月XX日）false为（XXXX-XX-XX） |
| disabled                          | Boolean        | false  | 是否禁用按钮                                                |
| start                             | Number, String | ''     | 可选区间开始                                                |
| end                               | Number, String | ''     | 可选区间结束                                                |
| changeClose                       | Boolean        | false  | 值发生变化是否关闭弹窗                                      |
| isShowAllways                     | Boolean        | false  | 是否一直展示                                                |
| zyUniCalendarFlot                 | Object         | {}     | 组件整体自定义样式                                          |
| zyUniCalendarFlotWeeks            | Object         | {}     | 组件日期每行自定义样式                                      |
| zyUniCalendarFlotWeeksHeader      | Object         | {}     | 组件头部星期自定义样式                                      |
| zyUniCalendarFlotWeeksContent     | Object         | {}     | 组件中部月份与切换自定义样式                                |
| zyUniCalendarFlotItemWeeksBoxItem | Object         | {}     | 组件日期每行中每小格自定义样式                              |
| selectOtherMonth                  | Boolean        | false  | 是否可选择当前月份前后的月份日期                            |

## 事件

| 事件名 | 说明                   | 参数 |
| ------ | ---------------------- | ---- |
| change | 时间变化时触发         | -    |
| show   | 打开弹出层             | -    |
| close  | 关闭弹出层             | -    |
| clear  | 清除上次选中的状态和值 | -    |

## 注意

1、初始值未定义将展示占位符字段
2、date为‘选择日期’可通过placeholder修改
3、daterange为‘开始日期-结束日期’可通过startPlaceholder与endPlaceholder修改
4、选中值进行变化需要通过changeClose进行传参控制
5、isShowAllways‘一直展示’仅限插入类型使用(当前状态建议使用calendarClick获取选中值)
6、非插入类型可通过调用组件内的show与close展示与关闭，插入类型可通过点击反显框进行展示与关闭
