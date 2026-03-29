import { NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8172010698:AAGsJRnDQ_8u81R1ErHT60iZW68NKXoYX5Q"
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "-1002996461034"

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status:400 })
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    
    // Set a timeout for the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 seconds timeout

    try {
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
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Telegram API response error:", errorData)
        return NextResponse.json({ 
          error: errorData.description || "Failed to send message to Telegram" 
        }, { status: 502 })
      }

      const data = await response.json()
      return NextResponse.json({ success: true, data })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        console.error("Telegram API timeout (3s)")
        return NextResponse.json({ error: "Telegram API timeout" }, { status: 504 })
      }
      throw fetchError
    }
  } catch (error: any) {
    console.error("API Route Error:", error)
    return NextResponse.json({ 
      error: error.message || "Internal Server Error" 
    }, { status: 500 })
  }
}
