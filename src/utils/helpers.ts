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

export const formatCurrencyAgnostic = (
  value: string | number,
  locale = 'en-US',
) => {
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(parseFloat(value.toString()))
}

export const toHumanReadableDate = (value: string | Date) => {
  return Intl.DateTimeFormat('en-US', {
    dateStyle: 'short',
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

export function formatBlockDaaScore(daaScore: string) {
  // Format the score with commas for thousands
  return daaScore.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
