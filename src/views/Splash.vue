<script setup lang="ts">
import { injKaspa, Kaspa } from '@/injectives'
import { useNetworkStore } from '@/stores/network'
import {
  IonContent,
  IonPage,
  IonSpinner,
  onIonViewWillEnter,
  useIonRouter,
} from '@ionic/vue'
import { inject } from 'vue'

const kaspa = inject(injKaspa) as Kaspa
const networkStore = useNetworkStore()
const router = useIonRouter()

onIonViewWillEnter(async () => {
  await kaspa.init(networkStore.networkId)
  await kaspa.connectRpc()
  router.replace('/onboarding')
})
</script>

<template>
  <IonPage>
    <IonContent fullscreen>
      <div class="container">
        <IonSpinner />
      </div>
    </IonContent>
  </IonPage>
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
