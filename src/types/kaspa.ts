import type { UtxoProcessorEvent, UtxoProcessorEventMap } from '@/kaspa/kaspa'

export interface WalletAccount {
  name?: string
  seed: string
  address: string
  pubkey: string
  privkey: string
  xpubkey: string
}

export type BalanceChangeCallback = (pending: bigint, mature: bigint) => void

export interface TrackAddressProps {
  addresses: string[]
  onChangeBalance: BalanceChangeCallback
}

export interface AddressEventListenerProps {
  event: UtxoProcessorEvent<keyof UtxoProcessorEventMap>
  onChangeBalance?: BalanceChangeCallback
}

export type NetworkOption = 'mainnet' | 'testnet-10'
