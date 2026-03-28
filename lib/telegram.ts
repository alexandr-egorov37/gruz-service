const TELEGRAM_BOT_TOKEN = "8172010698:AAGsJRnDQ_8u81R1ErHT60iZW68NKXoYX5Q"
const TELEGRAM_CHAT_ID = "-1002996461034"

export async function sendToTelegram(message: string) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.description || "Failed to send message to Telegram")
    }

    return await response.json()
  } catch (error) {
    console.error("Telegram error:", error)
    throw error
  }
}
