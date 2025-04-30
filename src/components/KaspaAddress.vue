<script setup lang="ts">
import { useKaspa } from '@/composables/useKaspa'
import { shortenKaspaAddress } from '@/utils/helpers'
import { Clipboard } from '@capacitor/clipboard'
import { IonIcon, toastController } from '@ionic/vue'
import { copyOutline } from 'ionicons/icons'
import { computed } from 'vue'

const props = defineProps<{
  address: string
  copiable?: boolean
  shorten?: number
}>()

const kaspa = useKaspa()
const href = computed(() => {
  return `${kaspa.explorerUrl.value}/addresses/${props.address}`
})

async function handleCopy() {
  if (!props.copiable) return

  await Clipboard.write({
    string: props.address,
  })

  const toast = await toastController.create({
    message: 'Copied to clipboard',
    duration: 1500,
    position: 'bottom',
  })

  await toast.present()
}
</script>

<template>
  <div class="wrapper">
    <a :href="href" target="_blank" class="address">{{
      shorten ? shortenKaspaAddress(address, shorten) : address
    }}</a>
    <IonIcon v-if="copiable" :icon="copyOutline" @click="handleCopy" />
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  align-items: center;
}

.wrapper > :not(:first-child) {
  margin-inline-start: 0.4rem;
  margin-inline-end: 0.4rem;
}

.address {
  text-decoration: none;
  color: inherit;
}
</style>
