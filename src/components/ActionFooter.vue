<script setup lang="ts">
import { IonButton, IonCol, IonGrid, IonRow, useIonRouter } from '@ionic/vue'
import { computed } from 'vue'

const router = useIonRouter()
const canGoBack = computed(() => router.canGoBack())
</script>

<template>
  <div class="footer ion-padding">
    <IonGrid>
      <IonRow>
        <IonCol v-if="!!$slots['default']" size="8">
          <slot />
        </IonCol>
        <IonCol :size="$slots['default'] ? '4' : '12'">
          <IonButton
            v-if="canGoBack"
            color="light"
            expand="block"
            @click="router.back()"
          >
            Back
          </IonButton>
        </IonCol>
      </IonRow>
    </IonGrid>
  </div>
</template>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
