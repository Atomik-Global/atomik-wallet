import type * as k from '@/kaspa/kaspa'
import url from '@/kaspa/kaspa_bg.wasm?url'
import {
  AddressEventListenerProps,
  NetworkType,
  TrackAddressProps,
  WalletAccount,
} from '@/types'
import { InjectionKey, ref, shallowRef } from 'vue'

const K_DERIVATION_PATH = "m/44'/111111'/0'"

const buildDerivationPath = (index = 0, type = 0) => {
  return `${K_DERIVATION_PATH}/${type}/${index}`
}

export const injectiveKAS = () => {
  const kaspa = shallowRef<typeof k>()
  const rpc = shallowRef<k.RpcClient>()
  const processor = shallowRef<k.UtxoProcessor>()
  const context = shallowRef<k.UtxoContext>()
  const trackedAddresses = ref<string[]>([])

  async function init(networkId: string) {
    kaspa.value = await import(
      /* @vite-ignore */ new URL('../kaspa/kaspa.js', import.meta.url).href
    )

    const kas = kaspa.value!
    await kas.default(url)

    await dispose()

    const nodeURL =
      networkId == NetworkType.mainnet
        ? import.meta.env.VITE_KASPA_NODE_URL_MAINNET
        : import.meta.env.VITE_KASPA_NODE_URL_TESTNET

    rpc.value = new kas.RpcClient({
      encoding: kas.Encoding.Borsh,
      networkId,
      url: nodeURL,
    })

    processor.value = new kas.UtxoProcessor({
      networkId,
      rpc: rpc.value,
    })

    context.value = new kas.UtxoContext({
      processor: processor.value,
    })
  }

  async function connectRpc() {
    if (!rpc.value?.isConnected) {
      await rpc.value?.connect()
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

  async function createWalletFromSeed(
    seed: string,
    networkId: string,
  ): Promise<WalletAccount> {
    const path = buildDerivationPath(0)
    const xprv = new kaspa.value!.XPrv(seed).derivePath(path)
    const priv = xprv.toPrivateKey()
    const pubk = priv.toPublicKey()
    const addr = pubk.toAddress(networkId)

    return {
      seed,
      address: addr.toString(),
      pubkey: pubk.toString(),
      privkey: priv.toString(),
      xpubkey: pubk.toXOnlyPublicKey().toString(),
      xprv: xprv.intoString('xprv'),
    }
  }

  function createAccountDerived(
    seed: string,
    xprv: string,
    index: number,
    networkId: string,
  ) {
    const path = buildDerivationPath(index)
    const pkGenerator = new kaspa.value!.PrivateKeyGenerator(
      xprv,
      false,
      BigInt(index),
    )

    const pk = pkGenerator.receiveKey(index)
    const pb = pk.toPublicKey()
    const addr = pb.toAddress(networkId)

    return {
      seed,
      address: addr.toString(),
      pubkey: pb.toString(),
      privkey: pk.toString(),
      xpubkey: pb.toXOnlyPublicKey().toString(),
      xprv,
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
    if (processor.value!.isActive) {
      await processor.value!.stop()
    }

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

  function createTransactions(
    settings: k.IGeneratorSettingsObject,
    networkId: string,
  ) {
    return kaspa.value!.createTransactions({
      ...settings,
      networkId,
    })
  }

  function generateTransaction(
    data: k.IGeneratorSettingsObject,
    networkId: string,
  ) {
    return new kaspa.value!.Generator({
      ...data,
      networkId,
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
    networkId: string,
  ) {
    const { transactions, summary } = await kaspa.value!.createTransactions({
      ...data,
      networkId,
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
    connectRpc,
    dispose,
    generateMnemonic,
    createWalletFromSeed,
    trackAddresses,
    untrackAddresses,
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
    createAccountDerived,
  }
}

const kas = injectiveKAS()
export type Kaspa = typeof kas
export const injKaspa = Symbol('KASPA') as InjectionKey<Kaspa>
