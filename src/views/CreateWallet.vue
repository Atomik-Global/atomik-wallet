<script setup lang="ts">
import { useKaspa } from '@/composables/useKaspa'
import {
  K_ACCOUNT_PRIMARY,
  useSecureStorage,
} from '@/composables/useSecureStorage'
import { Clipboard } from '@capacitor/clipboard'
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonPage,
  IonRow,
  IonSpinner,
  IonText,
  IonTitle,
  IonToast,
  IonToolbar,
  toastController,
  useIonRouter,
} from '@ionic/vue'
import { copyOutline } from 'ionicons/icons'
import { computed, onBeforeMount, ref } from 'vue'

const kaspa = useKaspa()
const storage = useSecureStorage()
const phrase = ref('')
const seed = ref('')
const splitPhrase = computed(() => phrase.value.split(' '))

onBeforeMount(() => {
  kaspa.generateMnemonic().then((mnemonic) => {
    phrase.value = mnemonic.phrase
    seed.value = mnemonic.toSeed()
  })
})

async function copyToClipboard() {
  await Clipboard.write({
    string: phrase.value,
  })
}

const isStoringPhrase = ref(false)
const router = useIonRouter()
async function storePhraseAndRedirect() {
  try {
    isStoringPhrase.value = true
    const account = await kaspa.createWalletFromSeed(seed.value)
    await storage.setItem(K_ACCOUNT_PRIMARY, JSON.stringify(account))
    router.replace('/setup/pin')
  } catch (error) {
    console.error(seed.value)
    const toast = await toastController.create({
      message: 'Something went wrong',
      duration: 1500,
      position: 'bottom',
    })
    await toast.present()
  } finally {
    isStoringPhrase.value = false
  }
}
</script>

<template>
  <IonPage>
    <IonHeader translucent>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton />
        </IonButtons>
        <IonTitle>Recovery Phrase</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent fullscreen class="ion-padding">
      <IonHeader collapse="condense">
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
          <IonRow>
            <IonCol v-for="(item, i) in splitPhrase" :key="item" size="4">
              <div class="phrase-item">
                <IonText>
                  {{ (i + 1).toString().padStart(2, '0') }}. {{ item }}
                </IonText>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
        <div style="margin-top: 0.5rem">
          <IonButton
            id="copy-toast-trigger"
            expand="block"
            fill="clear"
            @click="copyToClipboard"
          >
            <IonIcon :icon="copyOutline" />
            Copy to Clipboard
          </IonButton>
          <IonToast
            color="dark"
            trigger="copy-toast-trigger"
            message="Items copied to clipboard"
            :duration="500"
          />
        </div>
      </div>

      <div class="ion-padding action-wrapper">
        <IonButton
          v-if="!isStoringPhrase"
          expand="block"
          @click="storePhraseAndRedirect"
        >
          Create new Wallet
        </IonButton>
        <IonButton v-else expand="block" disabled>
          <IonSpinner name="dots" />
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
