<script setup lang="ts">
import CreateAccountModal from '@/components/Account/CreateAccountModal.vue'
import ActionFooter from '@/components/ActionFooter.vue'
import { useAccountStore } from '@/stores/account'
import { useBalanceStore } from '@/stores/balance'
import { WalletAccount } from '@/types'
import { shortenKaspaAddress } from '@/utils/helpers'
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from '@ionic/vue'
import { checkmarkCircle } from 'ionicons/icons'
import { ref } from 'vue'

const router = useIonRouter()
const accountStore = useAccountStore()
const balanceStore = useBalanceStore()
const isCreateAccountModalOpen = ref(false)

const switchAccount = async (account: WalletAccount) => {
  await accountStore.setPrimary(account)
  balanceStore.balanceRaw = 0n
  router.back()
}
</script>

<template>
  <IonPage>
    <IonHeader translucent collapse="condense">
      <IonToolbar>
        <IonButtons>
          <IonBackButton />
        </IonButtons>
        <IonTitle>Accounts</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent fullscreen class="ion-padding">
      <IonHeader collapse="condense">
        <IonTitle size="large">Accounts</IonTitle>
        <IonText class="subtitle">Switch account or create a new one</IonText>
      </IonHeader>
      <IonList>
        <IonItem
          v-for="account in accountStore.accounts"
          :key="account.privkey"
          button
          class="mt-4"
          @click="switchAccount(account)"
        >
          <IonIcon
            slot="start"
            :icon="checkmarkCircle"
            :color="accountStore.isPrimary(account) ? 'dark' : 'light'"
          />
          <IonLabel>
            <IonText class="account-name">
              {{ account.name ?? 'Primary Account' }}
              {{ accountStore.isPrimary(account) ? '(Current)' : '' }}
            </IonText>
            <IonText class="address">{{
              shortenKaspaAddress(account.address, 8)
            }}</IonText>
          </IonLabel>
        </IonItem>
      </IonList>
      <ActionFooter>
        <IonButton
          color="dark"
          expand="block"
          @click="isCreateAccountModalOpen = true"
        >
          Create New Account
        </IonButton>
        <CreateAccountModal v-model="isCreateAccountModalOpen" />
      </ActionFooter>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.subtitle {
  padding: 0 0.75rem;
  color: var(--ion-text-color-step-400);
}

.address {
  font-size: 0.9rem;
  font-family: monospace;
  color: var(--ion-text-color-step-400);
}

.account-name {
  display: block;
  font-weight: 600;
}
</style>
