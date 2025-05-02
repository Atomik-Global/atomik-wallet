<script setup lang="ts">
import { useAccountStore } from '@/stores/account'
import { isPlatform } from '@ionic/vue'
import { computed } from 'vue'
import KaspaAddress from '../KaspaAddress.vue'

const isAndroid = computed(() => isPlatform('android'))

const accountStore = useAccountStore()
const address = computed(() => accountStore.primary?.address ?? '')
</script>

<template>
  <div :class="[isAndroid ? '' : 'mt-4']">
    <div class="header">Wallet</div>
    <div class="address">
      <KaspaAddress :address="address" :shorten="6" />
    </div>
  </div>
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
</style>
