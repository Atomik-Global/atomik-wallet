<script setup lang="ts">
import PinScreen from '@/components/PinScreen.vue'
import { useBiometric } from '@/composables/useBiometric'
import {
  K_PIN,
  K_USER_ONBOARDED,
  useSecureStorage,
} from '@/composables/useSecureStorage'
import { useIonRouter } from '@ionic/vue'

const router = useIonRouter()
const biometric = useBiometric()
const storage = useSecureStorage()

async function onSubmit(pin: string) {
  await storage.setItem(K_PIN, pin)

  if (biometric.isAvailable.value) {
    router.replace('/setup/biometric')
    return
  }

  await storage.setItem(K_USER_ONBOARDED, 'true')
  router.replace('/home')
}
</script>

<template>
  <PinScreen
    subtitle="This PIN will be used to authenticate your actions if Biometric option are disabled or not available."
    @submit="onSubmit"
  />
</template>
