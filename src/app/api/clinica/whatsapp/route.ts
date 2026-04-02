import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

const whatsappSchema = z.object({
  whatsappInstance: z.string().min(1),
  whatsappToken: z.string().min(1),
})

export async function PUT(req: Request) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const payload = await verifyToken(token)
    const { clinicId, role } = payload

    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores podem configurar o WhatsApp' }, { status: 403 })
    }

    const body = await req.json()
    const result = whatsappSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { whatsappInstance, whatsappToken } = result.data

    // Optionally verify the Z-API connection
    const zapiBaseUrl = process.env.ZAPI_BASE_URL || 'https://api.z-api.io'
    try {
      const statusRes = await fetch(
        `${zapiBaseUrl}/instances/${whatsappInstance}/token/${whatsappToken}/status`,
        { method: 'GET' }
      )
      if (!statusRes.ok) {
        return NextResponse.json(
          { error: 'Não foi possível conectar à instância Z-API. Verifique as credenciais.' },
          { status: 400 }
        )
      }
    } catch {
      // If Z-API is unreachable, save anyway (might be misconfigured ZAPI_BASE_URL)
      console.warn('Could not verify Z-API connection, saving anyway')
    }

    const clinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: { whatsappInstance, whatsappToken },
    })

    return NextResponse.json({ clinic, message: 'WhatsApp configurado com sucesso' })
  } catch (error) {
    console.error('PUT /clinica/whatsapp error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
