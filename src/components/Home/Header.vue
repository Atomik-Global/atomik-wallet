<script setup lang="ts">
import { useAccountStore } from '@/stores/account'
import {
  IonButton,
  IonIcon,
  IonSkeletonText,
  isPlatform,
  useIonRouter,
} from '@ionic/vue'
import { albumsOutline } from 'ionicons/icons'
import { computed } from 'vue'
import KaspaAddress from '../KaspaAddress.vue'

defineProps<{ loading: boolean }>()

const isAndroid = computed(() => isPlatform('android'))

const router = useIonRouter()

const accountStore = useAccountStore()
const address = computed(() => accountStore.primary?.address ?? '')
</script>

<template>
  <div class="header-wrapper" :class="[isAndroid ? '' : 'mt-4']">
    <div>
      <div class="header">Atomik</div>
      <div v-if="!loading" class="address">
        <KaspaAddress :address="address" :shorten="6" />
      </div>
      <IonSkeletonText v-else class="skeleton-address" />
    </div>
    <div class="account-action-button">
      <IonButton
        :disabled="loading"
        size="large"
        shape="round"
        color="light"
        @click="router.push('/home/accounts/switch')"
      >
        <IonIcon slot="icon-only" :icon="albumsOutline" />
      </IonButton>
    </div>
  </div>
</template>

<style scoped>
.header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.skeleton-address {
  height: 0.9rem;
  width: 150px;
  border-radius: 999px;
  background-color: var(--ion-background-color-step-100);
}
</style>
