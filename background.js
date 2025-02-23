MAX_MINUTES = 60;
MIN_MINUTES = 35;
LAST_NOTIFICATION = null;

function timeNow() {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

function isTimeBetween(givenTime, startTime, endTime) {
    const baseDate = "1970-01-01";
    const given = new Date(`${baseDate}T${givenTime}`);
    const start = new Date(`${baseDate}T${startTime}`);
    const end = new Date(`${baseDate}T${endTime}`);

    if (start < end) {
        // Normal case: start and end are on the same day
        return given >= start && given <= end;
    } else {
        // Overnight case: start is before midnight, end is after midnight
        return given >= start || given <= end;
    }
}

function getRandomInterval() {
    const randomInterval = Math.floor(
        Math.random() * (MAX_MINUTES - MIN_MINUTES + 1) + MIN_MINUTES
    );
    return randomInterval;
}

function callTTS(message) {
    console.log("Calling TTS with message:", message);

    // Basic implementation without extra options
    chrome.tts.speak(message, function (error) {
        if (chrome.runtime.lastError) {
            console.error("TTS Error:", chrome.runtime.lastError.message);
        }
    });
}

function showNotification(notificationType) {
    chrome.storage.sync.get({
        startTime: '08:00',
        endTime: '22:00'
    }, (items) => {
        if (isTimeBetween(timeNow(), items.startTime, items.endTime)) {
            // check if latest notification is more than 10 minutes ago
            const is_allowed =
                LAST_NOTIFICATION === null ||
                Date.now() - LAST_NOTIFICATION > 10 * 60 * 1000;

            if (is_allowed) {
                switch (notificationType) {
                    case "stretching":
                        chrome.notifications.create({
                            type: "basic",
                            iconUrl: "stretching.png",
                            title: "Time to stretch!",
                            message:
                                "Get up and stretch your legs! You've been sitting for too long.",
                            priority: 2,
                        });
                        break;
                    case "water":
                        chrome.notifications.create({
                            type: "basic",
                            iconUrl: "water.png",
                            title: "Stay hydrated!",
                            message:
                                "It's time to drink some water! It's good for your health and productivity.",
                            priority: 2,
                        });
                        break;
                }

                if (notificationType === "stretching") {
                    callTTS("Time to stretch");
                } else if (notificationType === "water") {
                    callTTS("Stay hydrated");
                }

                LAST_NOTIFICATION = Date.now();
            }
        }
        scheduleNextNotification(notificationType);
    });
}

// Function to schedule next notification
function scheduleNextNotification(notificationType, firstCallDuration) {
    const nextInterval = getRandomInterval();
    chrome.alarms.create(notificationType, {
        delayInMinutes: firstCallDuration ? firstCallDuration : nextInterval,
    });
}

// Listen for alarm
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "stretching") {
        showNotification("stretching");
    } else if (alarm.name === "water") {
        showNotification("water");
    }
    console.log(
        `${alarm.name} is trigged at ${new Date().toLocaleTimeString()}`
    );
});

// Start the notification cycle when extension is installed
chrome.runtime.onInstalled.addListener(() => {
    callTTS("Extension installed successfully");

    scheduleNextNotification("stretching", 30);
    scheduleNextNotification("water", 1);
});
