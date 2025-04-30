<script setup lang="ts">
import KaspaAddress from '@/components/KaspaAddress.vue'
import { useKaspa, WalletAccount } from '@/composables/useKaspa'
import {
  K_ACCOUNT_PRIMARY,
  useSecureStorage,
} from '@/composables/useSecureStorage'
import { shortenHash, toHumanReadableDate } from '@/utils/helpers'
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
  IonSegment,
  IonSegmentButton,
  IonSegmentContent,
  IonSegmentView,
  IonToolbar,
} from '@ionic/vue'
import {
  arrowDown,
  arrowDownCircleOutline,
  arrowUp,
  arrowUpCircleOutline,
  caretUp,
  globeOutline,
} from 'ionicons/icons'
import { computed, onBeforeMount, ref } from 'vue'

const storage = useSecureStorage()
const address = ref('')
const kaspa = useKaspa()

onBeforeMount(() => {
  storage.getItem(K_ACCOUNT_PRIMARY).then((account) => {
    address.value = (JSON.parse(account!) as WalletAccount).address
  })
})

const list = computed(() => {
  return Array.from(Array(100)).map((_, i) => ({
    id: i + 1,
    kind: 'in',
    amount: '0.24959996',
    date: new Date().toISOString(),
    ticker: kaspa.ticker.value,
    address: address.value,
    signature:
      '8725fbf8fdcecb62438ae7f21e503894bb2e93cb308874b18739e8f70719196b',
  }))
})
</script>

<template>
  <IonPage>
    <IonHeader translucent class="ion-no-border" collapse="condense">
      <IonToolbar />
    </IonHeader>
    <IonContent class="ion-padding" :scroll-y="false">
      <div class="scroll-container">
        <div class="mt-4">
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
              <IonLabel>{{ kaspa.networkId.value }}</IonLabel>
            </IonChip>
          </div>
          <div class="balance">
            <span>1,000,000</span>
            <span class="balance-unit">{{ kaspa.ticker.value }}</span>
          </div>
          <div class="account-card-footer">
            <div>
              <div class="balance-fiat">USD $10,000</div>
              <div class="price-change">
                <span>24hr Change</span>
                <span>
                  <IonIcon :icon="caretUp" />
                  <span>1.5%</span>
                </span>
              </div>
            </div>
          </div>
          <div class="account-card-actions">
            <IonButton size="large" color="light" shape="round" fill="outline">
              <IonIcon slot="icon-only" :icon="arrowDown" />
            </IonButton>
            <IonButton color="light" shape="round" fill="solid">
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
          <IonSegmentContent id="history" class="expand-scroll">
            <IonList lines="full">
              <RecycleScroller
                class="scroller"
                page-mode
                :items="list"
                :item-size="list.length"
              >
                <template #default="{ item }">
                  <IonItem button>
                    <IonIcon
                      v-if="item.kind === 'in'"
                      aria-hidden="true"
                      :icon="arrowDownCircleOutline"
                      slot="start"
                    />
                    <IonIcon
                      v-else
                      aria-hidden="true"
                      :icon="arrowUpCircleOutline"
                      slot="start"
                      color="danger"
                    />
                    <IonLabel class="history">
                      <div class="history-header">
                        <div>{{ item.amount }} {{ item.ticker }}</div>
                        <div>{{ toHumanReadableDate(item.date) }}</div>
                      </div>
                      <div class="font-mono history-signature">
                        {{ shortenHash(item.signature, 15) }}
                      </div>
                    </IonLabel>
                  </IonItem>
                </template>
              </RecycleScroller>
            </IonList>
          </IonSegmentContent>
          <IonSegmentContent id="utxo" class="expand-scroll">
            <IonList lines="full">
              <RecycleScroller
                class="scroller"
                page-mode
                :items="list"
                :item-size="list.length"
              >
                <template #default="{ item }">
                  <IonItem button>
                    <IonIcon
                      v-if="item.kind === 'in'"
                      aria-hidden="true"
                      :icon="arrowDownCircleOutline"
                      slot="start"
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
                        <div>{{ item.amount }} {{ item.ticker }}</div>
                        <div>{{ toHumanReadableDate(item.date) }}</div>
                      </div>
                      <div class="font-mono history-signature">
                        {{ shortenHash(item.signature, 15) }}
                      </div>
                    </IonLabel>
                  </IonItem>
                </template>
              </RecycleScroller>
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
  height: 62.4%;
  width: 100%;
  position: absolute;
  bottom: 0;
  right: 100%;
  background-color: var(--ion-background-color-step-900);
}

.account-card-actions::after {
  content: '';
  height: 62.4%;
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
  max-width: 180px;
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
  padding-bottom: var(--ion-safe-area-bottom, 0);
}

.expand-scroll {
  flex-grow: 1;
  overflow-y: auto;
}
</style>
