import { ENVIORMENT } from "./constants"

const shouldLog = (): boolean => {
  if (ENVIORMENT == "development") return true
  else false
}

export const log = (...args: any[]) => {
  if (!shouldLog) return
  console.log(args)
}
export const error = (...args: any[]) => {
  console.error(args)
}
export const warn = (...args: any[]) => {
  if (!shouldLog) return
  console.warn(args)
}
