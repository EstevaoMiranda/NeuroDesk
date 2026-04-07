import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { getZApiStatus, registerZApiWebhook } from '@/lib/zapi'

const whatsappSchema = z.object({
  whatsappInstance: z.string().min(1),
  whatsappToken: z.string().min(1),
})

async function getAuth(req: Request) {
  const token = getTokenFromRequest(req)
  if (!token) return null
  return verifyToken(token)
}

// GET — retorna status atual da conexão WhatsApp da clínica
export async function GET(req: Request) {
  try {
    const payload = await getAuth(req)
    if (!payload) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const clinic = await prisma.clinic.findUnique({
      where: { id: payload.clinicId },
      select: {
        whatsappInstance: true,
        whatsappToken: true,
        whatsappConnected: true,
        whatsappPhone: true,
      },
    })

    if (!clinic) return NextResponse.json({ error: 'Clínica não encontrada' }, { status: 404 })

    // If credentials configured, check live status
    if (clinic.whatsappInstance && clinic.whatsappToken) {
      try {
        const status = await getZApiStatus(clinic.whatsappInstance, clinic.whatsappToken)
        const connected = status.connected === true

        // Sync connected state to DB if changed
        if (connected !== clinic.whatsappConnected || (connected && status.phone && status.phone !== clinic.whatsappPhone)) {
          await prisma.clinic.update({
            where: { id: payload.clinicId },
            data: {
              whatsappConnected: connected,
              whatsappPhone: connected ? (status.phone ?? clinic.whatsappPhone) : clinic.whatsappPhone,
            },
          })
        }

        return NextResponse.json({
          connected,
          phone: connected ? status.phone : null,
          instance: clinic.whatsappInstance,
          webhookRegistered: true,
        })
      } catch {
        return NextResponse.json({
          connected: clinic.whatsappConnected,
          phone: clinic.whatsappPhone,
          instance: clinic.whatsappInstance,
          webhookRegistered: !!clinic.whatsappInstance,
        })
      }
    }

    return NextResponse.json({ connected: false, phone: null, instance: null, webhookRegistered: false })
  } catch (error) {
    console.error('GET /clinica/whatsapp error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST — salva credenciais, registra webhook, retorna status
export async function POST(req: Request) {
  try {
    const payload = await getAuth(req)
    if (!payload) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores podem configurar o WhatsApp' }, { status: 403 })
    }

    const body = await req.json()
    const result = whatsappSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { whatsappInstance, whatsappToken } = result.data

    // Verify credentials with Z-API
    let connected = false
    let phone: string | null = null
    try {
      const status = await getZApiStatus(whatsappInstance, whatsappToken)
      connected = status.connected === true
      phone = status.phone ?? null
    } catch {
      // Credentials might be valid but phone not scanned yet
    }

    // Register webhook
    const webhookUrl = process.env.WEBHOOK_URL || 'https://neuro-desk-pearl.vercel.app/api/whatsapp/webhook'
    try {
      await registerZApiWebhook(whatsappInstance, whatsappToken, webhookUrl)
    } catch (err) {
      console.warn('Could not register webhook:', err)
    }

    // Save to DB
    await prisma.clinic.update({
      where: { id: payload.clinicId },
      data: {
        whatsappInstance,
        whatsappToken,
        whatsappConnected: connected,
        whatsappPhone: phone,
      },
    })

    return NextResponse.json({
      connected,
      phone,
      instance: whatsappInstance,
      webhookRegistered: true,
      message: connected ? 'WhatsApp já conectado!' : 'Credenciais salvas. Escaneie o QR Code.',
    })
  } catch (error) {
    console.error('POST /clinica/whatsapp error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PUT — mantido para compatibilidade (equivale ao POST)
export async function PUT(req: Request) {
  return POST(req)
}

// DELETE — desconecta WhatsApp
export async function DELETE(req: Request) {
  try {
    const payload = await getAuth(req)
    if (!payload) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores podem desconectar o WhatsApp' }, { status: 403 })
    }

    await prisma.clinic.update({
      where: { id: payload.clinicId },
      data: {
        whatsappInstance: null,
        whatsappToken: null,
        whatsappConnected: false,
        whatsappPhone: null,
      },
    })

    return NextResponse.json({ message: 'WhatsApp desconectado com sucesso' })
  } catch (error) {
    console.error('DELETE /clinica/whatsapp error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
