<script setup lang="ts">
import {
  IonBackButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonPage,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import { backspaceOutline, checkmark } from 'ionicons/icons'
import { ref, watch } from 'vue'

const emit = defineEmits<{
  (e: 'submit', data: string): void
}>()

defineProps<{
  subtitle?: string
}>()

const pin = ref<string>('')

watch(pin, (value) => {
  if (value.length === 6) {
    submit()
  }
})

function append(value: string) {
  if (pin.value.length < 6) {
    pin.value += value
  }
}

function revert() {
  if (pin.value.length > 0) {
    pin.value = pin.value.slice(0, pin.value.length - 1)
  }
}

function submit() {
  if (pin.value.length < 6) {
    return
  }

  emit('submit', pin.value)
}
</script>

<template>
  <IonPage>
    <IonHeader translucent>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton />
        </IonButtons>
        <IonTitle>Enter your PIN</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent fullscreen class="ion-padding">
      <IonHeader collapse="condense">
        <IonBackButton />
        <IonTitle size="large">Enter your PIN</IonTitle>
        <div v-if="subtitle" class="subtitle">
          <IonText>{{ subtitle }}</IonText>
        </div>
      </IonHeader>

      <IonGrid class="pin-display">
        <IonRow>
          <IonCol v-for="i in 6" :key="i">
            <div v-if="pin[i - 1]" class="pin-display-items">*</div>
            <div v-else class="pin-display-items-empty">
              <div class="pin-display-items-empty__item" />
            </div>
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonGrid class="pin-input">
        <IonRow>
          <IonCol class="pin-input-items" @click.native="append('1')">1</IonCol>
          <IonCol class="pin-input-items" @click.native="append('2')">2</IonCol>
          <IonCol class="pin-input-items" @click.native="append('3')">3</IonCol>
        </IonRow>
        <IonRow>
          <IonCol class="pin-input-items" @click.native="append('4')">4</IonCol>
          <IonCol class="pin-input-items" @click.native="append('5')">5</IonCol>
          <IonCol class="pin-input-items" @click.native="append('6')">6</IonCol>
        </IonRow>
        <IonRow>
          <IonCol class="pin-input-items" @click.native="append('7')">7</IonCol>
          <IonCol class="pin-input-items" @click.native="append('8')">8</IonCol>
          <IonCol class="pin-input-items" @click.native="append('9')">9</IonCol>
        </IonRow>
        <IonRow>
          <IonCol class="pin-input-items" @click.native="revert">
            <IonIcon :icon="backspaceOutline" />
          </IonCol>
          <IonCol class="pin-input-items" @click.native="append('0')">0</IonCol>
          <IonCol class="pin-input-items" @click.native="submit">
            <IonIcon :icon="checkmark" />
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.subtitle {
  padding: 0 0.75rem;
  color: var(--ion-text-color-step-400);
}

.pin-display {
  margin-top: 1rem;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
}

.pin-display-items {
  text-align: center;
  font-size: 5rem;
  vertical-align: middle;
  font-weight: bold;
}

.pin-display-items-empty {
  display: flex;
  height: 100%;
  width: 100%;
  min-height: 3rem;
  justify-content: center;
  align-items: start;
  margin-top: 1.3rem;
}

.pin-display-items-empty__item {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 999px;
  background-color: var(--ion-background-color-step-50);
}

.pin-input {
  position: fixed;
  bottom: var(--ion-safe-area-bottom, 0);
  left: 0;
  right: 0;
}

.pin-input-items {
  text-align: center;
  padding: 1.5rem;
  font-size: 1.5rem;
}

.pin-input-items:active {
  background-color: var(--ion-background-color-step-50);
}
</style>
