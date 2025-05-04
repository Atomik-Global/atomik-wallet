<script setup lang="ts">
import ClipboardCopy from '@/components/ClipboardCopy.vue'
import { K_ACCOUNTS, useSecureStorage } from '@/composables/useSecureStorage'
import { injKaspa, Kaspa } from '@/injectives'
import { useAccountStore } from '@/stores/account'
import { useNetworkStore } from '@/stores/network'
import { NetworkType } from '@/types'
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonPage,
  IonRow,
  IonSkeletonText,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  onIonViewWillEnter,
  toastController,
  useIonRouter,
} from '@ionic/vue'
import { computed, inject, ref } from 'vue'

const kaspa = inject(injKaspa) as Kaspa
const networkStore = useNetworkStore()
const accountStore = useAccountStore()
const phrase = ref('')
const seed = ref('')
const splitPhrase = computed(() => phrase.value.split(' '))
const initializing = ref(true)
const storage = useSecureStorage()

onIonViewWillEnter(() => {
  initializing.value = true
  kaspa.init(networkStore.networkId).then(() => {
    kaspa.generateMnemonic().then((mnemonic) => {
      phrase.value = mnemonic.phrase
      seed.value = mnemonic.toSeed()
    })
    initializing.value = false
  })
})

const isStoringPhrase = ref(false)
const router = useIonRouter()
async function storePhraseAndRedirect() {
  try {
    isStoringPhrase.value = true

    const testnetAccount = await kaspa.createWalletFromSeed(
      seed.value,
      NetworkType.testnet,
    )

    const mainnetAccount = await kaspa.createWalletFromSeed(
      seed.value,
      NetworkType.mainnet,
    )

    await storage.setItem(
      K_ACCOUNTS,
      JSON.stringify([testnetAccount, mainnetAccount]),
    )

    const account = {
      [NetworkType.mainnet]: mainnetAccount,
      [NetworkType.testnet]: testnetAccount,
    }[networkStore.networkId]

    await accountStore.setPrimary(account)
    router.replace('/setup/pin')
  } catch (error) {
    console.error(seed.value)
    const toast = await toastController.create({
      message: 'Something went wrong',
      duration: 1500,
      color: 'light',
    })
    await toast.present()
  } finally {
    isStoringPhrase.value = false
  }
}
</script>

<template>
  <IonPage>
    <IonHeader translucent collapse="condense">
      <IonToolbar />
    </IonHeader>
    <IonContent fullscreen class="ion-padding">
      <IonHeader>
        <IonTitle size="large">Recovery Phrase</IonTitle>
        <div class="subtitle">
          <IonText>
            Please write down the following recovery phrase and keep it in safe
            place.
          </IonText>
        </div>
      </IonHeader>

      <div class="mt-4">
        <IonGrid>
          <IonRow v-if="!initializing">
            <IonCol v-for="(item, i) in splitPhrase" :key="item" size="4">
              <div class="phrase-item">
                <IonText>
                  {{ (i + 1).toString().padStart(2, '0') }}. {{ item }}
                </IonText>
              </div>
            </IonCol>
          </IonRow>
          <IonRow v-else>
            <IonCol v-for="i in 12" :key="i" size="4">
              <IonSkeletonText animated class="skeleton-phrase-item" />
            </IonCol>
          </IonRow>
        </IonGrid>
        <div style="margin-top: 0.5rem">
          <ClipboardCopy :item="phrase" />
        </div>
      </div>

      <div class="ion-padding action-wrapper">
        <IonButton
          :disabled="isStoringPhrase"
          color="dark"
          expand="block"
          @click="storePhraseAndRedirect"
        >
          <IonSpinner v-if="isStoringPhrase" name="dots" />
          <IonText v-else>Create new Wallet</IonText>
        </IonButton>
      </div>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.subtitle {
  padding: 0 0.75rem;
  color: var(--ion-text-color-step-400);
}

.mt-4 {
  margin-top: 1rem;
}

.skeleton-phrase-item {
  height: 2rem;
  border-radius: 99rem;
}

.phrase-item {
  padding: 0.75rem;
  font-size: 14px;
  border-radius: 99rem;
  background-color: var(--ion-background-color-step-50);
}

.action-wrapper {
  position: fixed;
  bottom: var(--ion-safe-area-bottom, 0);
  left: 0;
  right: 0;
}
</style>
