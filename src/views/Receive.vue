<script setup lang="ts">
import ActionFooter from '@/components/ActionFooter.vue'
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
  IonIcon,
  IonImg,
  IonPage,
  IonSkeletonText,
  IonText,
  IonTitle,
  IonToolbar,
  onIonViewWillEnter,
} from '@ionic/vue'
import { useQRCode } from '@vueuse/integrations/useQRCode.mjs'
import { shareOutline } from 'ionicons/icons'
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

      <ActionFooter>
        <IonButton
          v-if="canShare"
          color="dark"
          expand="block"
          @click="shareAddress"
        >
          <IonIcon slot="start" :icon="shareOutline" />
          <IonText>Share Address</IonText>
        </IonButton>
      </ActionFooter>
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
</style>
