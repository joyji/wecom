import { t } from '@/hooks/web/useI18n'
import { RouterView } from 'vue-router'

export default {
  path: '/mini',
  component: RouterView,
  redirect: '/mini/user',
  name: 'Mini',
  meta: {
    title: t('router.mini') || '小程序管理',
    icon: 'ep:mobile',
    noAuth: true
  },
  children: [
    {
      path: 'user',
      name: 'MiniUser',
      component: () => import('@/views/mini/user/index.vue'),
      meta: {
        title: '用户管理',
        noAuth: true
      }
    },
    {
      path: 'role',
      name: 'MiniRole',
      component: () => import('@/views/mini/role/index.vue'),
      meta: {
        title: '角色管理',
        noAuth: true
      }
    },
    {
      path: 'menu',
      name: 'MiniMenu',
      component: () => import('@/views/mini/menu/index.vue'),
      meta: {
        title: '菜单管理',
        noAuth: true
      }
    }
  ]
} 