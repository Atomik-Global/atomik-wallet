import {
  GetFullTransactionResponse,
  useKaspaRest,
} from '@/composables/useKaspaRest'
import { injKaspa, Kaspa } from '@/injectives'
import type { UtxoEntryReference } from '@/kaspa/kaspa'
import { defineStore } from 'pinia'
import { computed, inject, ref, shallowRef } from 'vue'
import { useAccountStore } from './account'

export const useBalanceStore = defineStore('balance', () => {
  const kaspa = inject(injKaspa) as Kaspa
  const kaspaRest = useKaspaRest()
  const accountStore = useAccountStore()

  const balanceRaw = ref(0n)
  const balance = computed(() => Number(balanceRaw.value) / kaspa.sompiPerKas())
  const utxos = shallowRef<UtxoEntryReference[]>([])
  const transactions = ref<GetFullTransactionResponse[]>([])

  function getByPercentage(percentValue: number) {
    return balance.value * (percentValue / 100)
  }

  function matchPercentage(percentvalue: number, value: number) {
    return getByPercentage(percentvalue) === value
  }

  async function fetchBalance() {
    const address = accountStore.primary?.address
    console.log({ address })
    if (!address) return

    const data = await kaspa.getBalanceByAddress(address)
    balanceRaw.value = data.balance
  }

  async function fetchUtxos() {
    const address = accountStore.primary?.address
    if (!address) return

    const data = await kaspa.getUtxoEntries([address])
    utxos.value = data.entries.map((e) => e.toJSON() as UtxoEntryReference)
  }

  async function fetchTransactions() {
    const address = accountStore.primary?.address
    if (!address) return

    const data = await kaspaRest.getFullTransactionsPage(address)
    transactions.value = data
  }

  return {
    balance,
    balanceRaw,
    utxos,
    transactions,
    getByPercentage,
    matchPercentage,
    fetchBalance,
    fetchUtxos,
    fetchTransactions,
  }
})
