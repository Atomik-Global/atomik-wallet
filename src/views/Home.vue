<script setup lang="ts">
import SegmentContent from '@/components/Home/SegmentContent.vue'
import KaspaAddress from '@/components/KaspaAddress.vue'
import { useConfirmBackToQuit } from '@/composables/useConfirmBackToQuit'
import { injKaspa, Kaspa } from '@/injectives'
import { useAccountStore } from '@/stores/account'
import { useBalanceStore } from '@/stores/balance'
import { Browser } from '@capacitor/browser'
import {
  IonButton,
  IonChip,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonLabel,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonSegmentView,
  IonToolbar,
  isPlatform,
  onIonViewWillEnter,
  toastController,
  useIonRouter,
} from '@ionic/vue'
import { arrowDown, arrowUp, globeOutline, scanOutline } from 'ionicons/icons'
import { computed, inject, ref } from 'vue'

useConfirmBackToQuit()

const kaspa = inject(injKaspa) as Kaspa

const balanceStore = useBalanceStore()
const accountStore = useAccountStore()
const address = computed(() => accountStore.primary?.address ?? '')

const router = useIonRouter()
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

const isAndroid = computed(() => isPlatform('android'))

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
        <div :class="[isAndroid ? '' : 'mt-4']">
          <div class="header">Wallet</div>
          <div class="address">
            <KaspaAddress :address="address" :shorten="6" />
          </div>
        </div>
        <div class="account-card mt-4">
          <div class="account-card-header">
            <div>Primary Account</div>
            <IonChip :color="kaspa.isMainnet.value ? 'light' : 'warning'">
              <IonIcon :icon="globeOutline"></IonIcon>
              <IonLabel>{{
                kaspa.networkId.value.split('-').join(' ')
              }}</IonLabel>
            </IonChip>
          </div>
          <div class="balance">
            <span>{{ balanceStore.balance }}</span>
            <span class="balance-unit">{{ kaspa.ticker.value }}</span>
          </div>
          <div class="account-card-footer">
            <div>
              <div class="balance-fiat">-</div>
              <div class="price-change">
                <span>24hr Change</span>
                <span>
                  <!-- <IonIcon :icon="caretUp" /> -->
                  <span>-</span>
                </span>
              </div>
            </div>
          </div>
          <div class="account-card-actions">
            <IonButton
              size="large"
              color="light"
              shape="round"
              fill="outline"
              @click="router.push('/home/receive')"
            >
              <IonIcon slot="icon-only" :icon="arrowDown" />
            </IonButton>
            <IonButton
              color="light"
              shape="round"
              fill="solid"
              @click="router.push('/home/send')"
            >
              <IonIcon slot="start" :icon="arrowUp" />
              Send
            </IonButton>
          </div>
        </div>
        <div class="segment-container">
          <IonSegment>
            <IonSegmentButton value="history" content-id="history">
              <IonLabel>History</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="utxo" content-id="utxo">
              <IonLabel>UTXO</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>
        <IonSegmentView class="mt-4">
          <SegmentContent id="history" :items="transactions" :loading />
          <SegmentContent id="utxo" :items="utxos" :loading />
        </IonSegmentView>
      </div>
    </IonContent>
    <IonFooter>
      <IonToolbar class="ion-padding" style="padding-top: 0">
        <IonButton expand="block">
          <IonIcon slot="start" :icon="scanOutline" />
          Pay
        </IonButton>
      </IonToolbar>
    </IonFooter>
  </IonPage>
</template>

<style scoped>
.header {
  font-size: 1.75rem;
  font-weight: 500;
}

.address {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: var(--ion-text-color-step-200);
}

.account-card {
  position: relative;
  padding: 1rem;
  border-radius: 20px 20px 0px;
  color: var(--ion-text-color-step-950);
  background-color: var(--ion-background-color-step-900);
}

.account-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-transform: capitalize;
}

.account-card .balance {
  font-size: 2rem;
  font-weight: 500;
}

.account-card .balance .balance-unit {
  font-size: 1rem;
  margin-left: 8px;
}

.account-card .balance-fiat {
  font-size: 1rem;
}

.account-card .price-change {
  font-size: 0.75rem;
  margin-top: 0.15rem;
}

.account-card .account-card-footer {
  margin-top: 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.account-card-actions {
  position: absolute;
  bottom: -25%;
  right: 0;
  padding: 1rem 1rem 0.7rem 1rem;
  border-radius: 0 0 20px 20px;
  background-color: var(--ion-background-color-step-900);
}

.account-card-actions > :not(:first-child),
.price-change > :not(:first-child) {
  margin-inline-start: 0.25rem;
  margin-inline-end: 0.25rem;
}

.account-card-actions::before {
  content: '';
  height: 64.4%;
  width: 100%;
  position: absolute;
  bottom: 0;
  right: 100%;
  background-color: var(--ion-background-color-step-900);
}

.account-card-actions::after {
  content: '';
  height: 64.4%;
  width: 100%;
  position: absolute;
  bottom: 0;
  right: 100%;
  background-color: var(--ion-background-color);
  border-top-right-radius: 20px;
}

.segment-container {
  position: relative;
  z-index: 10;
  margin-top: 0.75rem;
  max-width: 42%;
}

.scroll-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* padding-bottom: var(--ion-safe-area-bottom, 0); */
}
</style>
