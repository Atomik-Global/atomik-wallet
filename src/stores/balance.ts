import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBalanceStore = defineStore('balance', () => {
  const balance = ref(0)

  function setBalance(value: number) {
    balance.value = value
  }

  function getByPercentage(percentValue: number) {
    return balance.value * (percentValue / 100)
  }

  function matchPercentage(percentvalue: number, value: number) {
    return getByPercentage(percentvalue) === value
  }

  return {
    balance,
    setBalance,
    getByPercentage,
    matchPercentage,
  }
})
