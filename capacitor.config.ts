import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'org.atomiklabs.wallet',
  appName: 'atomik-wallet',
  webDir: 'dist',
  server: {
    cleartext: true,
  },
}

export default config
