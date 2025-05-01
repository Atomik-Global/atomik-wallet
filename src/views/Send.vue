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

import { useBiometric } from '@/composables/useBiometric'
import { WalletAccount } from '@/composables/useKaspa'
import {
  K_ACCOUNT_PRIMARY,
  K_USE_BIOMETRIC,
  useSecureStorage,
} from '@/composables/useSecureStorage'
import { injKaspa, Kaspa } from '@/injectives'
import type { UtxoEntry } from '@/kaspa/kaspa'
import { useBalanceStore } from '@/stores/balance'
import { Clipboard } from '@capacitor/clipboard'
import { computed, inject, reactive, ref, shallowRef, watch } from 'vue'

type PriorityFee = 'low' | 'normal' | 'high'

const MIN_TRANSFER_AMOUNT = 0.2 // KAS

const kaspa = inject(injKaspa) as Kaspa
const balanceStore = useBalanceStore()
const storage = useSecureStorage()
const biometric = useBiometric()
const router = useIonRouter()
const feeEstimateRaw = reactive({ low: 1, normal: 1, high: 1 })
const account = shallowRef<WalletAccount>()
const utxoEntries = shallowRef<UtxoEntry[]>([])

onIonViewWillEnter(async () => {
  const acc = await storage.getItem(K_ACCOUNT_PRIMARY)
  account.value = JSON.parse(acc!) as WalletAccount

  const estimate = await kaspa.getFeeEstimate()
  Object.assign(feeEstimateRaw, estimate)

  const { entries } = await kaspa.getUtxoEntries([account.value.address])
  utxoEntries.value = entries
})

const state = reactive<{
  amount: number | null
  toAddress: string | null
  priority: PriorityFee
}>({
  amount: null,
  toAddress: null,
  priority: 'normal',
})

const transaction = computed(() => {
  if (!state.toAddress || !state.amount || !account.value) {
    return null
  }

  const address = state.toAddress
  const amount = kaspa.toSompi(state.amount.toString())
  const priorityFee = kaspa.toSompi(
    feeEstimate.value[state.priority].toString(),
  )

  return kaspa.createTransaction({
    entries: utxoEntries.value,
    outputs: [{ address, amount }],
    priorityFee,
  })
})

const txMass = computed(() => {
  if (!transaction.value) {
    return 0
  }

  const mass = kaspa.calculateTransactionMass(transaction.value)
  if (mass < 10000n) return 10000

  return Number(mass)
})

const feeEstimate = computed(() => ({
  low: kaspa.toKasRaw(feeEstimateRaw.low * txMass.value),
  normal: kaspa.toKasRaw(feeEstimateRaw.normal * txMass.value),
  high: kaspa.toKasRaw(feeEstimateRaw.high * txMass.value),
}))

const isBalanceInsufficient = ref(false)
const isAmountTooLow = ref(false)
const isInvalidAddress = ref(false)
const allowSubmit = computed(() => {
  return (
    isBalanceInsufficient.value === false &&
    isAmountTooLow.value === false &&
    isInvalidAddress.value === false &&
    state.toAddress !== null &&
    state.toAddress !== ''
  )
})

watch(
  () => state.amount,
  (value) => {
    if (!value) return
    isBalanceInsufficient.value = value > balanceStore.balance
    isAmountTooLow.value = value < MIN_TRANSFER_AMOUNT
  },
)

watch(
  () => state.toAddress,
  (value) => {
    if (!value) return
    isInvalidAddress.value = !kaspa.isValidAddress(value)
  },
)

const amountError = computed(() => {
  if (isBalanceInsufficient.value) {
    return 'Insufficient Balance'
  }

  if (isAmountTooLow.value) {
    return `Minimum transfer is ${MIN_TRANSFER_AMOUNT} ${kaspa.ticker.value}`
  }

  return undefined
})

function setPriorityFee(value: PriorityFee) {
  state.priority = value
}

async function paste() {
  const content = await Clipboard.read()

  if (!kaspa.isValidAddress(content.value)) {
    const toast = await toastController.create({
      header: 'Invalid address',
      message: 'Please paste a correct Kaspa address',
      duration: 1500,
    })

    await toast.present()
    return
  }

  state.toAddress = content.value
}

function setAmountByPercentage(percentValue: number) {
  const value = balanceStore.getByPercentage(percentValue)
  state.amount = value
}

function getColorByPercentage(percentValue: number) {
  const matches = balanceStore.matchPercentage(percentValue, state.amount || 0)

  if (!matches || balanceStore.balance === 0) {
    return 'light'
  }

  return 'dark'
}

async function executeTransfer() {
  if (!transaction.value) {
    return
  }

  const prioFee = feeEstimate.value[state.priority]

  let priorityFee = kaspa.toSompi(prioFee.toString())
  let finalAmount = state.amount!

  // if max amount needs to be transferred, reserve some for network fee.
  // required to prevent "Insufficient fund" error.
  if (state.amount === balanceStore.balance) {
    priorityFee = 0n
    finalAmount -= prioFee
  }

  const finalAmountSompi = kaspa.toSompi(finalAmount.toString())

  const payload = {
    changeAddress: account.value!.address,
    entries: utxoEntries.value,
    outputs: [{ address: state.toAddress!, amount: finalAmountSompi }],
    priorityFee,
  }

  const res = await kaspa.transferKas(payload, account.value!.privkey)
  router.replace(`/home/sent/${res}`)
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
          v-model="state.amount"
          class="mt-4"
          placeholder="Amount"
          :label="kaspa.ticker.value"
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
        <div>{{ balanceStore.balance }} {{ kaspa.ticker.value }}</div>
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
            v-model="state.toAddress"
            label="To Address"
            label-placement="floating"
            autofocus
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
              :class="{ active: state.priority === 'low' }"
              @click="setPriorityFee('low')"
            >
              <div class="priority-fee-card-title">Low</div>
              <div class="priority-fee-card-subtitle">
                {{ feeEstimate.low }} {{ kaspa.ticker.value }}
              </div>
            </div>
          </IonCol>
          <IonCol size="4">
            <div
              class="priority-fee-card"
              :class="{ active: state.priority === 'normal' }"
              @click="setPriorityFee('normal')"
            >
              <div class="priority-fee-card-title">Normal</div>
              <div class="priority-fee-card-subtitle">
                {{ feeEstimate.normal }} {{ kaspa.ticker.value }}
              </div>
            </div>
          </IonCol>
          <IonCol size="4">
            <div
              class="priority-fee-card"
              :class="{ active: state.priority === 'high' }"
              @click="setPriorityFee('high')"
            >
              <div class="priority-fee-card-title">High</div>
              <div class="priority-fee-card-subtitle">
                {{ feeEstimate.high }} {{ kaspa.ticker.value }}
              </div>
            </div>
          </IonCol>
        </IonRow>
      </IonGrid>
      <div class="footer ion-padding">
        <IonButton
          :disabled="!allowSubmit || isSubmitting"
          color="dark"
          expand="block"
          @click="submit"
        >
          <template v-if="!isSubmitting">Submit Transaction</template>
          <IonSpinner v-else name="dots" />
        </IonButton>
      </div>
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

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
}
</style>
