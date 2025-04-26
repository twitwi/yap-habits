import { createRouter, createWebHashHistory } from 'vue-router'
import DailyView from '@/views/DailyView.vue'
import ConfigView from '@/views/ConfigView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: DailyView,
      props: {
        day: new Date().toISOString().split('T')[0],
      },
    },
    {
      path: '/day',
      name: 'today',
      component: DailyView,
      props: {
        day: new Date().toISOString().split('T')[0],
      },
    },
    {
      path: '/day/:day',
      name: 'day',
      component: DailyView,
      props: true,
    },
    {
      path: '/cfg',
      name: 'config',
      component: ConfigView,
      props: true,
    },
  ],
})

export default router
