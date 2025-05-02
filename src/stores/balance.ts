import {
  GetFullTransactionResponse,
  GetUtxoResponse,
  useKaspaRest,
} from '@/composables/useKaspaRest'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAccountStore } from './account'

export const useBalanceStore = defineStore('balance', () => {
  const kaspaRest = useKaspaRest()
  const accountStore = useAccountStore()

  const balance = ref(0)
  const utxos = ref<GetUtxoResponse[]>([])
  const transactions = ref<GetFullTransactionResponse[]>([])

  function setBalance(value: number) {
    balance.value = value
  }

  function getByPercentage(percentValue: number) {
    return balance.value * (percentValue / 100)
  }

  function matchPercentage(percentvalue: number, value: number) {
    return getByPercentage(percentvalue) === value
  }

  async function fetchBalance() {
    const address = accountStore.primary?.address
    if (!address) return

    const data = await kaspaRest.getBalance(address)
    balance.value = data.balance / 100_000_000
  }

  async function fetchUtxos() {
    const address = accountStore.primary?.address
    if (!address) return

    const data = await kaspaRest.getUtxos(address)
    utxos.value = data
  }

  async function fetchTransactions() {
    const address = accountStore.primary?.address
    if (!address) return

    const data = await kaspaRest.getFullTransactionsPage(address)
    transactions.value = data
  }

  return {
    balance,
    utxos,
    transactions,
    setBalance,
    getByPercentage,
    matchPercentage,
    fetchBalance,
    fetchUtxos,
    fetchTransactions,
  }
})
