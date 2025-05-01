<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import KaspaProvider from './components/KaspaProvider.vue'
import { useBiometric } from './composables/useBiometric'
import { useSecureStorage } from './composables/useSecureStorage'

useSecureStorage().init()
useBiometric()
</script>

<template>
  <KaspaProvider>
    <IonApp>
      <IonRouterOutlet />
    </IonApp>
  </KaspaProvider>
</template>
