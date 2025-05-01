import { injKaspa, Kaspa } from '@/injectives'
import { computed, inject } from 'vue'

export function useKaspaRest() {
  const kaspa = inject(injKaspa) as Kaspa

  const apiUrl = computed(() => {
    return kaspa.isMainnet.value
      ? 'https://api.kaspa.org'
      : 'https://api-tn10.kaspa.org'
  })

  async function getBalance(address: string): Promise<GetBalanceResponse> {
    const response = await fetch(`${apiUrl.value}/addresses/${address}/balance`)
    return await response.json()
  }

  async function getUtxos(address: string): Promise<GetUtxoResponse[]> {
    const response = await fetch(`${apiUrl.value}/addresses/${address}/utxos`)
    return await response.json()
  }

  async function getFullTransactionsPage(
    address: string,
  ): Promise<GetFullTransactionResponse[]> {
    const url = new URL(
      `${apiUrl.value}/addresses/${address}/full-transactions-page`,
    )

    url.searchParams.append('limit', '50')
    url.searchParams.append('before', '0')
    url.searchParams.append('after', '0')
    url.searchParams.append('resolve_previous_outpoints', 'no')

    const response = await fetch(url)
    return await response.json()
  }

  return {
    getBalance,
    getUtxos,
    getFullTransactionsPage,
  }
}

export interface GetBalanceResponse {
  address: string
  balance: number
}

export interface GetUtxoResponse {
  address: string
  outpoint: {
    transactionId: string
    index: number
  }
  utxoEntry: {
    amount: string
    scriptPublicKey: {
      scriptPublicKey: string
    }
    blockDaaScore: string
    isCoinbase: boolean
  }
}

export interface GetFullTransactionResponse {
  subnetwork_id: string
  transaction_id: string
  hash: string
  mass: number
  payload: null
  block_hash: string[]
  block_time: number
  is_accepted: boolean
  accepting_block_hash: string
  accepting_block_blue_score: number
  accepting_block_time: number
  inputs: {
    transaction_id: string
    index: number
    previous_outpoint_hash: string
    previous_outpoint_index: string
    previous_outpoint_address: string
    previous_outpoint_amount: number
    signature_script: string
    sig_op_count: number
  }[]
  outputs: {
    transaction_id: string
    index: number
    amount: number
    script_public_key: string
    script_public_key_address: string
    script_public_key_type: string
  }[]
}
