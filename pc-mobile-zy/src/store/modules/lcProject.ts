/**
 * 低代码编辑器状态管理
 */
import { defineStore } from 'pinia'
import { store } from '@/store'
import type {
  LcProject,
  LcPage,
  LcComponentEditorInstance,
  PlatformMode
} from '@/components/LowcodeEditor/types'

export const useLcProjectStore = defineStore('lcLowcodeProject', {
  state: () => ({
    // 项目信息
    project: null as LcProject | null,
    // 页面列表
    pageList: [] as LcPage[],
    // 当前页面下标
    curPageIndex: 0,
    // 当前选中组件（编辑器内部格式，使用 props 数组）
    curComponent: null as LcComponentEditorInstance | null,
    // 当前拖拽的组件
    dragComponent: null as LcComponentEditorInstance | null,
    // 是否正在拖拽
    dragStatus: false,
    // 当前平台模式
    platformMode: 'mobile' as PlatformMode,
    // 是否正在切换平台（防止 watcher 在切换过程中触发重复同步）
    isSwitchingPlatform: false,
    // 是否有未保存的修改
    isDirty: false
  }),
  getters: {
    // 当前页面
    curPage(): LcPage | undefined {
      return this.pageList[this.curPageIndex]
    },
    // 当前页面组件列表
    componentList(): any[] {
      return this.curPage?.componentList || []
    },
    // 画布宽度
    canvasWidth(): number {
      return this.platformMode === 'mobile' ? 375 : 1200
    }
  },
  actions: {
    // 初始化项目
    setProject(project: LcProject) {
      this.project = project
      this.pageList = (project?.pageList || []).map((page) => {
        const mobileList = page.mobileComponentList || []
        const pcList = page.pcComponentList || []
        // 根据当前平台模式加载对应的组件列表作为活跃列表
        const activeList =
          this.platformMode === 'mobile'
            ? (mobileList.length ? mobileList : page.componentList || [])
            : (pcList.length ? pcList : page.componentList || [])
        return {
          ...page,
          componentList: JSON.parse(JSON.stringify(activeList)),
          mobileComponentList: JSON.parse(JSON.stringify(mobileList)),
          pcComponentList: JSON.parse(JSON.stringify(pcList))
        }
      })
      this.curPageIndex = 0
      this.curComponent = null
      this.isDirty = false
    },

    // 设置当前页面
    setCurPage(index: number) {
      this.curPageIndex = index
      this.curComponent = null
    },

    // 设置页面内容
    setCurPageContent(content: Partial<LcPage>) {
      if (this.curPage) {
        Object.assign(this.pageList[this.curPageIndex], content)
        this.isDirty = true
      }
    },

    // 新增页面
    addPage(page: LcPage) {
      this.pageList.push(page)
      this.isDirty = true
    },

    // 删除页面
    delPage(index: number) {
      this.pageList.splice(index, 1)
      if (this.curPageIndex >= this.pageList.length) {
        this.curPageIndex = Math.max(0, this.pageList.length - 1)
      }
      this.curComponent = null
      this.isDirty = true
    },

    // 选中组件
    setcurComponent(component: LcComponentEditorInstance | null) {
      this.curComponent = component
    },

    // 设置拖拽组件
    setDragComponent(component: LcComponentEditorInstance | null) {
      this.dragComponent = component
    },

    // 添加组件到当前页面
    addComponentList(component: any) {
      this.curPage?.componentList.push(component)
      this.isDirty = true
    },

    // 删除组件
    delComponent(id: number) {
      if (!this.curPage) return
      const index = this.curPage.componentList.findIndex((item) => item.id === id)
      if (index !== -1) {
        this.curPage.componentList.splice(index, 1)
      }
      this.curComponent = null
      this.isDirty = true
    },

    // 设置拖拽状态
    setDragStatus(status: boolean) {
      this.dragStatus = status
    },

    // 切换平台模式 - 保存当前平台组件列表，加载目标平台组件列表
    switchPlatform(mode: PlatformMode) {
      const prevMode = this.platformMode
      if (prevMode === mode) return

      this.isSwitchingPlatform = true

      // 深拷贝工具，避免平台间组件对象引用共享
      const deepClone = (arr: any[]) => JSON.parse(JSON.stringify(arr))

      // 遍历所有页面：保存当前平台的 componentList，加载目标平台的
      this.pageList.forEach((page) => {
        // 保存当前平台数据（深拷贝，断开引用）
        if (prevMode === 'mobile') {
          page.mobileComponentList = deepClone(page.componentList)
        } else {
          page.pcComponentList = deepClone(page.componentList)
        }
        // 加载目标平台数据（深拷贝，断开引用）
        if (mode === 'mobile') {
          page.componentList = deepClone(page.mobileComponentList || [])
        } else {
          page.componentList = deepClone(page.pcComponentList || [])
        }
      })

      this.platformMode = mode
      this.curComponent = null
    },

    // 标记已保存
    markSaved() {
      this.isDirty = false
    },

    // 更新项目基础信息（名称、描述）
    updateProject(data: { name?: string; description?: string }) {
      if (this.project) {
        if (data.name !== undefined) this.project.name = data.name
        if (data.description !== undefined) this.project.description = data.description
        this.isDirty = true
      }
    }
  },
  persist: false
})

export const useLcProjectStoreWithOut = () => {
  return useLcProjectStore(store)
}
