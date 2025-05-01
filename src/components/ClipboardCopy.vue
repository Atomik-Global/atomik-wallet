<script setup lang="ts">
import { Clipboard } from '@capacitor/clipboard'
import { IonButton, IonIcon, IonToast } from '@ionic/vue'
import { copyOutline } from 'ionicons/icons'

const props = defineProps<{
  item: string
}>()

async function copyToClipboard() {
  await Clipboard.write({
    string: props.item,
  })
}
</script>

<template>
  <IonButton
    id="copy-toast-trigger"
    color="dark"
    expand="block"
    fill="clear"
    @click="copyToClipboard"
  >
    <IonIcon slot="start" :icon="copyOutline" />
    Copy to Clipboard
  </IonButton>
  <IonToast
    trigger="copy-toast-trigger"
    message="Item copied to clipboard"
    color="light"
    :duration="1500"
  />
</template>
