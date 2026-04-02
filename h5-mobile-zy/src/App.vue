<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
onLaunch(() => {
	console.log('App Launch');
});
onShow(() => {
  console.log('App Show');
});
onHide(() => {
  const isIphone = navigator.userAgent.includes('iPhone') ? true : false
  console.log('isIphone:'+isIphone)
  console.log('App Hide');
});


</script>
<style lang="scss">
	// @import "@/common/css/index.css";
</style>
