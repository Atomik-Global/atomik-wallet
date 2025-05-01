import { useKaspa } from '@/composables/useKaspa'
import { InjectionKey } from 'vue'

const kas = useKaspa()
export type Kaspa = typeof kas
export const injKaspa = Symbol('KASPA') as InjectionKey<Kaspa>
