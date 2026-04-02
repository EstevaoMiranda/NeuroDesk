import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { signToken, hashPassword, COOKIE_NAME } from '@/lib/auth'
import type { Plan } from '@/types'

const cadastroSchema = z.object({
  clinicName: z.string().min(2, 'Nome da clínica deve ter no mínimo 2 caracteres'),
  userName: z.string().min(2, 'Seu nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  plan: z.enum(['ESSENCIAL', 'CLINICA', 'REDE']).default('ESSENCIAL'),
})

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = cadastroSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { clinicName, userName, email, password, plan } = result.data

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Este e-mail já está em uso' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)
    let slug = generateSlug(clinicName)

    // Make slug unique if needed
    const existingClinic = await prisma.clinic.findUnique({ where: { slug } })
    if (existingClinic) {
      slug = `${slug}-${Date.now()}`
    }

    // Create clinic and admin user in a transaction
    const { clinic, user } = await prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({
        data: {
          name: clinicName,
          slug,
          plan: plan as Plan,
        },
      })

      const user = await tx.user.create({
        data: {
          name: userName,
          email,
          passwordHash,
          role: 'ADMIN',
          clinicId: clinic.id,
        },
      })

      return { clinic, user }
    })

    const token = await signToken({
      sub: user.id,
      clinicId: clinic.id,
      role: user.role,
      email: user.email,
      name: user.name,
    } as { sub: string; clinicId: string; role: string; email: string; name: string })

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: clinic.id,
        clinicName: clinic.name,
        clinicSlug: clinic.slug,
      },
      clinic: {
        id: clinic.id,
        name: clinic.name,
        slug: clinic.slug,
        plan: clinic.plan,
      },
    }, { status: 201 })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Cadastro error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
