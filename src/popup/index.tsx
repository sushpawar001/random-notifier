import "~style.css"

import { useEffect, useRef, useState } from "react"

import { Storage } from "@plasmohq/storage"

import {
  NOTIFICATION_STATE_KEY,
  PAUSE_END_TIME_STATE_KEY
} from "~lib/constants"
import { convertToTitleCase } from "~lib/helper"
import type { NotificationStateType } from "~types"

import RootLayout from "./components/layout"

function IndexPopup() {
  const isLoaded = useRef(false)
  const storage = new Storage()
  const [status, setStatus] = useState<NotificationStateType>()
  const [countdownInterval, setCountdownInterval] = useState(null)
  const [displayTimer, setDisplayTimer] = useState(false)
  const [displayTimerContent, setDisplayTimerContent] = useState(null)
  const [showPauseOptions, setShowPauseOptions] = useState(false)
  const [customMinutes, setCustomMinutes] = useState("")
  const [selectedDuration, setSelectedDuration] = useState<string>()

  const stopCountdown = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval)
      setCountdownInterval(null)
    }
    setDisplayTimer(false)
  }

  const startCountdown = (endTime) => {
    stopCountdown()
    setDisplayTimer(true)

    function updateTimer() {
      const now = Date.now()
      const remaining = endTime - now

      if (remaining <= 0) {
        stopCountdown()
        setStatus("running")
        return
      }

      const minutes = Math.floor(remaining / 60000)
      const seconds = Math.floor((remaining % 60000) / 1000)
      setDisplayTimerContent({
        min: minutes,
        sec: seconds
      })
    }

    updateTimer()
    setCountdownInterval(setInterval(updateTimer, 1000))
  }

  const init = async () => {
    const notificationState = await storage.get<NotificationStateType>(
      NOTIFICATION_STATE_KEY
    )
    const pauseEndTime = await storage.get(PAUSE_END_TIME_STATE_KEY)
    setStatus(notificationState || "running")

    if (notificationState == "paused" && pauseEndTime) {
      const remaingTime = Number(pauseEndTime) - Date.now()
      if (remaingTime > 0) {
        startCountdown(pauseEndTime)
      }
    }
  }

  const handleStartButton = () => {
    storage.set(NOTIFICATION_STATE_KEY, "running")
    setStatus("running")
    chrome.runtime.sendMessage({ action: "startNotifications" })
    stopCountdown()
  }

  const handleStopButton = () => {
    storage.set(NOTIFICATION_STATE_KEY, "stopped")
    setStatus("stopped")
    chrome.runtime.sendMessage({ action: "stopNotifications" })
    stopCountdown()
  }

  const handleApplyPause = () => {
    if (!selectedDuration) return
    const minutes =
      selectedDuration === "custom" ? customMinutes : selectedDuration
    const parsedMinutes = parseInt(minutes)
    if (parsedMinutes > 0) {
      setupPauseTimer(parsedMinutes)
    }
  }

  const setupPauseTimer = (minutes) => {
    const pauseEndTime = Date.now() + minutes * 60 * 1000
    storage.set(NOTIFICATION_STATE_KEY, "paused")
    storage.set(PAUSE_END_TIME_STATE_KEY, pauseEndTime)
    setStatus("paused")
    chrome.runtime.sendMessage({
      action: "pauseNotifications",
      duration: minutes
    })
    startCountdown(pauseEndTime)
    setShowPauseOptions(false)
  }

  useEffect(() => {
    if (!isLoaded.current) {
      init()
      isLoaded.current = true
    }
  }, [])

  return (
    <RootLayout>
      <div className="w-80 p-4 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-gray-800">
            Random Notifier
          </h1>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === "running"
                ? "bg-green-100 text-green-800"
                : status === "paused"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}>
            {convertToTitleCase(status)}
          </div>
        </div>

        {displayTimer && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Resuming in</p>
            <div className="text-2xl font-bold text-gray-800">
              {displayTimerContent.min}:
              {displayTimerContent.sec.toString().padStart(2, "0")}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            disabled={status === "running"}
            onClick={handleStartButton}>
            Start Notifications
          </button>

          <button
            className="w-full px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            disabled={status === "stopped" || status === "paused"}
            onClick={() => setShowPauseOptions(!showPauseOptions)}>
            Pause Notifications
          </button>

          <button
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            disabled={status === "stopped"}
            onClick={handleStopButton}>
            Stop Notifications
          </button>
        </div>

        {showPauseOptions && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pause Duration
            </label>
            <div className="space-y-2 mb-4">
              <div className="flex gap-4 flex-wrap">
                {[
                  { value: "5", label: "5" },
                  { value: "15", label: "15" },
                  { value: "30", label: "30" },
                  { value: "60", label: "60" },
                  { value: "custom", label: "Custom" }
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="pauseDuration"
                      value={option.value}
                      checked={selectedDuration === option.value}
                      onChange={(e) => setSelectedDuration(e.target.value)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            {selectedDuration == "custom" && (
              <div className="my-3 space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter minutes"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
            <button
              onClick={handleApplyPause}
              disabled={
                !selectedDuration ||
                (selectedDuration == "custom" && !customMinutes)
              }
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
              Pause
            </button>
          </div>
        )}
      </div>
    </RootLayout>
  )
}

export default IndexPopup
