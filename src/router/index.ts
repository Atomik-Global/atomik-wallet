import {
  K_USER_ONBOARDED,
  useSecureStorage,
} from '@/composables/useSecureStorage'
import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import Onboarding from '../views/Onboarding.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Onboarding',
    component: Onboarding,
    meta: {
      unOnboardedOnly: true,
    },
  },
  {
    path: '/wallet/create',
    name: 'CreateWallet',
    component: () => import('@/views/CreateWallet.vue'),
  },
  {
    path: '/setup/pin',
    name: 'SetupPin',
    component: () => import('@/views/SetupPin.vue'),
  },
  {
    path: '/setup/biometric',
    name: 'SetupBiometric',
    component: () => import('@/views/SetupBiometric.vue'),
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      onboardedOnly: true,
    },
  },
  {
    path: '/home/receive',
    name: 'Receive',
    component: () => import('@/views/Receive.vue'),
    meta: {
      onboardedOnly: true,
    },
  },
  {
    path: '/home/send',
    name: 'Send',
    component: () => import('@/views/Send.vue'),
    meta: {
      onboardedOnly: true,
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from) => {
  const storage = useSecureStorage()
  await storage.init()

  const onboarded = await storage.getItem(K_USER_ONBOARDED)
  const isOnboarded = onboarded === 'true'

  if (to.meta.unOnboardedOnly && isOnboarded) return '/home'
  if (to.meta.onboardedOnly && !isOnboarded) return '/'
})

export default router
