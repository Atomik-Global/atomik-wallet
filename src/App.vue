<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import KaspaLoader from './components/KaspaLoader.vue'
import { useBiometric } from './composables/useBiometric'
import { useSecureStorage } from './composables/useSecureStorage'

useSecureStorage().init()
useBiometric()
</script>

<template>
  <IonApp>
    <KaspaLoader>
      <IonRouterOutlet />
    </KaspaLoader>
  </IonApp>
</template>
