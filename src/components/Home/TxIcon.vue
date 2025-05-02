<script setup lang="ts">
import { useAccountStore } from '@/stores/account'
import { IonIcon } from '@ionic/vue'
import { arrowDown, arrowUp } from 'ionicons/icons'

defineProps<{
  item?: string
}>()

const accountStore = useAccountStore()
</script>

<template>
  <IonIcon
    v-if="!item || item === accountStore.primary?.address"
    aria-hidden="true"
    :icon="arrowDown"
    slot="start"
    color="success"
  />
  <IonIcon
    v-else
    aria-hidden="true"
    :icon="arrowUp"
    slot="start"
    color="danger"
  />
</template>
