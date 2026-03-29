/**
 * Отправляет сообщение в Telegram через внутренний API роут.
 * Это предотвращает блокировки (VPN) и задержки загрузки на стороне клиента.
 */
export async function sendToTelegram(message: string) {
  try {
    const response = await fetch("/api/telegram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to send message via API")
    }

    return await response.json()
  } catch (error: any) {
    console.warn("Telegram send failed (graceful):", error.message)
    // Мы не пробрасываем ошибку дальше, чтобы не ломать UI, 
    // но логируем её для отладки.
    return { success: false, error: error.message }
  }
}
