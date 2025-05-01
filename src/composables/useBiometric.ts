import {
  BiometricAuth,
  BiometryError,
  BiometryErrorType,
  BiometryType,
  type CheckBiometryResult,
} from '@aparajita/capacitor-biometric-auth'
import { PluginListenerHandle } from '@capacitor/core'
import { onIonViewWillEnter, toastController } from '@ionic/vue'
import { onUnmounted, ref } from 'vue'

export function useBiometric() {
  const isAvailable = ref(true)
  const biometryType = ref('Biometric')
  const appListener = ref<PluginListenerHandle>()

  function updateBiometryInfo(info: CheckBiometryResult) {
    if (info.isAvailable) {
      isAvailable.value = true
      biometryType.value = getType(info.biometryType)
    } else {
      isAvailable.value = false
    }
  }

  function getType(value: BiometryType) {
    if (value === BiometryType.faceId) return 'Face ID'
    if (value === BiometryType.faceAuthentication) return 'Face Auth'
    if (value === BiometryType.fingerprintAuthentication) return 'Fingerprint'
    if (value === BiometryType.irisAuthentication) return 'Iris'
    if (value === BiometryType.touchId) return 'Touch ID'
    return 'Biometric'
  }

  async function authenticate() {
    if (!isAvailable.value) {
      const toast = await toastController.create({
        message: 'Biometric unavailable',
        duration: 1500,
        color: 'light',
      })

      await toast.present()
      return
    }

    return BiometricAuth.authenticate()
  }

  onIonViewWillEnter(async () => {
    updateBiometryInfo(await BiometricAuth.checkBiometry())

    try {
      appListener.value = await BiometricAuth.addResumeListener(
        updateBiometryInfo,
      )
    } catch (error) {
      let message = ''

      if (error instanceof BiometryError) {
        if (error.code !== BiometryErrorType.userCancel) {
          message = error.message
        }
      }

      console.error(error)
      const toast = await toastController.create({
        message,
        duration: 1500,
        color: 'light',
      })
      await toast.present()
    }
  })

  onUnmounted(async () => {
    await appListener.value?.remove()
  })

  return {
    isAvailable,
    biometryType,
    authenticate,
  }
}
