<script setup lang="ts">
import { injKaspa, Kaspa } from '@/injectives'
import { useAccountStore } from '@/stores/account'
import { useBalanceStore } from '@/stores/balance'
import { useNetworkStore } from '@/stores/network'
import { formatCurrencyAgnostic } from '@/utils/helpers'
import {
  IonButton,
  IonChip,
  IonIcon,
  IonSkeletonText,
  IonText,
  useIonRouter,
} from '@ionic/vue'
import { arrowDown, arrowUp, globeOutline } from 'ionicons/icons'
import { inject } from 'vue'

defineProps<{
  loading: boolean
}>()

const kaspa = inject(injKaspa) as Kaspa

const networkStore = useNetworkStore()
const accountStore = useAccountStore()
const balanceStore = useBalanceStore()
const router = useIonRouter()
</script>

<template>
  <div class="account-card mt-4">
    <div class="account-card-header">
      <IonText>{{ accountStore.primary?.name ?? 'Primary Account' }}</IonText>
      <IonChip :color="networkStore.isMainnet ? 'light' : 'warning'">
        <IonIcon :icon="globeOutline"></IonIcon>
        <IonText>{{ networkStore.networkId.split('-').join(' ') }}</IonText>
      </IonChip>
    </div>
    <div v-if="!loading" class="balance">
      <IonText>{{ formatCurrencyAgnostic(balanceStore.balance) }}</IonText>
      <IonText class="balance-unit">{{ networkStore.ticker }}</IonText>
    </div>
    <IonSkeletonText v-else animated class="skeleton-balance" />
    <div class="account-card-footer">
      <div>
        <IonText class="balance-fiat">-</IonText>
        <div class="price-change">
          <IonText>24hr Change</IonText>
          <IonText>
            <!-- <IonIcon :icon="caretUp" /> -->
            <IonText>-</IonText>
          </IonText>
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
        <IonText>Send</IonText>
      </IonButton>
    </div>
  </div>
</template>

<style scoped>
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

.skeleton-balance {
  height: 2rem;
  width: 6rem;
  border-radius: 999px;
  background-color: var(--ion-background-color-step-800);
}
</style>
