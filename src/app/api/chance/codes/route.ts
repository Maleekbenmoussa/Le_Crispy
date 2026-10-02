import { NextRequest, NextResponse } from 'next/server';
import { getAllPromoCodes, updatePromoCodeStatus, deletePromoCode } from '@/lib/chanceGame';

export async function GET() {
  try {
    const codes = getAllPromoCodes();
    return NextResponse.json({
      success: true,
      codes,
      total: codes.length,
      activeCount: codes.filter(c => !c.isUsed && new Date(c.expiresAt).getTime() > Date.now()).length,
      usedCount: codes.filter(c => c.isUsed).length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur récupération des codes' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { codeId, isUsed } = body;
    if (!codeId) {
      return NextResponse.json({ success: false, error: 'Identifiant du code requis' }, { status: 400 });
    }

    const updated = updatePromoCodeStatus(codeId, Boolean(isUsed));
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Code introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, code: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur mise à jour du code' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const codeId = searchParams.get('id');
    if (!codeId) {
      return NextResponse.json({ success: false, error: 'Identifiant du code requis' }, { status: 400 });
    }

    const deleted = deletePromoCode(codeId);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur suppression du code' },
      { status: 500 }
    );
  }
}
