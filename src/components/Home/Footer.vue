<script setup lang="ts">
import { injKaspa, Kaspa } from '@/injectives'
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'
import {
  alertController,
  IonButton,
  IonIcon,
  IonText,
  useIonRouter,
} from '@ionic/vue'
import { home, list, scanCircle } from 'ionicons/icons'
import { inject } from 'vue'

const kaspa = inject(injKaspa) as Kaspa

async function onClickAsset() {
  const alert = await alertController.create({
    header: 'Coming Soon',
    subHeader: 'This feature is not yet available',
    message: 'Once it is ready, we will announce it on Kaspa discord server',
    buttons: ['OK'],
  })

  await alert.present()
}

const scanSingleBarcode = async (): Promise<string> => {
  return new Promise(async (resolve) => {
    document.querySelector('body')?.classList.add('barcode-scanner-active')

    const listener = await BarcodeScanner.addListener(
      'barcodesScanned',
      async (result) => {
        const address = result.barcodes[0]

        const isValidBarcode = kaspa.isValidAddress(address.rawValue)
        if (!isValidBarcode) {
          return
        }

        await listener.remove()
        document
          .querySelector('body')
          ?.classList.remove('barcode-scanner-active')
        await BarcodeScanner.stopScan()
        resolve(address.rawValue)
      },
    )

    await BarcodeScanner.startScan()
  })
}

const router = useIonRouter()
const scan = async () => {
  const data = await scanSingleBarcode()
  router.push(`/home/send/${data}`)
}
</script>

<template>
  <div class="footer">
    <div class="footer-nav">
      <div class="footer-nav-items">
        <IonIcon :icon="home" class="footer-nav-items-icon active" />
      </div>
      <div class="footer-nav-items p-0">
        <IonButton color="dark" @click="scan">
          <IonIcon slot="start" :icon="scanCircle" />
          <IonText>Scan to Pay</IonText>
        </IonButton>
      </div>
      <div class="footer-nav-items" @click="onClickAsset">
        <IonIcon :icon="list" class="footer-nav-items-icon" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  border-top: 1px solid var(--ion-background-color-step-100);
  padding: 0rem 1rem;
  padding-top: var(--ion-safe-area-bottom, 0);
  padding-bottom: var(--ion-safe-area-bottom, 0);
  background-color: var(--ion-background-color);
}

.footer-nav {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.footer-nav-items {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.footer-nav-items-icon {
  font-size: 1.5rem;
  opacity: 30%;
}

.footer-nav-items-icon.active {
  font-size: 1.5rem;
  opacity: 100%;
}
</style>

<style>
/* Hide all elements */
body.barcode-scanner-active {
  visibility: hidden;
  --background: transparent;
  --ion-background-color: transparent;
}

/* Show only the barcode scanner modal */
.barcode-scanner-modal {
  visibility: visible;
}

@media (prefers-color-scheme: dark) {
  .barcode-scanner-modal {
    --background: transparent;
    --ion-background-color: transparent;
  }
}
</style>
