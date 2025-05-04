<script setup lang="ts">
import { K_NETWORK, useSecureStorage } from '@/composables/useSecureStorage'
import { useAccountStore } from '@/stores/account'
import { useNetworkStore } from '@/stores/network'
import { NetworkType } from '@/types'
import { alertController, IonIcon, IonModal, IonText } from '@ionic/vue'
import { checkmarkCircle } from 'ionicons/icons'

const model = defineModel({ type: Boolean, default: false })
const networkStore = useNetworkStore()
const accountStore = useAccountStore()
const storage = useSecureStorage()

const switchNetwork = async (networkId: NetworkType) => {
  const networkIdFormatted = {
    [NetworkType.mainnet]: 'Mainnet',
    [NetworkType.testnet]: 'Testnet 10',
  }[networkId]

  const alert = await alertController.create({
    header: `Switch to ${networkIdFormatted}?`,
    message: 'The app will restart to adjust network connection',
    buttons: [
      {
        text: 'OK',
        role: 'destructive',
        handler: async () => {
          networkStore.setNetworkId(networkId)
          const account = accountStore.filteredAccounts.find(
            (e) => e.name === undefined,
          )

          await storage.setItem(K_NETWORK, networkId)
          await accountStore.setPrimary(account!)
          window.location.reload()
        },
      },
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          model.value = false
        },
      },
    ],
  })

  await alert.present()
}
</script>

<template>
  <IonModal
    :is-open="model"
    :initial-breakpoint="0.32"
    :breakpoints="[0, 0.32]"
    @did-dismiss="model = false"
  >
    <div class="ion-padding container">
      <div
        class="network-card"
        @click.native="switchNetwork(NetworkType.mainnet)"
      >
        <div class="network-card-text-container">
          <div class="network-card-indicator mainnet" />
          <IonText class="network-card-title">Mainnet</IonText>
        </div>
        <IonIcon
          class="network-card-icon"
          :class="{ active: networkStore.networkId === NetworkType.mainnet }"
          :icon="checkmarkCircle"
        />
      </div>
      <div
        class="network-card"
        @click.native="switchNetwork(NetworkType.testnet)"
      >
        <div class="network-card-text-container">
          <div class="network-card-indicator testnet" />
          <IonText class="network-card-title">Testnet 10</IonText>
        </div>

        <IonIcon
          class="network-card-icon"
          :class="{ active: networkStore.networkId === NetworkType.testnet }"
          :icon="checkmarkCircle"
        />
      </div>
    </div>
  </IonModal>
</template>

<style scoped>
.container {
  padding: 4rem 2rem;
}

.title {
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.network-card {
  border: 1px solid var(--ion-text-color-step-900);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.network-card:active {
  background-color: var(--ion-background-color-step-50);
}

.network-card:not(.network-card:last-child) {
  margin-bottom: 0.5rem;
}

.network-card-text-container {
  display: flex;
  align-items: center;
}

.network-card-indicator {
  height: 0.5rem;
  width: 0.5rem;
  border-radius: 50%;
  margin-right: 0.5rem;
  background-color: var(--ion-text-color-step-900);
}

.network-card-indicator.mainnet {
  background-color: var(--ion-color-success);
}

.network-card-indicator.testnet {
  background-color: var(--ion-color-warning);
}

.network-card-title {
  font-weight: 600;
}

.network-card-icon {
  font-size: 1.5rem;
  opacity: 20%;
}

.network-card-icon.active {
  opacity: 100%;
}
</style>
