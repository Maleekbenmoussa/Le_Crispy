import { NextRequest, NextResponse } from 'next/server';
import { drawReward, checkCooldown, getGameSettings } from '@/lib/chanceGame';

export async function POST(req: NextRequest) {
  try {
    const settings = getGameSettings();
    if (!settings.isGameActive) {
      return NextResponse.json(
        {
          success: false,
          isGameActive: false,
          error: 'Le jeu est actuellement en pause. Revenez très bientôt pour tenter votre chance !',
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    // Client identifier can be provided by frontend or fallback to IP / User-Agent
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIdentifier = body.clientId || forwardedFor?.split(',')[0] || realIp || 'client_anonymous';

    // Anti-abuse cooldown check
    const cooldown = checkCooldown(clientIdentifier);
    if (!cooldown.canPlay) {
      return NextResponse.json(
        {
          success: false,
          canPlay: false,
          remainingHours: cooldown.remainingHours,
          existingCode: cooldown.existingCode,
          error: `Vous avez déjà tourné la roue aujourd'hui ! Vous pourrez rejouer dans ${cooldown.remainingHours}h.`,
        },
        { status: 429 }
      );
    }

    const result = drawReward(clientIdentifier);

    return NextResponse.json({
      success: true,
      canPlay: true,
      reward: result.reward,
      sliceIndex: result.sliceIndex,
      promoCode: result.promoCode,
    });
  } catch (error: any) {
    console.error('Error in /api/chance/spin:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors du tirage de la roue' },
      { status: 500 }
    );
  }
}
