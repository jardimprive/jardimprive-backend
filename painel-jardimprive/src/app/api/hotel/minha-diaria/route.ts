import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_temporario';

export async function GET(request: Request) {
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

    const diaria = await prisma.hotelBooking.findUnique({
      where: {
        userId: decoded.userId,
      },
    });

    if (!diaria) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(diaria);

  } catch (error) {
    console.error('Erro na API /hotel/minha-diaria:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
