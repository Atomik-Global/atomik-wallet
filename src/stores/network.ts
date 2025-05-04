import { NetworkType } from '@/types'
import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'

export const useNetworkStore = defineStore('pinia', () => {
  const networkId = ref<NetworkType>(NetworkType.mainnet)
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

  const setNetworkId = (value: NetworkType) => {
    networkId.value = value
  }

  return {
    networkId: readonly(networkId),
    setNetworkId,
    isMainnet,
    ticker,
    explorerUrl,
    isValidAddress,
  }
})
