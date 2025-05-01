<script setup lang="ts">
import { injKaspa, Kaspa } from '@/injectives'
import { shortenKaspaAddress } from '@/utils/helpers'
import { Clipboard } from '@capacitor/clipboard'
import { IonIcon, toastController } from '@ionic/vue'
import { copyOutline } from 'ionicons/icons'
import { computed, inject } from 'vue'

const props = defineProps<{
  address: string
  copiable?: boolean
  shorten?: number
}>()

const kaspa = inject(injKaspa) as Kaspa
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
    color: 'light',
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
