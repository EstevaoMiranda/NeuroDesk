const ZAPI_BASE_URL = process.env.ZAPI_BASE_URL || 'https://api.z-api.io'

function zapiUrl(instanceId: string, token: string, path: string): string {
  return `${ZAPI_BASE_URL}/instances/${instanceId}/token/${token}/${path}`
}

export interface ZApiStatus {
  connected: boolean
  phone?: string
  session?: string
  smartphoneConnected?: boolean
}

export interface ZApiQrCode {
  value?: string   // base64 image or URL
  qrcode?: string
}

export async function getZApiStatus(instanceId: string, token: string): Promise<ZApiStatus> {
  const res = await fetch(zapiUrl(instanceId, token, 'status'), {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Z-API status error: ${res.status}`)
  return res.json()
}

export async function getZApiQrCode(instanceId: string, token: string): Promise<ZApiQrCode> {
  const res = await fetch(zapiUrl(instanceId, token, 'qr-code'), {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Z-API QR code error: ${res.status}`)
  return res.json()
}

export async function registerZApiWebhook(
  instanceId: string,
  token: string,
  webhookUrl: string,
): Promise<void> {
  // Register webhook for received messages
  await fetch(zapiUrl(instanceId, token, 'update-webhook-received'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl }),
  })
  // Register webhook for status/delivery callbacks
  await fetch(zapiUrl(instanceId, token, 'update-webhook-message-status'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl }),
  }).catch(() => {/* optional endpoint, ignore errors */})
}

export async function sendTextMessage(
  instanceId: string,
  token: string,
  phone: string,
  message: string,
): Promise<{ zaapId?: string; messageId?: string }> {
  const res = await fetch(zapiUrl(instanceId, token, 'send-text'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, message }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Z-API send-text error ${res.status}: ${JSON.stringify(err)}`)
  }
  return res.json()
}

export async function sendAudioMessage(
  instanceId: string,
  token: string,
  phone: string,
  audioUrl: string,
): Promise<{ zaapId?: string; messageId?: string }> {
  const res = await fetch(zapiUrl(instanceId, token, 'send-audio'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, audio: audioUrl }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Z-API send-audio error ${res.status}: ${JSON.stringify(err)}`)
  }
  return res.json()
}

export async function transcribeAudio(
  instanceId: string,
  token: string,
  messageId: string,
): Promise<{ transcription?: string; text?: string }> {
  const res = await fetch(
    zapiUrl(instanceId, token, `transcribe-audio?messageId=${encodeURIComponent(messageId)}`),
    { cache: 'no-store' },
  )
  if (!res.ok) throw new Error(`Z-API transcribe error: ${res.status}`)
  return res.json()
}
