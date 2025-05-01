<script setup lang="ts">
import ClipboardCopy from '@/components/ClipboardCopy.vue'
import {
  K_ACCOUNT_PRIMARY,
  useSecureStorage,
} from '@/composables/useSecureStorage'
import { Share } from '@capacitor/share'
import {
  IonButton,
  IonContent,
  IonHeader,
  IonImg,
  IonPage,
  IonSkeletonText,
  IonText,
  IonTitle,
  IonToolbar,
  onIonViewWillEnter,
} from '@ionic/vue'
import { useQRCode } from '@vueuse/integrations/useQRCode.mjs'
import { ref } from 'vue'

const storage = useSecureStorage()
const address = ref('')
const qrcode = useQRCode(address)
const canShare = ref(true)

onIonViewWillEnter(() => {
  storage.getItem(K_ACCOUNT_PRIMARY).then((data) => {
    address.value = JSON.parse(data ?? '{}').address
  })

  Share.canShare().then((result) => {
    canShare.value = result.value
  })
})

async function shareAddress() {
  await Share.share({
    text: address.value,
  })
}
</script>

<template>
  <IonPage>
    <IonHeader translucent class="ion-no-border" collapse="condense">
      <IonToolbar />
    </IonHeader>
    <IonContent fullscreen class="ion-padding">
      <IonHeader collapse="condense">
        <IonTitle size="large">Deposit</IonTitle>
        <div class="subtitle">
          <IonText> Scan this address to send asset to this wallet </IonText>
        </div>
      </IonHeader>

      <div class="qrcode-wrapper">
        <IonSkeletonText v-if="address.length === 0" class="qr-skeleton" />
        <IonImg v-else :src="qrcode" alt="QR Code" class="qrcode" />
      </div>
      <div class="address-display">{{ address }}</div>
      <ClipboardCopy :item="address" />

      <div v-if="canShare" class="footer ion-padding">
        <IonButton color="dark" expand="block" @click="shareAddress"
          >Share Address</IonButton
        >
      </div>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.subtitle {
  padding: 0 0.75rem;
  color: var(--ion-text-color-step-400);
}

.qrcode-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10%;
}

.qrcode {
  border: 1px solid var(--ion-text-color-step-900);
}

.qr-skeleton {
  width: 250px;
  height: 250px;
}

.qr-skeleton,
.qrcode {
  width: 250px;
  overflow: hidden;
  border-radius: 10px;
}

.address-display {
  font-family: monospace;
  text-align: center;
  font-size: 0.9rem;
  line-height: 1.2rem;
  margin-top: 1rem;
  padding: 0 1rem;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
}
</style>
