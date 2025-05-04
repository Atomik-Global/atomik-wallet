<script setup lang="ts">
import {
  alertController,
  IonButton,
  IonIcon,
  IonText,
  useIonRouter,
} from '@ionic/vue'
import { grid, home, scanCircle } from 'ionicons/icons'

async function onClickAsset() {
  const alert = await alertController.create({
    header: 'Coming Soon',
    subHeader: 'This feature is not yet available',
    message: 'Once it is ready, we will announce it on Kaspa discord server',
    buttons: ['OK'],
  })

  await alert.present()
}

const router = useIonRouter()
</script>

<template>
  <div class="footer">
    <div class="footer-nav">
      <div class="footer-nav-items">
        <IonIcon :icon="home" class="footer-nav-items-icon active" />
      </div>
      <div class="footer-nav-items p-0">
        <IonButton color="dark" @click="router.push('/home/scan')">
          <IonIcon slot="start" :icon="scanCircle" />
          <IonText>Scan to Pay</IonText>
        </IonButton>
      </div>
      <div class="footer-nav-items" @click="onClickAsset">
        <IonIcon :icon="grid" class="footer-nav-items-icon" />
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
  opacity: 20%;
}

.footer-nav-items-icon.active {
  font-size: 1.5rem;
  opacity: 100%;
}
</style>
