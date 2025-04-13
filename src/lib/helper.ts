import { TTSSTATUS } from "~lib/constants"
import { error } from "~lib/logger"

export const timeNow = () => {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  })
}

export const callTTS = (message) => {
  if (!TTSSTATUS) return
  chrome.tts.speak(message, () => {
    if (chrome.runtime.lastError) {
      error("TTS Error:", chrome.runtime.lastError.message)
    }
  })
}

export const convertToTitleCase = (str: string): string => {
  if (!str) return
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
