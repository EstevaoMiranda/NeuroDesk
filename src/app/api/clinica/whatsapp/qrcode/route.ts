import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { getZApiQrCode } from '@/lib/zapi'

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const payload = await verifyToken(token)

    const clinic = await prisma.clinic.findUnique({
      where: { id: payload.clinicId },
      select: { whatsappInstance: true, whatsappToken: true },
    })

    if (!clinic?.whatsappInstance || !clinic?.whatsappToken) {
      return NextResponse.json({ error: 'Instância Z-API não configurada' }, { status: 400 })
    }

    const qr = await getZApiQrCode(clinic.whatsappInstance, clinic.whatsappToken)

    // Z-API returns { value: "data:image/png;base64,..." } or { qrcode: "..." }
    const qrImage = qr.value || qr.qrcode || null

    return NextResponse.json({ qrcode: qrImage })
  } catch (error) {
    console.error('GET /clinica/whatsapp/qrcode error:', error)
    return NextResponse.json({ error: 'Não foi possível obter o QR Code' }, { status: 500 })
  }
}
