import type * as Kaspa from '@/kaspa/kaspa'
import url from '@/kaspa/kaspa_bg.wasm?url'
import { computed, ref, shallowRef } from 'vue'

export const useKaspa = () => {
  const kaspa = shallowRef<typeof Kaspa>()
  const rpc = shallowRef<Kaspa.RpcClient>()
  const networkId = ref<'mainnet' | 'testnet-10'>('testnet-10')
  const processor = shallowRef<Kaspa.UtxoProcessor>()
  const context = shallowRef<Kaspa.UtxoContext>()
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
  }

  async function initIfNotInit() {
    if (!rpc.value || !context.value || !processor.value) {
      await init()
    }
  }

  async function generateMnemonic() {
    await initIfNotInit()
    return kaspa.value!.Mnemonic.random(12)
  }

  async function createWalletFromSeed(seed: string): Promise<WalletAccount> {
    await initIfNotInit()
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
    await initIfNotInit()

    await rpc.value!.connect()
    await processor.value!.start()
    await context.value!.trackAddresses(addresses)
    trackedAddresses.value = addresses
    processor.value!.addEventListener((event) => {
      return addressEventListener({ event, onChangeBalance })
    })
  }

  async function untrackAddresses() {
    await initIfNotInit()

    if (trackedAddresses.value.length === 0) {
      return
    }

    await context.value!.unregisterAddresses(trackedAddresses.value)
    processor.value!.removeEventListener('*', (event) => {
      return addressEventListener({ event })
    })
  }

  function isValidAddress(address: string) {
    const prefix = isMainnet.value ? 'kaspa:' : 'kaspatest:'
    return address.startsWith(prefix)
  }

  function toSompi(amount: string) {
    return kaspa.value!.kaspaToSompi(amount) ?? 0n
  }

  function toKas(amount: string | bigint | Kaspa.HexString) {
    return kaspa.value!.sompiToKaspaString(amount)
  }

  function sompiPerKas() {
    return 100_000_000
  }

  return {
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
    sompiPerKas,
  }
}

export interface WalletAccount {
  address: string
  pubkey: string
  privkey: string
  xpubkey: string
}

type BalanceChangeCallback = (pending: bigint, mature: bigint) => void

interface TrackAddressProps {
  addresses: string[]
  onChangeBalance: BalanceChangeCallback
}

interface AddressEventListenerProps {
  event: Kaspa.UtxoProcessorEvent<keyof Kaspa.UtxoProcessorEventMap>
  onChangeBalance?: BalanceChangeCallback
}
