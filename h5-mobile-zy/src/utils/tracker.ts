import SDK from "lib-sino-tracker";
const initTracker = () => {
  const env = import.meta.env.MODE
  const appId = import.meta.env.VITE_APP_ID
  const appName = import.meta.env.VITE_APP_NAME
  const serverUrl = import.meta.env.VITE_TRACKER_URL

  SDK.init({
    appId,
    appName,
    serverUrl,
    isAutoTrigger: false,
  });
};

const exTriggerEvent = (event: string, eventName: string, ext: any = {}) => {
    let exPointKey = uni.getStorageSync("exPointKey"); // 上一个埋点eventKey
    Object.assign(ext, { exPointKey });
    SDK.triggerEvent(event, eventName, ext);
    uni.setStorageSync("exPointKey", event);
  };  

export { SDK, initTracker, exTriggerEvent };