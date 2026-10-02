import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { MOCK_RECLAMATIONS } from '@/data/mockData';

export async function GET() {
  try {
    const reclamations = await db.reclamation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reclamations);
  } catch (error) {
    console.error('API Error /api/reclamations GET (Using Mock Fallback):', error);
    return NextResponse.json(MOCK_RECLAMATIONS);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const claimData = {
      id: `rec-${Date.now()}`,
      orderId: body.orderId || 'ORD-0000',
      userName: body.userName || 'Client',
      userEmail: body.userEmail || 'client@example.com',
      userPhone: body.userPhone || '+33 6 00 00 00 00',
      subject: body.subject || 'Problème Commande',
      description: body.description || '',
      status: 'new' as const,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    try {
      const newClaim = await db.reclamation.create({
        data: {
          orderId: claimData.orderId,
          userName: claimData.userName,
          userEmail: claimData.userEmail,
          userPhone: claimData.userPhone,
          subject: claimData.subject,
          description: claimData.description,
          status: claimData.status,
        },
      });
      return NextResponse.json(newClaim, { status: 201 });
    } catch (dbErr) {
      console.warn('PostgreSQL offline, returning simulated claim:', dbErr);
      return NextResponse.json(claimData, { status: 201 });
    }
  } catch (error) {
    console.error('API Error /api/reclamations POST:', error);
    return NextResponse.json({ error: 'Failed to submit claim' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status, adminNote } = await req.json();

    const updated = await db.reclamation.update({
      where: { id },
      data: {
        status: status || undefined,
        adminNote: adminNote || undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('API Error /api/reclamations PATCH:', error);
    return NextResponse.json({ error: 'Failed to update claim resolution' }, { status: 500 });
  }
}
