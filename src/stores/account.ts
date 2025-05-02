import { WalletAccount } from '@/composables/useKaspa'
import {
  K_ACCOUNT_PRIMARY,
  K_ACCOUNTS,
  useSecureStorage,
} from '@/composables/useSecureStorage'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAccountStore = defineStore('account', () => {
  const storage = useSecureStorage()

  const primary = ref<WalletAccount>()
  const accounts = ref<WalletAccount[]>([])

  const init = async () => {
    await initPrimary()
    await initAccounts()
  }

  const initPrimary = async () => {
    const item = await storage.getItem(K_ACCOUNT_PRIMARY)
    if (!item) return

    const parsed = JSON.parse(item) as WalletAccount
    primary.value = parsed
  }

  const initAccounts = async () => {
    if (!primary.value) {
      return
    }

    const storedAccounts = await storage.getItem(K_ACCOUNTS)
    if (!storedAccounts) {
      await storage.setItem(K_ACCOUNTS, JSON.stringify([primary.value]))
      return
    }

    const storedAccountsParsed = JSON.parse(storedAccounts) as WalletAccount[]
    const primaryOnAccounts = storedAccountsParsed
      .map((e) => e.address)
      .includes(primary.value.address)

    if (!primaryOnAccounts) {
      const newList = [primary.value, ...storedAccountsParsed]
      await storage.setItem(K_ACCOUNTS, JSON.stringify(newList))
    }
  }

  const setPrimary = async (account: WalletAccount) => {
    await storage.setItem(K_ACCOUNT_PRIMARY, JSON.stringify(account))
    primary.value = account
  }

  return {
    init,
    primary,
    accounts,
    setPrimary,
  }
})
