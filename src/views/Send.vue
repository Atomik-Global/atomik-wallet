<script setup lang="ts">
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonItem,
  IonPage,
  IonRow,
  IonSpinner,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
  onIonViewWillEnter,
  toastController,
  useIonRouter,
} from '@ionic/vue'

import ActionFooter from '@/components/ActionFooter.vue'
import { useBiometric } from '@/composables/useBiometric'
import {
  K_USE_BIOMETRIC,
  useSecureStorage,
} from '@/composables/useSecureStorage'
import { injKaspa, Kaspa } from '@/injectives'
import { useAccountStore } from '@/stores/account'
import { useBalanceStore } from '@/stores/balance'
import { useNetworkStore } from '@/stores/network'
import { Clipboard } from '@capacitor/clipboard'
import { useDebounce } from '@vueuse/core'
import { computed, inject, reactive, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

type PriorityFee = 'low' | 'normal' | 'high'

const MIN_TRANSFER_AMOUNT = 0.2 // KAS

const kaspa = inject(injKaspa) as Kaspa
const networkStore = useNetworkStore()
const balanceStore = useBalanceStore()
const accountStore = useAccountStore()
const storage = useSecureStorage()
const biometric = useBiometric()
const router = useIonRouter()
const route = useRoute()
const feeEstimateRaw = reactive({ low: 1, normal: 1, high: 1 })
const networkFee = ref(0)
const isLoadingFee = ref(true)

const amount = ref<number>()
const toAddress = ref<string>()
const priority = ref<PriorityFee>('normal')

onIonViewWillEnter(() => {
  if (route.params.address) {
    toAddress.value = route.params.address as string

    if (route.query.amount) {
      const amt = parseFloat(route.query.amount as string)

      if (isNaN(amt)) {
        return
      }

      amount.value = amt
    }
  }
})

const amountDebounced = useDebounce(amount, 800)
const toAddressDebounced = useDebounce(toAddress, 800)

const amountError = computed(() => {
  if (isBalanceInsufficient.value) {
    return 'Insufficient Balance'
  }

  if (isAmountTooLow.value) {
    return `Minimum transfer is ${MIN_TRANSFER_AMOUNT} ${networkStore.ticker}`
  }

  return undefined
})

const feeEstimate = computed(() => ({
  low: kaspa.toKasRaw(feeEstimateRaw.low * networkFee.value),
  normal: kaspa.toKasRaw(feeEstimateRaw.normal * networkFee.value),
  high: kaspa.toKasRaw(feeEstimateRaw.high * networkFee.value),
}))

watchEffect(async () => {
  if (amount.value) {
    isBalanceInsufficient.value = amount.value > balanceStore.balance
    isAmountTooLow.value = amount.value < MIN_TRANSFER_AMOUNT
  }

  if (toAddress.value) {
    isInvalidAddress.value = !networkStore.isValidAddress(toAddress.value)
  }

  if (amountDebounced.value && toAddressDebounced.value) {
    isLoadingFee.value = true

    await balanceStore.fetchUtxos()

    let amountSompi = kaspa.toSompi(amount.value!.toString())
    if (amount.value === balanceStore.balance) {
      const gasReserve = 0.2 // prevents insufficient funds
      amountSompi = kaspa.toSompi((amount.value - gasReserve).toString())
    }

    const payload = {
      changeAddress: accountStore.primary!.address,
      entries: balanceStore.utxos,
      outputs: [{ address: toAddressDebounced.value, amount: amountSompi }],
      priorityFee: 0n,
    }

    const generator = kaspa.generateTransaction(payload, networkStore.networkId)
    const estimate = await generator.estimate()
    networkFee.value = Number(estimate.fees)

    isLoadingFee.value = false
  }
})

const isBalanceInsufficient = ref(false)
const isAmountTooLow = ref(false)
const isInvalidAddress = ref(false)
const allowSubmit = computed(() => {
  return (
    isBalanceInsufficient.value === false &&
    isAmountTooLow.value === false &&
    isInvalidAddress.value === false &&
    isLoadingFee.value === false &&
    toAddress.value !== null &&
    toAddress.value !== ''
  )
})

function setPriorityFee(value: PriorityFee) {
  priority.value = value
}

async function paste() {
  const content = await Clipboard.read()

  if (!networkStore.isValidAddress(content.value)) {
    const toast = await toastController.create({
      header: 'Invalid address',
      message: 'Please paste a correct Kaspa address',
      duration: 1500,
      color: 'light',
    })

    await toast.present()
    return
  }

  toAddress.value = content.value
}

function setAmountByPercentage(percentValue: number) {
  const value = balanceStore.getByPercentage(percentValue)
  amount.value = value
}

function getColorByPercentage(percentValue: number) {
  const matches = balanceStore.matchPercentage(percentValue, amount.value || 0)

  if (!matches || balanceStore.balance === 0) {
    return 'light'
  }

  return 'dark'
}

async function executeTransfer() {
  const prioFee = feeEstimate.value[priority.value]
  let priorityFee = kaspa.toSompi(prioFee.toString())
  let finalAmount = amount.value!

  // if max amount needs to be transferred, reserve some for network fee.
  // required to prevent "Insufficient fund" error.
  if (amount.value === balanceStore.balance) {
    priorityFee = 0n
    finalAmount -= prioFee
  }

  const finalAmountSompi = kaspa.toSompi(finalAmount.toString())

  const payload = {
    changeAddress: accountStore.primary!.address,
    entries: balanceStore.utxos,
    outputs: [{ address: toAddress.value!, amount: finalAmountSompi }],
    priorityFee,
  }

  const txId = await kaspa.transferKas(
    payload,
    accountStore.primary!.privkey,
    networkStore.networkId,
  )

  router.replace(`/home/sent/${txId}`)
}

const isSubmitting = ref(false)
async function submit() {
  if (!allowSubmit.value) {
    return
  }

  try {
    isSubmitting.value = true
    const useBiome = await storage.getItem(K_USE_BIOMETRIC)
    if (useBiome === 'true') {
      await biometric.authenticate()
      await executeTransfer()
    } else {
      // TODO: handle non biometric transfer verification
      await executeTransfer()
    }
  } catch (error) {
    console.error(error)
    const toast = await toastController.create({
      header: 'Aborted',
      message: (error as Error).message || (error as string),
      duration: 1500,
      color: 'light',
    })
    await toast.present()
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <IonPage>
    <IonHeader translucent class="ion-no-border" collapse="condense">
      <IonToolbar />
    </IonHeader>
    <IonContent fullscreen class="ion-padding">
      <IonHeader collapse="condense">
        <IonTitle size="large">Send</IonTitle>
        <div class="subtitle">
          <IonText>Send asset to another address</IonText>
        </div>
      </IonHeader>
      <IonItem class="mt-4">
        <IonInput
          v-model="amount"
          class="mt-4"
          placeholder="Amount"
          :label="networkStore.ticker"
          label-placement="end"
          type="number"
          required
        />
      </IonItem>
      <div v-if="amountError" class="ion-padding input-error">
        {{ amountError }}
      </div>
      <div class="ion-padding balance-display" style="padding-bottom: 0">
        <div>Available balance</div>
        <div>{{ balanceStore.balance }} {{ networkStore.ticker }}</div>
      </div>
      <IonGrid>
        <IonRow>
          <IonCol size="3">
            <IonButton
              size="small"
              expand="block"
              :color="getColorByPercentage(25)"
              @click="setAmountByPercentage(25)"
            >
              25%
            </IonButton>
          </IonCol>
          <IonCol size="3">
            <IonButton
              size="small"
              expand="block"
              :color="getColorByPercentage(50)"
              @click="setAmountByPercentage(50)"
            >
              50%
            </IonButton>
          </IonCol>
          <IonCol size="3">
            <IonButton
              size="small"
              expand="block"
              :color="getColorByPercentage(75)"
              @click="setAmountByPercentage(75)"
            >
              75%
            </IonButton>
          </IonCol>
          <IonCol size="3">
            <IonButton
              size="small"
              expand="block"
              :color="getColorByPercentage(100)"
              @click="setAmountByPercentage(100)"
            >
              MAX
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
      <div class="mt-4">
        <IonItem>
          <IonTextarea
            v-model="toAddress"
            label="To Address"
            label-placement="floating"
            auto-grow
            required
            inputmode="text"
          />
        </IonItem>
        <div v-if="isInvalidAddress" class="ion-padding input-error">
          Invalid address
        </div>
        <div class="mt-2 paste-button-wrapper">
          <IonButton color="light" size="small" @click="paste"
            >Paste from Clipboard</IonButton
          >
        </div>
      </div>
      <div class="ion-padding" style="padding-bottom: 0">Priority</div>
      <IonGrid>
        <IonRow>
          <IonCol size="4">
            <div
              class="priority-fee-card"
              :class="{ active: priority === 'low' }"
              @click="setPriorityFee('low')"
            >
              <div class="priority-fee-card-title">Low</div>
              <div class="priority-fee-card-subtitle">
                {{ feeEstimate.low }} {{ networkStore.ticker }}
              </div>
            </div>
          </IonCol>
          <IonCol size="4">
            <div
              class="priority-fee-card"
              :class="{ active: priority === 'normal' }"
              @click="setPriorityFee('normal')"
            >
              <div class="priority-fee-card-title">Normal</div>
              <div class="priority-fee-card-subtitle">
                {{ feeEstimate.normal }} {{ networkStore.ticker }}
              </div>
            </div>
          </IonCol>
          <IonCol size="4">
            <div
              class="priority-fee-card"
              :class="{ active: priority === 'high' }"
              @click="setPriorityFee('high')"
            >
              <div class="priority-fee-card-title">High</div>
              <div class="priority-fee-card-subtitle">
                {{ feeEstimate.high }} {{ networkStore.ticker }}
              </div>
            </div>
          </IonCol>
        </IonRow>
      </IonGrid>
      <ActionFooter>
        <IonButton
          :disabled="!allowSubmit || isSubmitting"
          color="dark"
          expand="block"
          @click="submit"
        >
          <template v-if="!isSubmitting">Submit Transaction</template>
          <IonSpinner v-else name="dots" />
        </IonButton>
      </ActionFooter>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.subtitle {
  padding: 0 0.75rem;
  color: var(--ion-text-color-step-400);
}

.mt-4 {
  margin-top: 1rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.paste-button-wrapper {
  display: flex;
  justify-content: end;
  align-items: center;
}

.input-error {
  color: red;
  font-size: 0.8rem;
}

.balance-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.balance-display > div:first-child {
  color: var(--ion-text-color-step-400);
}

.priority-fee-card {
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid var(--ion-text-color-step-900);
  text-align: center;
}

.priority-fee-card.active {
  color: var(--ion-text-color-step-950);
  background-color: var(--ion-background-color-step-950);
}

.priority-fee-card-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.priority-fee-card-subtitle {
  font-size: 0.7rem;
  color: var(--ion-text-color-step-400);
}

.priority-fee-card.active > .priority-fee-card-subtitle {
  color: var(--ion-text-color-step-950);
}
</style>
