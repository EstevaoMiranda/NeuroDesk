import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { getZApiStatus } from '@/lib/zapi'

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const payload = await verifyToken(token)

    const clinic = await prisma.clinic.findUnique({
      where: { id: payload.clinicId },
      select: {
        whatsappInstance: true,
        whatsappToken: true,
        whatsappConnected: true,
        whatsappPhone: true,
      },
    })

    if (!clinic?.whatsappInstance || !clinic?.whatsappToken) {
      return NextResponse.json({ status: 'disconnected', connected: false, phone: null })
    }

    try {
      const zapiStatus = await getZApiStatus(clinic.whatsappInstance, clinic.whatsappToken)
      const connected = zapiStatus.connected === true
      const phone = zapiStatus.phone ?? clinic.whatsappPhone ?? null

      // Sync to DB if changed
      if (connected !== clinic.whatsappConnected || (connected && phone !== clinic.whatsappPhone)) {
        await prisma.clinic.update({
          where: { id: payload.clinicId },
          data: { whatsappConnected: connected, whatsappPhone: connected ? phone : clinic.whatsappPhone },
        })
      }

      return NextResponse.json({
        status: connected ? 'connected' : 'waiting',
        connected,
        phone: connected ? phone : null,
        instance: clinic.whatsappInstance,
      })
    } catch {
      return NextResponse.json({
        status: clinic.whatsappConnected ? 'connected' : 'waiting',
        connected: clinic.whatsappConnected,
        phone: clinic.whatsappPhone ?? null,
        instance: clinic.whatsappInstance,
      })
    }
  } catch (error) {
    console.error('GET /clinica/whatsapp/status error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
