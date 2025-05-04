<script setup lang="ts">
import { useNetworkStore } from '@/stores/network'
import { Browser } from '@capacitor/browser'
import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
  useIonRouter,
} from '@ionic/vue'
import { checkmarkCircle, linkOutline } from 'ionicons/icons'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const router = useIonRouter()
const networkStore = useNetworkStore()
const txId = computed(() => route.params.txId as string)

function viewOnChain() {
  Browser.open({ url: `${networkStore.explorerUrl}/txs/${txId.value}` })
}
</script>

<template>
  <IonPage>
    <IonContent fullscreen class="ion-padding">
      <div class="container">
        <IonIcon :icon="checkmarkCircle" class="icon" />
        <div class="title">Success!</div>
        <div class="subtitle">
          <div class="subtitle-head">Transaction ID</div>
          <div>{{ route.params.txId }}</div>
        </div>
        <IonButton color="dark" expand="block" @click="viewOnChain">
          <IonIcon slot="start" :icon="linkOutline" />
          View on Chain
        </IonButton>
        <IonButton color="light" expand="block" @click="router.back()">
          Go back Home
        </IonButton>
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
  text-align: center;
  padding: 1rem;
}

.icon {
  align-self: center;
  font-size: 5rem;
}

.title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 2rem;
}

.subtitle {
  margin-bottom: 2rem;
}

.subtitle-head {
  color: var(--ion-text-color-step-400);
  margin-bottom: 0.5rem;
}
</style>
