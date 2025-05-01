<script setup lang="ts">
import { injKaspa } from '@/injectives'
import { onBeforeMount, provide, ref } from 'vue'
import { useKaspa } from '../composables/useKaspa'

const kaspa = useKaspa()
const isKaspaReady = ref(false)
onBeforeMount(() => {
  // prevent rebuild if kaspa ready
  if (isKaspaReady.value) {
    return
  }

  kaspa.init().then(() => {
    isKaspaReady.value = true
  })
})
provide(injKaspa, kaspa)
</script>

<template>
  <div v-if="!isKaspaReady"></div>
  <slot v-else />
</template>
