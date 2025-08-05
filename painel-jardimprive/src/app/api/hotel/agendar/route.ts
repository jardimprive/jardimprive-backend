import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_temporario';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 });
    }

    const body = await request.json();
    const { date } = body;

    if (!date) {
      return NextResponse.json({ error: 'Data não fornecida' }, { status: 400 });
    }

    // Verifica se já existe uma reserva
    const existing = await prisma.hotelBooking.findUnique({
      where: {
        userId: decoded.userId,
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Você já agendou sua diária.' }, { status: 400 });
    }

    const novaDiaria = await prisma.hotelBooking.create({
      data: {
        userId: decoded.userId,
        date: new Date(date),
      },
    });

    return NextResponse.json(novaDiaria, { status: 201 });

  } catch (error) {
    console.error('Erro na API /hotel/agendar:', error);
    return NextResponse.json({ error: 'Erro interno ao agendar' }, { status: 500 });
  }
}
