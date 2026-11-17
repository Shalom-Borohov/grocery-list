const MONTH_OFFSET = 1

const DAY_MONTH_LENGTH = 'YYYY-MM'.length

const DAY_YEAR_LENGTH = 'YYYY'.length

const DATE_PART_SEPARATOR = '-'

const pad = (part: number) => String(part).padStart(2, '0')

export function dayDateOf(time: number) {
  const date = new Date(time)

  return `${date.getFullYear()}-${pad(date.getMonth() + MONTH_OFFSET)}-${pad(date.getDate())}`
}

export const dayMonth = (dayDate: string) => dayDate.slice(0, DAY_MONTH_LENGTH)

export const dayYear = (dayDate: string) => Number(dayDate.slice(0, DAY_YEAR_LENGTH))

export function dayDateToLocal(dayDate: string) {
  const [year, month, day] = dayDate.split(DATE_PART_SEPARATOR).map(Number)

  return new Date(year, month - MONTH_OFFSET, day)
}
