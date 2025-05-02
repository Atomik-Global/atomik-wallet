<script setup lang="ts">
import { IonSegment, IonSegmentButton, IonText } from '@ionic/vue'
</script>

<template>
  <div class="segment-container">
    <IonSegment>
      <IonSegmentButton value="history" content-id="history">
        <IonText>History</IonText>
      </IonSegmentButton>
      <IonSegmentButton value="utxo" content-id="utxo">
        <IonText>UTXO</IonText>
      </IonSegmentButton>
    </IonSegment>
  </div>
</template>

<style scoped>
.segment-container {
  position: relative;
  z-index: 10;
  margin-top: 0.75rem;
  max-width: 42%;
}
</style>
