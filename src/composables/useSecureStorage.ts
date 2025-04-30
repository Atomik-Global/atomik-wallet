import { SecureStorage } from '@aparajita/capacitor-secure-storage'

export function useSecureStorage() {
  const init = () => setPrefix('atomik-wallet-')
  const setPrefix = SecureStorage.setKeyPrefix
  const setItem = SecureStorage.setItem
  const getItem = SecureStorage.getItem
  const clear = SecureStorage.clear
  const removeItem = SecureStorage.removeItem

  return {
    init,
    setPrefix,
    setItem,
    getItem,
    clear,
    removeItem,
  }
}

export const K_PIN = 'pin'
export const K_ACCOUNTS = 'accounts'
export const K_ACCOUNT_PRIMARY = 'account-primary'
export const K_USE_BIOMETRIC = 'use-biometric'
export const K_USER_ONBOARDED = 'user-onboarded'
