<script setup lang="ts">
import { injKaspa, Kaspa } from '@/injectives'
import { useNetworkStore } from '@/stores/network'
import { IonContent, IonPage, IonSpinner } from '@ionic/vue'
import { inject, onBeforeMount, ref } from 'vue'

const kaspa = inject(injKaspa) as Kaspa
const networkStore = useNetworkStore()
const isReady = ref(false)

onBeforeMount(async () => {
  isReady.value = false
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
