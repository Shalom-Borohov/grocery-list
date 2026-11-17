import { dayDateToLocal } from '../domain/dayDate'

const SHORT_DATE = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'numeric', year: '2-digit' })

const DAY_AND_MONTH = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'numeric' })

const MONTH_NAME = new Intl.DateTimeFormat('he-IL', { month: 'long' })

const MONTH_AND_YEAR = new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' })

const WEEKDAY_LETTER = new Intl.DateTimeFormat('he-IL', { weekday: 'narrow' })

const WEEKDAY_NAME = new Intl.DateTimeFormat('he-IL', { weekday: 'short' })

const CLOCK = new Intl.DateTimeFormat('he-IL', { hour: '2-digit', minute: '2-digit' })

const FIRST_DAY = '-01'

export const dayAndMonth = (dayDate: string) => DAY_AND_MONTH.format(dayDateToLocal(dayDate))

export const monthName = (month: string) => MONTH_NAME.format(dayDateToLocal(`${month}${FIRST_DAY}`))

export const monthAndYear = (month: string) => MONTH_AND_YEAR.format(dayDateToLocal(`${month}${FIRST_DAY}`))

export const shortDate = (time: number) => SHORT_DATE.format(time)

export const weekdayLetter = (time: number) => WEEKDAY_LETTER.format(time)

export const weekdayName = (time: number) => WEEKDAY_NAME.format(time)

export const dayOfMonth = (time: number) => String(new Date(time).getDate())

export const clockTime = (time: number) => CLOCK.format(time)
