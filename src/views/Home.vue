<script setup lang="ts">
import KaspaAddress from '@/components/KaspaAddress.vue'
import { WalletAccount } from '@/composables/useKaspa'
import {
  GetFullTransactionResponse,
  GetUtxoResponse,
  useKaspaRest,
} from '@/composables/useKaspaRest'
import {
  K_ACCOUNT_PRIMARY,
  useSecureStorage,
} from '@/composables/useSecureStorage'
import { injKaspa, Kaspa } from '@/injectives'
import { useBalanceStore } from '@/stores/balance'
import {
  blockTimeToDate,
  formatBlockDaaScore,
  shortenHash,
  toHumanReadableDate,
} from '@/utils/helpers'
import { App } from '@capacitor/app'
import {
  IonButton,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonSegmentContent,
  IonSegmentView,
  IonSkeletonText,
  IonToolbar,
  isPlatform,
  toastController,
  useBackButton,
  useIonRouter,
} from '@ionic/vue'
import { arrowDown, arrowUp, caretUp, globeOutline } from 'ionicons/icons'
import { computed, inject, onBeforeMount, ref } from 'vue'

const balanceStore = useBalanceStore()
const storage = useSecureStorage()
const address = ref('')
const kaspa = inject(injKaspa) as Kaspa
const kaspaRest = useKaspaRest()
const utxos = ref<GetUtxoResponse[]>([])
const transactions = ref<GetFullTransactionResponse[]>([])
const router = useIonRouter()

const backCrement = ref(0)
useBackButton(-1, async () => {
  if (!router.canGoBack()) {
    if (backCrement.value > 0) {
      await App.exitApp()
      return
    }

    const toast = await toastController.create({
      message: 'Go back one more time to exit the app',
      duration: 1500,
      color: 'light',
    })

    await toast.present()
    backCrement.value += 1

    // reset if idle by 0.8s
    await new Promise((resolve) => setTimeout(resolve, 800))
    backCrement.value = 0
  }
})

const mappedTransactions = computed(() => {
  return transactions.value.map((e) => ({
    ...e,
    outputs: e.outputs.map((o) => ({
      ...o,
      amount: kaspa.toKas(o.amount),
    })),
  }))
})

const mappedUtxos = computed(() => {
  return utxos.value
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

async function fetchBalance(address: string) {
  try {
    const data = await kaspaRest.getBalance(address)
    balanceStore.setBalance(kaspa.toKasRaw(data.balance))
  } catch (error) {
    console.error(error)
  }
}

async function fetchUtxos(address: string) {
  try {
    const data = await kaspaRest.getUtxos(address)
    utxos.value = data
  } catch (error) {
    console.error(error)
  }
}

async function fetchTransactions(address: string) {
  try {
    const data = await kaspaRest.getFullTransactionsPage(address)
    transactions.value = data
  } catch (error) {
    console.error(error)
  }
}

const isFetching = ref(true)

async function fetchAll() {
  isFetching.value = true

  await Promise.all([
    fetchBalance(address.value),
    fetchUtxos(address.value),
    fetchTransactions(address.value),
  ])

  isFetching.value = false
}

onBeforeMount(() => {
  storage.getItem(K_ACCOUNT_PRIMARY).then((account) => {
    address.value = (JSON.parse(account!) as WalletAccount).address
    kaspa.trackAddresses({
      addresses: [address.value!],
      onChangeBalance: () => {
        fetchBalance(address.value)
        fetchUtxos(address.value)
      },
    })

    fetchAll()
  })
})

// onUnmounted(() => {
//   kaspa.untrackAddresses()
// })

async function handleRefresh(event: any) {
  await fetchAll()
  event.target.complete()
}

const isAndroid = computed(() => isPlatform('android'))

function openTxInBrowser(txId: string) {
  window.open(`${kaspa.explorerUrl.value}/txs/${txId}`)
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
          <IonSegmentContent
            id="history"
            class="expand-scroll ion-content-scroll-host mt-4"
          >
            <IonList v-if="isFetching">
              <IonItem v-for="i in 5" :key="i">
                <IonSkeletonText
                  animated
                  style="border-radius: 20px; height: 16px; width: 5%"
                  slot="start"
                />
                <IonLabel class="history">
                  <div class="history-header">
                    <IonSkeletonText
                      animated
                      style="border-radius: 20px; height: 16px; width: 25%"
                    />
                    <IonSkeletonText
                      animated
                      style="border-radius: 20px; height: 16px; width: 25%"
                    />
                  </div>
                  <div class="font-mono history-signature">
                    <IonSkeletonText
                      animated
                      style="border-radius: 20px; height: 16px; width: 100%"
                    />
                  </div>
                </IonLabel>
              </IonItem>
            </IonList>
            <div v-else-if="transactions.length === 0" class="empty">
              <div class="empty-text">No Records</div>
            </div>
            <IonList v-else>
              <DynamicScroller
                key-field="transaction_id"
                :min-item-size="50"
                :items="mappedTransactions"
              >
                <template
                  #default="{ item }: { item: GetFullTransactionResponse }"
                >
                  <IonItem
                    v-if="!isFetching"
                    button
                    @click="openTxInBrowser(item.transaction_id)"
                  >
                    <IonIcon
                      v-if="
                        item.outputs[0].script_public_key_address === address
                      "
                      aria-hidden="true"
                      :icon="arrowDown"
                      slot="start"
                      color="success"
                    />
                    <IonIcon
                      v-else
                      aria-hidden="true"
                      :icon="arrowUp"
                      slot="start"
                      color="danger"
                    />
                    <IonLabel class="history">
                      <div class="history-header">
                        <div>
                          {{ item.outputs[0].amount }} {{ kaspa.ticker.value }}
                        </div>
                        <div style="text-align: right">
                          {{
                            toHumanReadableDate(
                              blockTimeToDate(item.accepting_block_time),
                            )
                          }}
                        </div>
                      </div>
                      <div class="font-mono history-signature">
                        {{
                          shortenHash(item.transaction_id, isAndroid ? 13 : 15)
                        }}
                      </div>
                    </IonLabel>
                  </IonItem>
                </template>
              </DynamicScroller>
            </IonList>
          </IonSegmentContent>
          <IonSegmentContent
            id="utxo"
            class="expand-scroll ion-content-scroll-host mt-4"
          >
            <IonList v-if="isFetching">
              <IonItem v-for="i in 5" :key="i">
                <IonSkeletonText
                  animated
                  style="border-radius: 20px; height: 16px; width: 5%"
                  slot="start"
                />
                <IonLabel class="history">
                  <div class="history-header">
                    <IonSkeletonText
                      animated
                      style="border-radius: 20px; height: 16px; width: 25%"
                    />
                    <IonSkeletonText
                      animated
                      style="border-radius: 20px; height: 16px; width: 25%"
                    />
                  </div>
                  <div class="font-mono history-signature">
                    <IonSkeletonText
                      animated
                      style="border-radius: 20px; height: 16px; width: 100%"
                    />
                  </div>
                </IonLabel>
              </IonItem>
            </IonList>
            <div v-else-if="utxos.length === 0" class="empty">
              <div class="empty-text">No Records</div>
            </div>
            <IonList v-else>
              <DynamicScroller
                key-field="id"
                :min-item-size="50"
                :items="mappedUtxos"
              >
                <template
                  #default="{
                    item,
                  }: {
                    item: GetUtxoResponse & { id: string },
                  }"
                >
                  <IonItem button>
                    <IonIcon
                      v-if="true"
                      aria-hidden="true"
                      :icon="arrowDown"
                      slot="start"
                      color="success"
                    />
                    <IonIcon
                      v-else
                      aria-hidden="true"
                      :icon="caretUp"
                      slot="start"
                      color="danger"
                    />
                    <IonLabel class="history">
                      <div class="history-header">
                        <div>
                          {{ item.utxoEntry.amount }} {{ kaspa.ticker.value }}
                        </div>
                        <div style="text-align: right">
                          DAA
                          {{
                            formatBlockDaaScore(item.utxoEntry.blockDaaScore)
                          }}
                        </div>
                      </div>
                      <div class="font-mono history-signature">
                        {{
                          shortenHash(
                            item.outpoint.transactionId,
                            isAndroid ? 13 : 15,
                          )
                        }}
                      </div>
                    </IonLabel>
                  </IonItem>
                </template>
              </DynamicScroller>
            </IonList>
          </IonSegmentContent>
        </IonSegmentView>
      </div>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.mt-4 {
  margin-top: 1rem;
}

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

.history {
  font-size: 16px;
}

.history > :not(:first-child) {
  margin-block-start: 0.5rem;
  margin-block-end: 0.5rem;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.history-signature {
  color: var(--ion-text-color-step-400);
}

.font-mono {
  font-family: monospace;
}

.scroll-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* padding-bottom: var(--ion-safe-area-bottom, 0); */
}

.expand-scroll {
  flex-grow: 1;
  overflow-y: auto;
}

.ion-content-scroll-host::before,
.ion-content-scroll-host::after {
  position: absolute;

  width: 1px;
  height: 1px;

  content: '';
}

.ion-content-scroll-host::before {
  bottom: -1px;
}

.ion-content-scroll-host::after {
  top: -1px;
}

.empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
