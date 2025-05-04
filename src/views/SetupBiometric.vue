<script setup lang="ts">
import { useBiometric } from '@/composables/useBiometric'
import {
  K_USE_BIOMETRIC,
  K_USER_ONBOARDED,
  useSecureStorage,
} from '@/composables/useSecureStorage'
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  toastController,
  useIonRouter,
} from '@ionic/vue'
import { ref } from 'vue'

const storage = useSecureStorage()
const router = useIonRouter()
const biometric = useBiometric()
const isAuthenticating = ref(false)

async function yes() {
  try {
    isAuthenticating.value = true
    await biometric.authenticate()
    await storage.setItem(K_USE_BIOMETRIC, 'true')
    await storage.setItem(K_USER_ONBOARDED, 'true')
    router.back()
    router.replace('/home')
  } catch (error) {
    console.error(error)
    await toastController.create({
      message: (error as Error).message,
      duration: 1500,
      color: 'light',
    })
  } finally {
    isAuthenticating.value = false
  }
}

async function no() {
  await storage.setItem(K_USE_BIOMETRIC, 'false')
  await storage.setItem(K_USER_ONBOARDED, 'true')
  router.replace('/home')
}
</script>

<template>
  <IonPage>
    <IonHeader translucent collapse="condense">
      <IonToolbar />
    </IonHeader>
    <IonContent fullscreen class="ion-padding">
      <IonHeader>
        <IonTitle size="large">Use {{ biometric.biometryType }}?</IonTitle>
        <div class="subtitle">
          <IonText>
            {{ biometric.biometryType }} provides more secure way to
            authenticate your actions. Would you like to use it?
          </IonText>
        </div>
      </IonHeader>

      <div class="ion-padding action-wrapper">
        <IonButton
          color="dark"
          :disabled="isAuthenticating"
          expand="block"
          @click="yes"
        >
          <template v-if="!isAuthenticating"> Yes, please </template>
          <IonSpinner v-else name="dots" />
        </IonButton>

        <IonButton
          :disabled="isAuthenticating"
          expand="block"
          color="light"
          @click="no"
          >Nah, not now</IonButton
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

.action-wrapper > :not(:last-child) {
  margin-block-start: 0.75rem;
  margin-block-end: 0.75rem;
}
</style>
