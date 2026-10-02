import { NextRequest, NextResponse } from 'next/server';
import { getGameSettings, updateGameSettings, CHANCE_REWARDS } from '@/lib/chanceGame';

export async function GET() {
  try {
    const settings = getGameSettings();
    return NextResponse.json({
      success: true,
      settings,
      rewards: CHANCE_REWARDS,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur chargement paramètres' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = updateGameSettings(body);
    return NextResponse.json({
      success: true,
      settings: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur mise à jour paramètres' },
      { status: 500 }
    );
  }
}
