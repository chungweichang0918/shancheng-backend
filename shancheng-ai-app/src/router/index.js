import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/form', name: 'Form', component: () => import('../views/Form.vue') },
  { path: '/scan', name: 'Scan', component: () => import('../views/Scan.vue') },
  { path: '/guide', name: 'Guide', component: () => import('../views/Guide.vue') },
  { path: '/mission', name: 'Mission', component: () => import('../views/Mission.vue') },
  { path: '/settings', name: 'Settings', component: () => import('../views/Settings.vue') }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})