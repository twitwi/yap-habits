import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import DailyView from '@/views/DailyView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/about',
      name: 'about',
      component: HomeView,
    },
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
  ],
})

export default router
