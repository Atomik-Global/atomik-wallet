import { injKaspa, Kaspa } from '@/injectives'
import { NetworkType } from '@/types'
import { defineStore } from 'pinia'
import { computed, inject, readonly, ref } from 'vue'

export const useNetworkStore = defineStore('pinia', () => {
  const kaspa = inject(injKaspa) as Kaspa

  const networkId = ref<NetworkType>(NetworkType.testnet)
  const isMainnet = computed(() => networkId.value === NetworkType.mainnet)
  const ticker = computed(() => (isMainnet.value ? 'KAS' : 'TKAS'))

  const explorerUrl = computed(() => {
    return isMainnet.value
      ? 'https://explorer.kaspa.org'
      : 'https://explorer-tn10.kaspa.org'
  })

  const isValidAddress = (address: string) => {
    const prefix = isMainnet.value ? 'kaspa:' : 'kaspatest:'
    return address.startsWith(prefix)
  }

  return {
    networkId: readonly(networkId),
    isMainnet,
    ticker,
    explorerUrl,
    isValidAddress,
  }
})
