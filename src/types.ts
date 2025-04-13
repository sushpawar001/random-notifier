export type NotificationStateType = "running" | "paused" | "stopped"
export type NotificationType = "stretching" | "water"

export type RequiredNotificationOptions = {
  type: chrome.notifications.TemplateType
  iconUrl: string
  title: string
  message: string
  priority: number
}
