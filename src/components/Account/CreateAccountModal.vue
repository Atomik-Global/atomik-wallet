<script setup lang="ts">
import { useAccountStore } from '@/stores/account'
import {
  IonButton,
  IonInput,
  IonModal,
  IonSpinner,
  isPlatform,
  toastController,
} from '@ionic/vue'
import { computed, ref } from 'vue'

const model = defineModel({ type: Boolean, default: false })

const accountStore = useAccountStore()

const name = ref('')
const nameError = computed(() => {
  if (accountStore.nameExists(name.value)) {
    return 'You already have an account that uses this name'
  }

  return undefined
})

const disableSubmit = computed(() => {
  return name.value.length === 0 || !!nameError.value
})

const isCreatingAccount = ref(false)
const createAccount = async () => {
  try {
    isCreatingAccount.value = true
    await accountStore.createAccount(name.value)
    model.value = false
    name.value = ''
  } catch (error) {
    console.error(error)

    const toast = await toastController.create({
      message: 'Something went wrong',
      duration: 1500,
    })

    await toast.present()
  } finally {
    isCreatingAccount.value = false
  }
}
</script>

<template>
  <IonModal
    :is-open="model"
    :initial-breakpoint="isPlatform('android') ? 0.6 : 0.3"
    :breakpoints="[0, isPlatform('android') ? 0.6 : 0.3]"
    @did-dismiss="model = false"
  >
    <div class="ion-padding container">
      <IonInput
        v-model="name"
        autofocus
        mode="md"
        label="Account Name"
        label-placement="stacked"
        fill="outline"
        placeholder="e.g Trading Account"
        color="dark"
        :error-text="nameError"
      />
      <IonButton
        :disabled="disableSubmit"
        class="submit-button"
        expand="block"
        color="dark"
        @click="createAccount"
      >
        <IonSpinner v-if="isCreatingAccount" name="dots" />
        <template v-else>Create New Account</template>
      </IonButton>
    </div>
  </IonModal>
</template>

<style scoped>
.container {
  padding: 4rem 2rem;
}

.submit-button {
  margin-top: 1rem;
}
</style>
