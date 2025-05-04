import type * as k from '@/kaspa/kaspa'
import url from '@/kaspa/kaspa_bg.wasm?url'
import {
  AddressEventListenerProps,
  TrackAddressProps,
  WalletAccount,
} from '@/types'
import { computed, InjectionKey, ref, shallowRef } from 'vue'

export const injectiveKAS = () => {
  const kaspa = shallowRef<typeof k>()
  const rpc = shallowRef<k.RpcClient>()
  const networkId = ref<'mainnet' | 'testnet-10'>('testnet-10')
  const processor = shallowRef<k.UtxoProcessor>()
  const context = shallowRef<k.UtxoContext>()
  const isMainnet = computed(() => networkId.value === 'mainnet')
  const ticker = computed(() => (isMainnet.value ? 'KAS' : 'TKAS'))
  const trackedAddresses = ref<string[]>([])
  const explorerUrl = computed(() => {
    return isMainnet.value
      ? 'https://explorer.kaspa.org'
      : 'https://explorer-tn10.kaspa.org'
  })

  async function init() {
    kaspa.value = await import(
      /* @vite-ignore */ new URL('../kaspa/kaspa.js', import.meta.url).href
    )

    const kas = kaspa.value!
    await kas.default(url)

    // let url: string | undefined
    // if (config.public.kaspa.node) {
    //   url = config.public.kaspa.node
    // }

    await dispose()

    rpc.value = new kas.RpcClient({
      encoding: kas.Encoding.Borsh,
      networkId: networkId.value,
      resolver: new kas.Resolver(),
      // url,
    })

    processor.value = new kas.UtxoProcessor({
      networkId: networkId.value,
      rpc: rpc.value,
    })

    context.value = new kas.UtxoContext({
      processor: processor.value,
    })

    if (!rpc.value.isConnected) {
      await rpc.value.connect()
      if (processor.value.isActive) {
        await processor.value.stop()
        await processor.value.start()
      }
    }
  }

  async function dispose() {
    if (rpc.value && rpc.value.isConnected) {
      if (processor.value?.isActive) {
        await untrackAddresses()
        await processor.value.stop()
      }
    }
  }

  async function generateMnemonic() {
    return kaspa.value!.Mnemonic.random(12)
  }

  async function createWalletFromSeed(seed: string): Promise<WalletAccount> {
    const xprv = new kaspa.value!.XPrv(seed).derivePath("m/44'/23'/0'/0/0")
    const priv = xprv.toPrivateKey()
    const pubk = priv.toPublicKey()
    const addr = pubk.toAddress(networkId.value)

    return {
      address: addr.toString(),
      pubkey: pubk.toString(),
      privkey: priv.toString(),
      xpubkey: pubk.toXOnlyPublicKey().toString(),
    }
  }

  function addressEventListener({
    event,
    onChangeBalance,
  }: AddressEventListenerProps) {
    if (event.type === 'balance') {
      if (onChangeBalance) {
        onChangeBalance(
          event.data.balance?.pending ?? 0n,
          event.data.balance?.mature ?? 0n,
        )
      }
    }
  }

  async function trackAddresses({
    addresses,
    onChangeBalance,
  }: TrackAddressProps) {
    await processor.value!.start()
    await context.value!.trackAddresses(addresses)

    trackedAddresses.value = addresses
    processor.value!.addEventListener((event) => {
      return addressEventListener({ event, onChangeBalance })
    })
  }

  async function untrackAddresses() {
    if (trackedAddresses.value.length === 0) {
      return
    }

    await context.value!.unregisterAddresses(trackedAddresses.value)
    processor.value!.removeEventListener('*', (event) => {
      return addressEventListener({ event })
    })
    await processor.value!.stop()
    trackedAddresses.value = []
  }

  function isValidAddress(address: string) {
    const prefix = isMainnet.value ? 'kaspa:' : 'kaspatest:'
    return address.startsWith(prefix)
  }

  function toSompi(amount: string | null | undefined) {
    if (amount === null || amount === undefined) {
      return 0n
    }
    return kaspa.value!.kaspaToSompi(amount) ?? 0n
  }

  function toKas(amount: string | number | bigint | k.HexString) {
    return kaspa.value!.sompiToKaspaString(
      typeof amount === 'string' ? parseFloat(amount) : amount,
    )
  }

  function toKasRaw(amount: string | number | bigint | k.HexString) {
    return Number(amount) / sompiPerKas()
  }

  function sompiPerKas() {
    return 100_000_000
  }

  async function getUtxoEntries(addresses: string[]) {
    return rpc.value!.getUtxosByAddresses(addresses)
  }

  function createTransactions(settings: k.IGeneratorSettingsObject) {
    return kaspa.value!.createTransactions({
      ...settings,
      networkId: networkId.value,
    })
  }

  function generateTransaction(data: k.IGeneratorSettingsObject) {
    return new kaspa.value!.Generator({
      ...data,
      networkId: networkId.value,
    })
  }

  async function getFeeEstimate() {
    const { estimate } = await rpc.value!.getFeeEstimate()

    return {
      low: estimate.lowBuckets[0].feerate,
      normal: estimate.normalBuckets[0].feerate,
      high: estimate.priorityBucket.feerate,
    }
  }

  async function transferKas(
    data: k.IGeneratorSettingsObject,
    privateKey: string,
  ) {
    const { transactions, summary } = await kaspa.value!.createTransactions({
      ...data,
      networkId: networkId.value,
    })

    if (transactions.length > 0) {
      const firstTransaction = transactions[0]
      firstTransaction.sign([privateKey])
      await firstTransaction.submit(rpc.value!)
    }

    // Handle the remaining transactions, waiting for the `time-to-submit` event
    for (let i = 1; i < transactions.length; i++) {
      const transaction = transactions[i]
      transaction.sign([privateKey])
      await transaction.submit(rpc.value!)
    }

    return summary.finalTransactionId
  }

  async function getBalanceByAddress(address: string) {
    return rpc.value!.getBalanceByAddress({
      address,
    })
  }

  return {
    init,
    dispose,
    rpc,
    isMainnet,
    networkId,
    ticker,
    explorerUrl,
    generateMnemonic,
    createWalletFromSeed,
    trackAddresses,
    untrackAddresses,
    isValidAddress,
    toSompi,
    toKas,
    toKasRaw,
    sompiPerKas,
    getFeeEstimate,
    getUtxoEntries,
    transferKas,
    createTransactions,
    getBalanceByAddress,
    generateTransaction,
  }
}

const kas = injectiveKAS()
export type Kaspa = typeof kas
export const injKaspa = Symbol('KASPA') as InjectionKey<Kaspa>
