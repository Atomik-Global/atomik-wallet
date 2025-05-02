<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { onBeforeMount } from 'vue'
import KaspaProvider from './components/KaspaProvider.vue'
import { useBiometric } from './composables/useBiometric'
import { useSecureStorage } from './composables/useSecureStorage'
import { useAccountStore } from './stores/account'

useSecureStorage().init()
useBiometric()

const accountStore = useAccountStore()
onBeforeMount(() => accountStore.init())
</script>

<template>
  <IonApp>
    <KaspaProvider>
      <IonRouterOutlet />
    </KaspaProvider>
  </IonApp>
</template>
