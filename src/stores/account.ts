import {
  K_ACCOUNT_PRIMARY,
  K_ACCOUNTS,
  useSecureStorage,
} from '@/composables/useSecureStorage'
import { injKaspa, Kaspa } from '@/injectives'
import { NetworkType, WalletAccount } from '@/types'
import { defineStore } from 'pinia'
import { computed, inject, ref } from 'vue'
import { useNetworkStore } from './network'

export const useAccountStore = defineStore('account', () => {
  const kaspa = inject(injKaspa) as Kaspa

  const storage = useSecureStorage()
  const networkStore = useNetworkStore()

  const primary = ref<WalletAccount>()
  const accounts = ref<WalletAccount[]>([])
  const filteredAccounts = computed(() => {
    return accounts.value.filter((e) => {
      return e.address.startsWith(
        networkStore.isMainnet ? 'kaspa:' : 'kaspatest:',
      )
    })
  })

  // [host] vs [primary]
  //
  // A [host] account is the main account that is first generated
  // using a seed phrase when creating new wallet on the create wallet
  // screen. It is the one that are used to derive new addresses.
  //
  // A [primary] account is the account that are currently being
  // displayed on the home page. It cannot exist without a [host] account,
  // so [host] is guaranteed to never `null` or `undefined`.
  const host = computed(() => {
    return filteredAccounts.value.find((e) => e.name === undefined)
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

  const createAccount = async (name: string, networkId: string) => {
    const currentAccounts = accounts.value.filter((e) => {
      return networkId === NetworkType.mainnet
        ? e.address.startsWith('kaspa:')
        : e.address.startsWith('kaspatest:')
    })

    const index = currentAccounts.length
    console.log(JSON.parse(JSON.stringify(filteredAccounts.value)))

    const account = kaspa.createAccountDerived(
      host.value!.seed,
      host.value!.xprv,
      index,
      networkId,
    )
    const newList = [...accounts.value, { ...account, name } as WalletAccount]

    await storage.setItem(K_ACCOUNTS, JSON.stringify(newList))
    await loadAccounts()
  }

  return {
    loadAccounts,
    primary,
    filteredAccounts,
    setPrimary,
    isPrimary,
    createAccount,
    nameExists,
  }
})
