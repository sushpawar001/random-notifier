import StretchingUrl from "data-url:~assets/stretching.png"
import WaterUrl from "data-url:~assets/water.png"

import type { RequiredNotificationOptions } from "~types"

export const ENVIORMENT: "development" | "production" =
  process.env.NODE_ENV || "development"

export const TTSSTATUS = true

export const MAX_MINUTES = 60
export const MIN_MINUTES = 35

export const NOTIFICATION_STATE_KEY = "notificationState"
export const PAUSE_END_TIME_STATE_KEY = "pauseEndTime"

export const StretchingNotification: RequiredNotificationOptions = {
  type: "basic",
  iconUrl: StretchingUrl,
  title: "Time to stretch!",
  message: "Get up and stretch your legs! You've been sitting for too long.",
  priority: 2
}

export const WaterNotification: RequiredNotificationOptions = {
  type: "basic",
  iconUrl: WaterUrl,
  title: "Stay hydrated!",
  message:
    "It's time to drink some water! It's good for your health and productivity.",
  priority: 2
}
