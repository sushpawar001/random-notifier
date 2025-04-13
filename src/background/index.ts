import { Storage } from "@plasmohq/storage"

import {
  MAX_MINUTES,
  MIN_MINUTES,
  NOTIFICATION_STATE_KEY,
  PAUSE_END_TIME_STATE_KEY,
  StretchingNotification,
  WaterNotification
} from "~lib/constants"
import { callTTS, timeNow } from "~lib/helper"
import { log } from "~lib/logger"
import type { NotificationStateType, NotificationType } from "~types"

const storage = new Storage()

//Variables
let lastNotification = null
let NotificationState: NotificationStateType = "running"
let pauseTimeout = null

// helpers
const isTimeBetween = (givenTime, startTime, endTime) => {
  const baseDate = "1970-01-01"
  const given = new Date(`${baseDate}T${givenTime}`)
  const start = new Date(`${baseDate}T${startTime}`)
  const end = new Date(`${baseDate}T${endTime}`)

  if (start < end) {
    // Normal case: start and end are on the same day
    return given >= start && given <= end
  } else {
    // Overnight case: start is before midnight, end is after midnight
    return given >= start || given <= end
  }
}

const getRandomInterval = () => {
  const randomInterval = Math.floor(
    Math.random() * (MAX_MINUTES - MIN_MINUTES + 1) + MIN_MINUTES
  )
  return randomInterval
}

const scheduleNextNotification = (
  notificationType: NotificationType,
  firstCallDuration?: number
) => {
  const nextInterval = getRandomInterval()
  chrome.alarms.create(notificationType, {
    delayInMinutes: firstCallDuration ? firstCallDuration : nextInterval
  })
}

const showNotification = (notificationType: NotificationType) => {
  if (NotificationState !== "running") {
    return
  }
  chrome.storage.sync.get(
    {
      startTime: "08:00",
      endTime: "22:00"
    },
    (items) => {
      if (isTimeBetween(timeNow(), items.startTime, items.endTime)) {
        // check if latest notification is more than 10 minutes ago
        const is_allowed =
          lastNotification === null ||
          Date.now() - lastNotification > 10 * 60 * 1000

        if (is_allowed) {
          switch (notificationType) {
            case "stretching":
              chrome.notifications.create(StretchingNotification)
              break
            case "water":
              chrome.notifications.create(WaterNotification)
              break
          }
          if (notificationType === "stretching") {
            callTTS("Time to stretch")
          } else if (notificationType === "water") {
            callTTS("Stay hydrated")
          }

          lastNotification = Date.now()
        }
      }
      scheduleNextNotification(notificationType)
    }
  )
}

// listners
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  switch (message.action) {
    case "startNotifications":
      NotificationState = "running"
      if (pauseTimeout) {
        clearTimeout(pauseTimeout)
        pauseTimeout = null
      }
      break

    case "stopNotifications":
      NotificationState = "stopped"
      if (pauseTimeout) {
        clearTimeout(pauseTimeout)
        pauseTimeout = null
      }
      break

    case "pauseNotifications":
      NotificationState = "paused"
      if (pauseTimeout) {
        clearTimeout(pauseTimeout)
      }
      pauseTimeout = setTimeout(
        () => {
          NotificationState = "running"
          storage.set(NOTIFICATION_STATE_KEY, "running")
        },
        message.duration * 60 * 1000
      )
      break
  }
})

// Listen for alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "stretching") {
    showNotification("stretching")
  } else if (alarm.name === "water") {
    showNotification("water")
  }
  log(`${alarm.name} is trigged at ${new Date().toLocaleTimeString()}`)
})

// Start the notification cycle when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  callTTS("Extension installed successfully")
  scheduleNextNotification("stretching", 30)
  scheduleNextNotification("water", 1)
})

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  switch (message.action) {
    case "startNotifications":
      NotificationState = "running"
      if (pauseTimeout) {
        clearTimeout(pauseTimeout)
        pauseTimeout = null
      }
      break

    case "stopNotifications":
      NotificationState = "stopped"
      if (pauseTimeout) {
        clearTimeout(pauseTimeout)
        pauseTimeout = null
      }
      break

    case "pauseNotifications":
      NotificationState = "paused"
      if (pauseTimeout) {
        clearTimeout(pauseTimeout)
      }
      pauseTimeout = setTimeout(
        () => {
          NotificationState = "running"
          storage.set(NOTIFICATION_STATE_KEY, "running")
        },
        message.duration * 60 * 1000
      )
      break
  }
})

// When extension starts, check the stored state
const init = async () => {
  const StoredNotificationState = await storage.get(NOTIFICATION_STATE_KEY)
  if (StoredNotificationState) {
    const pausedEndTime = await storage.get(PAUSE_END_TIME_STATE_KEY)
    NotificationState = StoredNotificationState as NotificationStateType

    if (NotificationState == "paused" && pausedEndTime) {
      const remainingTime = Number(pausedEndTime) - Date.now()
      if (remainingTime > 0) {
        pauseTimeout = setTimeout(() => {
          NotificationState = "running"
          storage.set(NOTIFICATION_STATE_KEY, "running")
        }, remainingTime)
      } else {
        NotificationState = "running"
        storage.set(NOTIFICATION_STATE_KEY, "running")
      }
    }
  }
}

init()
