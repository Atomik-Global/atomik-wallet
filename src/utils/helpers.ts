export const getParamsFromHash = (hash: string) => {
  const rawParams = hash.replace('#', '').split('&')

  let params: Record<string, string> = {}
  rawParams.forEach((param) => {
    const [key, value] = param.split('=')
    params[key] = value
  })

  return params
}

export const isNegative = (num: number) => num < 0

export const isValidEmail = (email: string) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

export const detach = (obj: any) => JSON.parse(JSON.stringify(obj))

export const truncateToDecimals = (num: number, dec = 2) => {
  const calcDec = Math.pow(10, dec)
  return Math.trunc(num * calcDec) / calcDec
}

export const shortenKaspaAddress = (
  address: string | null | undefined,
  length = 6,
) => {
  if (!address) return '-'
  const [prefix, hash] = address.split(':')
  return `${prefix}:${hash?.slice(0, length)}..${hash?.slice(-length)}`
}

export const shortenHash = (hash: string, length = 6) => {
  return `${hash?.slice(0, length)}..${hash?.slice(-length)}`
}

export const toFixedButRemoveDoubleZero = (num: number) => {
  const str = num.toFixed(2)
  return str.replace(/\.00$/, '')
}

export const formatCurrency = (
  value: string | number,
  currency = 'usd',
  locale = 'en-US',
) => {
  return Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
    maximumFractionDigits: 0,
    currencySign: 'standard',
  }).format(parseFloat(value.toString()))
}

export const toHumanReadableDate = (value: string | Date) => {
  return Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function blockTimeToDate(blockTime: number) {
  // Check if the blockTime is in seconds (typical for Unix timestamps) or milliseconds
  if (blockTime < 10000000000) {
    // If it's less than 10 digits, assume it's in seconds and convert to milliseconds
    blockTime *= 1000
  }
  // Create a new Date object using the blockTime (now in milliseconds)
  const date = new Date(blockTime)
  return date
}
