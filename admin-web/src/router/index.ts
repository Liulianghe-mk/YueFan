import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'



const router = createRouter({

  history: createWebHistory(),

  routes: [

    {

      path: '/login',

      name: 'login',

      component: () => import('@/views/LoginView.vue'),

      meta: { public: true },

    },

    {

      path: '/',

      component: () => import('@/layouts/MainLayout.vue'),

      meta: { requiresAuth: true },

      children: [

        {

          path: '',

          name: 'dashboard',

          meta: { title: '工作台概览' },

          component: () => import('@/views/DashboardView.vue'),

        },

        {

          path: 'meetups',

          name: 'meetups',

          meta: { title: '约饭活动' },

          component: () => import('@/views/MeetupsView.vue'),

        },

        {

          path: 'recommend-spots',

          name: 'recommend-spots',

          meta: { title: '为你推荐' },

          component: () => import('@/views/RecommendSpotsView.vue'),

        },

        {

          path: 'discover-categories',

          name: 'discover-categories',

          meta: { title: '发现分类' },

          component: () => import('@/views/DiscoverCategoriesView.vue'),

        },

        {

          path: 'hot-search-tags',

          name: 'hot-search-tags',

          meta: { title: '搜索热词' },

          component: () => import('@/views/HotSearchTagsView.vue'),

        },

        {

          path: 'feed-posts',

          name: 'feed-posts',

          meta: { title: '动态内容' },

          component: () => import('@/views/FeedPostsView.vue'),

        },

        {

          path: 'influencers',

          name: 'influencers',

          meta: { title: '大V / 达人' },

          component: () => import('@/views/InfluencersView.vue'),

        },

        {

          path: 'chat-messages',

          name: 'chat-messages',

          meta: { title: '私信会话' },

          component: () => import('@/views/ChatMessagesView.vue'),

        },

        {

          path: 'app-users',

          name: 'app-users',

          meta: { title: '小程序用户' },

          component: () => import('@/views/AppUsersView.vue'),

        },

        {

          path: 'system-users',

          name: 'system-users',

          meta: { title: '管理员账号' },

          component: () => import('@/views/SystemUsersView.vue'),

        },

      ],

    },

  ],

})



router.beforeEach((to) => {

  const auth = useAuthStore()

  if (to.meta.public && auth.isLoggedIn) {

    return { path: '/' }

  }

  if (to.meta.public) {

    return true

  }

  const needsAuth = to.matched.some((r) => r.meta.requiresAuth)

  if (needsAuth && !auth.isLoggedIn) {

    return { path: '/login', query: { redirect: to.fullPath } }

  }

  return true

})



export default router

