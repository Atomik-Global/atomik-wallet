<script setup lang="ts">
import {
  K_ACCOUNT_PRIMARY,
  useSecureStorage,
} from '@/composables/useSecureStorage'
import { injKaspa } from '@/injectives'
import { useBalanceStore } from '@/stores/balance'
import { onBeforeMount, onUnmounted, provide, ref } from 'vue'
import { useKaspa, WalletAccount } from '../composables/useKaspa'

const kaspa = useKaspa()
const storage = useSecureStorage()
const balanceStore = useBalanceStore()

const isKaspaReady = ref(false)
onBeforeMount(() => {
  // prevent rebuild if kaspa ready
  if (isKaspaReady.value) {
    return
  }

  kaspa.init().then(() => {
    isKaspaReady.value = true

    storage.getItem(K_ACCOUNT_PRIMARY).then((account) => {
      if (!account) return

      const parsedAccount = JSON.parse(account) as WalletAccount

      kaspa.trackAddresses({
        addresses: [parsedAccount.address],
        onChangeBalance: async () => {
          await balanceStore.fetchBalance()
          await balanceStore.fetchUtxos()
          await balanceStore.fetchTransactions()
        },
      })
    })
  })
})

onUnmounted(() => {
  kaspa.untrackAddresses()
})

provide(injKaspa, kaspa)
</script>

<template>
  <div v-if="!isKaspaReady"></div>
  <slot v-else />
</template>
