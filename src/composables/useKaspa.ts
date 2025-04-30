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

  return {
    ticker,
    explorerUrl,
    generateMnemonic,
    createWalletFromSeed,
  }
}

export interface WalletAccount {
  address: string
  pubkey: string
  privkey: string
  xpubkey: string
}
