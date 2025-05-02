import { App } from '@capacitor/app'
import { toastController, useBackButton, useIonRouter } from '@ionic/vue'
import { ref } from 'vue'

export const useConfirmBackToQuit = () => {
  const backCrement = ref(0)
  const router = useIonRouter()

  useBackButton(-1, async () => {
    if (!router.canGoBack()) {
      if (backCrement.value > 0) {
        await App.exitApp()
        return
      }

      const toast = await toastController.create({
        message: 'Go back one more time to exit the app',
        duration: 1500,
        color: 'light',
      })

      await toast.present()
      backCrement.value += 1

      // reset if idle by 0.8s
      await new Promise((resolve) => setTimeout(resolve, 800))
      backCrement.value = 0
    }
  })
}
