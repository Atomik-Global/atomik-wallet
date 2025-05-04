<script setup lang="ts">
import ActionFooter from '@/components/ActionFooter.vue'
import { injKaspa, Kaspa } from '@/injectives'
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'
import {
  IonContent,
  IonPage,
  IonSpinner,
  onIonViewDidEnter,
  onIonViewWillLeave,
  useIonRouter,
} from '@ionic/vue'
import { inject } from 'vue'

const kaspa = inject(injKaspa) as Kaspa

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
        removeBarcodeScannerActiveClass()
        await BarcodeScanner.stopScan()
        resolve(address.rawValue)
      },
    )

    await BarcodeScanner.startScan()
  })
}

const removeBarcodeScannerActiveClass = () => {
  document.querySelector('body')?.classList.remove('barcode-scanner-active')
}

const router = useIonRouter()
onIonViewDidEnter(async () => {
  const data = await scanSingleBarcode()
  router.replace(`/home/send/${data}`)
})

onIonViewWillLeave(() => {
  removeBarcodeScannerActiveClass()
})
</script>

<template>
  <IonPage>
    <IonContent fullscreen>
      <div class="container">
        <IonSpinner />
      </div>
      <div class="action">
        <ActionFooter />
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

<style>
/* Hide all elements */
body.barcode-scanner-active {
  visibility: hidden;
  --background: transparent;
  --ion-background-color: transparent;
}

/* Show only the barcode scanner modal */
.barcode-scanner-modal,
.action {
  visibility: visible;
}

@media (prefers-color-scheme: dark) {
  .barcode-scanner-modal {
    --background: transparent;
    --ion-background-color: transparent;
  }
}
</style>
