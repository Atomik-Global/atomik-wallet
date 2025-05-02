<script setup lang="ts">
import AccountDisplay from '@/components/AccountDisplay.vue'
import Footer from '@/components/Home/Footer.vue'
import Header from '@/components/Home/Header.vue'
import Segment from '@/components/Home/Segment.vue'
import SegmentContent from '@/components/Home/SegmentContent.vue'
import TxIcon from '@/components/Home/TxIcon.vue'
import { useConfirmBackToQuit } from '@/composables/useConfirmBackToQuit'
import { injKaspa, Kaspa } from '@/injectives'
import { useBalanceStore } from '@/stores/balance'
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
const balanceStore = useBalanceStore()
const loading = ref(true)
const isAndroid = computed(() => isPlatform('android'))

const utxos = computed(() => {
  return balanceStore.utxos
    .map((e, i) => ({
      id: i,
      ...e,
      utxoEntry: {
        ...e.utxoEntry,
        amount: kaspa.toKas(e.utxoEntry.amount),
      },
    }))
    .sort((a, b) => a.id - b.id)
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
    loading.value = true
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
    loading.value = false
  }
}

onIonViewWillEnter(() => fetchAll())

async function handleRefresh(event: any) {
  await fetchAll()
  event.target.complete()
}

function openTxInBrowser(txId: string) {
  Browser.open({ url: `${kaspa.explorerUrl.value}/txs/${txId}` })
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
        <Header />
        <AccountDisplay />
        <Segment />
        <IonSegmentView class="mt-4">
          <SegmentContent
            id="history"
            key-field="transaction_id"
            :items="transactions"
            :loading="loading"
            @click="(item) => openTxInBrowser(item.transaction_id)"
          >
            <template #content-icon="{ item }">
              <TxIcon :item="item.outputs[0].script_public_key_address" />
            </template>
            <template #content-header-left="{ item }">
              {{ item.outputs[0].amount }} {{ kaspa.ticker.value }}
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
            :loading="loading"
            @click="(item) => openTxInBrowser(item.outpoint.transactionId)"
          >
            <template #content-icon>
              <TxIcon />
            </template>
            <template #content-header-left="{ item }">
              {{ item.utxoEntry.amount }} {{ kaspa.ticker.value }}
            </template>
            <template #content-header-right="{ item }">
              DAA {{ formatBlockDaaScore(item.utxoEntry.blockDaaScore) }}
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
