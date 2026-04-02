<template>
  <uni-search-bar 
    placeholder="搜索商品"
    :radius="8"
    :micButton="'always'"
    :filterButton="'always'"
    :filterValue="filterStatus"
    :cancelButton="'always'"
    cancelText="返回"
    bgColor="#ffffff"
    textColor="#333333"
    maxlength="50"
    @input="onInput"
    @clear="onClear"
    @confirm="onSearch"
    @cancel="onCancel"
    @filter="onFilter"
  ></uni-search-bar>
</template>

<script>
export default {
  data() {
    return {
      searchValue: '',
      filterStatus: 'active'
    }
  },
  methods: {
    onInput(value) {
      console.log('输入内容:', value);
    },
    onClear() {
      console.log('清除输入');
    },
    onSearch(value) {
      console.log('搜索内容:', value);
    },
    onCancel() {
      console.log('取消搜索');
    },
    onFilter() {
      console.log('筛选操作');
      this.filterStatus = this.filterStatus === 'active' ? 'inactive' : 'active';
    }
  }
}
</script>