<script setup lang="ts">
import { K_NETWORK, useSecureStorage } from '@/composables/useSecureStorage'
import { injKaspa, Kaspa } from '@/injectives'
import { useNetworkStore } from '@/stores/network'
import { NetworkType } from '@/types'
import { IonContent, IonPage, IonSpinner } from '@ionic/vue'
import { inject, onBeforeMount, ref } from 'vue'

const kaspa = inject(injKaspa) as Kaspa
const networkStore = useNetworkStore()
const storage = useSecureStorage()
const isReady = ref(false)

onBeforeMount(async () => {
  isReady.value = false

  const networkId = await storage.getItem(K_NETWORK)
  if (networkId) {
    networkStore.setNetworkId(networkId as NetworkType)
  }

  await kaspa.init(networkStore.networkId)
  isReady.value = true
})
</script>

<template>
  <IonPage v-if="!isReady">
    <IonContent fullscreen>
      <div class="container">
        <IonSpinner />
      </div>
    </IonContent>
  </IonPage>
  <slot v-else />
</template>

<style scoped>
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
