<script setup lang="ts">
import AccountDisplay from '@/components/AccountDisplay.vue'
import Footer from '@/components/Home/Footer.vue'
import Header from '@/components/Home/Header.vue'
import Segment from '@/components/Home/Segment.vue'
import SegmentContent from '@/components/Home/SegmentContent.vue'
import TxIcon from '@/components/Home/TxIcon.vue'
import { useConfirmBackToQuit } from '@/composables/useConfirmBackToQuit'
import { injKaspa, Kaspa } from '@/injectives'
import { useAccountStore } from '@/stores/account'
import { useBalanceStore } from '@/stores/balance'
import { useNetworkStore } from '@/stores/network'
import {
  blockTimeToDate,
  formatBlockDaaScore,
  shortenHash,
  toHumanReadableDate,
} from '@/utils/helpers'
import { Browser } from '@capacitor/browser'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSegmentView,
  IonToolbar,
  isPlatform,
  onIonViewWillEnter,
  toastController,
} from '@ionic/vue'
import { computed, inject, ref } from 'vue'

useConfirmBackToQuit()

const kaspa = inject(injKaspa) as Kaspa
const networkStore = useNetworkStore()
const accountStore = useAccountStore()
const isLoadingBalance = ref(true)
const isLoadingTxs = ref(true)
const isLoadingTxsInBg = ref(false)

onIonViewWillEnter(async () => {
  isLoadingBalance.value = true
  isLoadingTxs.value = true // show loading after switching account

  await kaspa.connectRpc()
  await accountStore.loadAccounts()
  kaspa.trackAddresses({
    addresses: [accountStore.primary!.address],
    onChangeBalance: async () => {
      await balanceStore.fetchBalance()

      // prevent multiple indexer fetch
      // prevent skeleton from appearing
      if (isLoadingTxsInBg.value) {
        return
      }

      isLoadingTxsInBg.value = true
      setTimeout(() => {
        balanceStore.fetchTransactions().then(() => {
          balanceStore.fetchUtxos().then(() => {
            isLoadingTxsInBg.value = false
          })
        })
      }, 5000) // 5s (sweetspot), wait for the indexer
    },
  })

  await balanceStore.fetchBalance()
  await balanceStore.fetchUtxos()
  isLoadingBalance.value = false

  balanceStore.fetchTransactions().then(() => {
    isLoadingTxs.value = false
  })
})

const balanceStore = useBalanceStore()
const isAndroid = computed(() => isPlatform('android'))

const utxos = computed(() => {
  return balanceStore.utxos.map((e, id) => ({ ...e, id }))
})

const transactions = computed(() => {
  return balanceStore.transactions.map((e) => ({
    ...e,
    outputs: e.outputs.map((o) => ({
      ...o,
      amount: kaspa.toKas(o.amount),
    })),
  }))
})

const fetchAll = async () => {
  try {
    isLoadingTxs.value = true
    await balanceStore.fetchBalance()
    await balanceStore.fetchUtxos()
    await balanceStore.fetchTransactions()
  } catch (error) {
    const toast = await toastController.create({
      message: 'Something went wrong',
      duration: 1500,
      color: 'light',
    })

    await toast.present()
  } finally {
    isLoadingTxs.value = false
  }
}

async function handleRefresh(event: any) {
  await fetchAll()
  event.target.complete()
}

function openTxInBrowser(txId: string) {
  Browser.open({ url: `${networkStore.explorerUrl}/txs/${txId}` })
}
</script>

<template>
  <IonPage>
    <IonHeader translucent class="ion-no-border" collapse="condense">
      <IonToolbar />
    </IonHeader>

    <IonContent class="ion-padding" :scroll-y="false">
      <IonRefresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <IonRefresherContent />
      </IonRefresher>
      <div class="scroll-container">
        <Header :loading="isLoadingBalance" />
        <AccountDisplay :loading="isLoadingBalance" />
        <Segment />
        <IonSegmentView class="mt-4">
          <SegmentContent
            id="history"
            key-field="transaction_id"
            :items="transactions"
            :loading="isLoadingTxs"
            @click="(item) => openTxInBrowser(item.transaction_id)"
          >
            <template #content-icon="{ item }">
              <TxIcon :item="item.outputs[0].script_public_key_address" />
            </template>
            <template #content-header-left="{ item }">
              {{ item.outputs[0].amount }} {{ networkStore.ticker }}
            </template>
            <template #content-header-right="{ item }">{{
              toHumanReadableDate(blockTimeToDate(item.accepting_block_time))
            }}</template>
            <template #content="{ item }">{{
              shortenHash(item.transaction_id, isAndroid ? 13 : 15)
            }}</template>
          </SegmentContent>
          <SegmentContent
            id="utxo"
            key-field="id"
            :items="utxos"
            :loading="isLoadingBalance"
            @click="(item) => openTxInBrowser(item.outpoint.transactionId)"
          >
            <template #content-icon>
              <TxIcon />
            </template>
            <template #content-header-left="{ item }">
              {{ kaspa.toKas(item.amount) }} {{ networkStore.ticker }}
            </template>
            <template #content-header-right="{ item }">
              DAA {{ formatBlockDaaScore(item.blockDaaScore.toString()) }}
            </template>
            <template #content="{ item }">{{
              shortenHash(item.outpoint.transactionId, isAndroid ? 13 : 15)
            }}</template>
          </SegmentContent>
        </IonSegmentView>
      </div>
    </IonContent>
    <Footer />
  </IonPage>
</template>

<style scoped>
.scroll-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: calc(5rem);
}
</style>
