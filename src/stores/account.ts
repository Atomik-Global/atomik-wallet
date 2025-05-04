import { WalletAccount } from '@/composables/useKaspa'
import {
  K_ACCOUNT_PRIMARY,
  K_ACCOUNTS,
  useSecureStorage,
} from '@/composables/useSecureStorage'
import { injKaspa, Kaspa } from '@/injectives'
import { defineStore } from 'pinia'
import { computed, inject, ref } from 'vue'

export const useAccountStore = defineStore('account', () => {
  const kaspa = inject(injKaspa) as Kaspa

  const storage = useSecureStorage()

  const primary = ref<WalletAccount>()
  const accounts = ref<WalletAccount[]>([])

  // [host] vs [primary]
  //
  // [host]
  // Is the account the user created at first when creating a wallet
  // on the onboarding page. Indicated by `undefined` on its name.
  //
  // [primary]
  // is the account that is currently set as the default to be displayed
  // and use thorough the app.
  //
  // Users can switch their [primary] account, but cannot remove or change
  // the [host] account.
  const host = computed(() => {
    return accounts.value.find((e) => e.name === undefined)
  })

  const loadAccounts = async () => {
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

    const updatedAccounts = await storage.getItem(K_ACCOUNTS)
    if (!updatedAccounts) {
      return
    }

    const parsedUpdatedAccounts = JSON.parse(updatedAccounts) as WalletAccount[]
    accounts.value = parsedUpdatedAccounts
  }

  const setPrimary = async (account: WalletAccount) => {
    await storage.setItem(K_ACCOUNT_PRIMARY, JSON.stringify(account))
    primary.value = account
  }

  const isPrimary = (account: WalletAccount) => {
    return account.privkey === primary.value?.privkey
  }

  const nameExists = (name: string) => {
    const exists = accounts.value.find(
      (e) => e.name?.toLowerCase() === name.toLowerCase(),
    )

    return exists || name.toLowerCase() === 'primary account'
  }

  const createAccount = async (name: string) => {
    const mnemonic = await kaspa.generateMnemonic()
    const seed = mnemonic.toSeed()
    const account = await kaspa.createWalletFromSeed(seed)
    const newList = [...accounts.value, { ...account, name } as WalletAccount]

    await storage.setItem(K_ACCOUNTS, JSON.stringify(newList))
    await loadAccounts()
  }

  return {
    host,
    loadAccounts,
    primary,
    accounts,
    setPrimary,
    isPrimary,
    createAccount,
    nameExists,
  }
})
