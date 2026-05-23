<template>

  <el-container class="layout">

    <el-aside width="240px" class="aside">

      <div class="brand">

        <span class="brand-mark">约</span>

        <div class="brand-text">

          <span class="brand-title">约饭</span>

          <span class="brand-sub">管理后台</span>

        </div>

      </div>

      <el-menu

        router

        :default-active="route.path"

        class="side-menu"

        background-color="transparent"

        text-color="#d8d2cb"

        active-text-color="#f0c674"

      >

        <el-menu-item index="/">

          <el-icon><Odometer /></el-icon>

          <span>概览</span>

        </el-menu-item>



        <el-sub-menu index="sub-discover">

          <template #title>

            <el-icon><Shop /></el-icon>

            <span>发现与约饭</span>

          </template>

          <el-menu-item index="/meetups">

            <el-icon><Calendar /></el-icon>

            <span>约饭活动</span>

          </el-menu-item>

          <el-menu-item index="/recommend-spots">

            <el-icon><Picture /></el-icon>

            <span>为你推荐</span>

          </el-menu-item>

          <el-menu-item index="/discover-categories">

            <el-icon><Grid /></el-icon>

            <span>发现分类</span>

          </el-menu-item>

          <el-menu-item index="/hot-search-tags">

            <el-icon><Search /></el-icon>

            <span>搜索热词</span>

          </el-menu-item>

        </el-sub-menu>



        <el-sub-menu index="sub-ugc">

          <template #title>

            <el-icon><ChatDotRound /></el-icon>

            <span>动态与达人</span>

          </template>

          <el-menu-item index="/feed-posts">

            <el-icon><ChatLineSquare /></el-icon>

            <span>动态内容</span>

          </el-menu-item>

          <el-menu-item index="/influencers">

            <el-icon><Star /></el-icon>

            <span>大V / 达人</span>

          </el-menu-item>

          <el-menu-item index="/chat-messages">

            <el-icon><Message /></el-icon>

            <span>私信会话</span>

          </el-menu-item>

        </el-sub-menu>



        <el-sub-menu index="sub-system">

          <template #title>

            <el-icon><Setting /></el-icon>

            <span>系统</span>

          </template>

          <el-menu-item index="/app-users">

            <el-icon><Avatar /></el-icon>

            <span>小程序用户</span>

          </el-menu-item>

          <el-menu-item index="/system-users">

            <el-icon><User /></el-icon>

            <span>管理员账号</span>

          </el-menu-item>

        </el-sub-menu>

      </el-menu>

      <div class="aside-foot">

        <span class="ver">v0.2</span>

      </div>

    </el-aside>

    <el-container class="right">

      <el-header class="header">

        <div class="header-left">

          <el-breadcrumb separator="/">

            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>

            <el-breadcrumb-item v-if="breadcrumbTail">{{ breadcrumbTail }}</el-breadcrumb-item>

          </el-breadcrumb>

          <h1 class="page-title">{{ pageTitle }}</h1>

        </div>

        <div class="header-right">

          <el-tag type="info" effect="plain" round class="role-tag">管理员</el-tag>

          <el-button type="danger" plain size="small" @click="logout">退出登录</el-button>

        </div>

      </el-header>

      <el-main class="main">

        <div class="main-inner">

          <router-view />

        </div>

      </el-main>

    </el-container>

  </el-container>

</template>



<script setup lang="ts">

import {

  Avatar,

  Calendar,

  ChatDotRound,

  ChatLineSquare,

  Grid,

  Message,

  Odometer,

  Picture,

  Search,

  Setting,

  Shop,

  Star,

  User,

} from '@element-plus/icons-vue'

import { computed } from 'vue'

import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'



const route = useRoute()

const router = useRouter()

const auth = useAuthStore()



const pageTitle = computed(() => {

  const t = route.meta.title

  return typeof t === 'string' && t ? t : '工作台概览'

})



const breadcrumbTail = computed(() => {

  if (route.path === '/' || route.path === '') return ''

  const t = route.meta.title

  return typeof t === 'string' && t ? t : ''

})



function logout() {

  auth.clear()

  router.push('/login')

}

</script>



<style scoped>

.layout {

  height: 100%;

  min-height: 100vh;

}

.aside {

  background: linear-gradient(180deg, #322a26 0%, #2a2220 48%, #231d1a 100%);

  color: #faf7f2;

  display: flex;

  flex-direction: column;

  border-right: 1px solid rgba(255, 255, 255, 0.06);

}

.brand {

  display: flex;

  align-items: center;

  gap: 12px;

  padding: 22px 18px;

  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

}

.brand-mark {

  width: 40px;

  height: 40px;

  border-radius: 10px;

  background: linear-gradient(135deg, #f0c674 0%, #c45c26 100%);

  color: #2a2220;

  font-weight: 800;

  font-size: 18px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

}

.brand-text {

  display: flex;

  flex-direction: column;

  line-height: 1.25;

}

.brand-title {

  font-weight: 700;

  font-size: 17px;

  letter-spacing: 0.02em;

}

.brand-sub {

  font-size: 12px;

  color: #9a928a;

  margin-top: 2px;

}

.side-menu {

  flex: 1;

  border-right: none !important;

  padding: 12px 8px;

  overflow-y: auto;

}

.side-menu :deep(.el-menu-item) {

  border-radius: 8px;

  margin-bottom: 4px;

}

.side-menu :deep(.el-menu-item.is-active) {

  background: rgba(240, 198, 116, 0.12) !important;

}

.side-menu :deep(.el-sub-menu__title) {

  border-radius: 8px;

  margin-bottom: 4px;

  color: #d8d2cb !important;

}

.side-menu :deep(.el-sub-menu .el-menu-item) {

  padding-left: 48px !important;

}

.aside-foot {

  padding: 12px 18px 16px;

  border-top: 1px solid rgba(255, 255, 255, 0.06);

}

.ver {

  font-size: 11px;

  color: #6b635c;

}

.right {

  min-width: 0;

  background: var(--yf-bg, #f4f1ec);

}

.header {

  height: auto !important;

  min-height: 64px;

  padding: 14px 24px 12px;

  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  gap: 16px;

  background: var(--yf-surface, #fff);

  border-bottom: 1px solid #e8e3dd;

  box-shadow: 0 1px 0 rgba(42, 34, 32, 0.04);

}

.header-left {

  min-width: 0;

}

.header :deep(.el-breadcrumb) {

  font-size: 12px;

  margin-bottom: 6px;

}

.page-title {

  margin: 0;

  font-size: 20px;

  font-weight: 700;

  color: #2a2220;

  letter-spacing: 0.02em;

}

.header-right {

  display: flex;

  align-items: center;

  gap: 10px;

  flex-shrink: 0;

  padding-top: 2px;

}

.role-tag {

  border-color: #d8d2cb !important;

  color: #5c534c !important;

}

.main {

  padding: 20px 24px 28px;

  background: transparent;

}

.main-inner {

  max-width: 1280px;

  margin: 0 auto;

}

</style>

