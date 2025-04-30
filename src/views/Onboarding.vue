<script setup lang="ts">
import {
  IonButton,
  IonContent,
  IonPage,
  IonText,
  useIonRouter,
} from '@ionic/vue'

const router = useIonRouter()
</script>

<template>
  <IonPage>
    <IonContent class="ion-padding">
      <div class="container">
        <div class="actions ion-padding">
          <IonButton expand="block" @click="router.push('/wallet/create')"
            >Create new Wallet</IonButton
          >
          <IonButton color="light" expand="block">Import from Seed</IonButton>
          <IonText>
            <p class="disclaimer">
              By using our services, you have agreed to our <br />
              <IonText color="primary">Terms of Service</IonText>
              and
              <IonText color="primary">Privacy Policy</IonText>
            </p>
          </IonText>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.actions {
  position: fixed;
  bottom: var(--ion-safe-area-bottom, 0);
  left: 0;
  right: 0;
}

.actions > :not(:last-child) {
  margin-block-start: 0.75rem;
  margin-block-end: 0.75rem;
}

.disclaimer {
  font-size: 0.8rem;
  text-align: center;
  color: var(--ion-text-color-step-500);
}
</style>
