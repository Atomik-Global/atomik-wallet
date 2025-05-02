<script setup lang="ts">
import AccountDisplay from '@/components/AccountDisplay.vue'
import Header from '@/components/Home/Header.vue'
import Segment from '@/components/Home/Segment.vue'
import SegmentContent from '@/components/Home/SegmentContent.vue'
import ScrollContainer from '@/components/ScrollContainer.vue'
import { useConfirmBackToQuit } from '@/composables/useConfirmBackToQuit'
import { injKaspa, Kaspa } from '@/injectives'
import { useBalanceStore } from '@/stores/balance'
import { Browser } from '@capacitor/browser'
import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSegmentView,
  IonText,
  IonToolbar,
  onIonViewWillEnter,
  toastController,
} from '@ionic/vue'
import { scanOutline } from 'ionicons/icons'
import { computed, inject, ref } from 'vue'

useConfirmBackToQuit()

const kaspa = inject(injKaspa) as Kaspa
const balanceStore = useBalanceStore()
const loading = ref(true)

const utxos = computed(() => {
  return balanceStore.utxos
    .map((e) => ({
      id: e.outpoint.index,
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
      <ScrollContainer>
        <Header />
        <AccountDisplay />
        <Segment />
        <IonSegmentView class="mt-4">
          <SegmentContent id="history" :items="transactions" :loading />
          <SegmentContent id="utxo" :items="utxos" :loading />
        </IonSegmentView>
      </ScrollContainer>
    </IonContent>
    <IonFooter>
      <IonToolbar class="ion-padding" style="padding-top: 0">
        <IonButton expand="block">
          <IonIcon slot="start" :icon="scanOutline" />
          <IonText>Pay</IonText>
        </IonButton>
      </IonToolbar>
    </IonFooter>
  </IonPage>
</template>
