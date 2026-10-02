import { NextRequest, NextResponse } from 'next/server';
import { verifyPromoCode } from '@/lib/chanceGame';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ isValid: false, error: 'Code requis' }, { status: 400 });
    }

    const result = verifyPromoCode(code);
    if (!result.isValid) {
      return NextResponse.json({ isValid: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      isValid: true,
      promo: result.code,
    });
  } catch (error: any) {
    return NextResponse.json(
      { isValid: false, error: error.message || 'Erreur vérification du code' },
      { status: 500 }
    );
  }
}
