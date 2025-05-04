<script setup lang="ts">
import { useNetworkStore } from '@/stores/network'
import { shortenKaspaAddress } from '@/utils/helpers'
import { Browser } from '@capacitor/browser'
import { Clipboard } from '@capacitor/clipboard'
import { IonIcon, toastController } from '@ionic/vue'
import { copyOutline } from 'ionicons/icons'

const props = defineProps<{
  address: string
  copiable?: boolean
  shorten?: number
}>()

const networkStore = useNetworkStore()

const handleCopy = async () => {
  if (!props.copiable) {
    return
  }

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

const viewOnChain = () => {
  Browser.open({
    url: `${networkStore.explorerUrl}/addresses/${props.address}`,
  })
}
</script>

<template>
  <div class="wrapper">
    <div class="address" @click.native="viewOnChain">
      {{ shorten ? shortenKaspaAddress(address, shorten) : address }}
    </div>
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
