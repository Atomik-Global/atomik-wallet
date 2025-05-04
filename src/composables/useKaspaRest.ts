import { useNetworkStore } from '@/stores/network'

export function useKaspaRest() {
  const networkStore = useNetworkStore()

  const getApi = async () => {
    return networkStore.isMainnet
      ? 'https://api.kaspa.org'
      : 'https://api-tn10.kaspa.org'
  }

  async function getBalance(address: string): Promise<GetBalanceResponse> {
    const api = await getApi()
    const response = await fetch(`${api}/addresses/${address}/balance`)
    return await response.json()
  }

  async function getUtxos(address: string): Promise<GetUtxoResponse[]> {
    const api = await getApi()
    const response = await fetch(`${api}/addresses/${address}/utxos`)
    return await response.json()
  }

  async function getFullTransactionsPage(
    address: string,
  ): Promise<GetFullTransactionResponse[]> {
    const api = await getApi()
    const url = new URL(`${api}/addresses/${address}/full-transactions-page`)

    url.searchParams.append('limit', '50')
    url.searchParams.append('before', '0')
    url.searchParams.append('after', '0')
    url.searchParams.append('resolve_previous_outpoints', 'no')
    url.searchParams.append(
      'fields',
      'transaction_id,outputs,accepting_block_time',
    )

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
