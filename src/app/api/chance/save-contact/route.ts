import { NextRequest, NextResponse } from 'next/server';
import { saveContactForCode } from '@/lib/chanceGame';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, contact } = body;

    if (!code || !contact) {
      return NextResponse.json({ success: false, error: 'Code et contact requis' }, { status: 400 });
    }

    const updated = saveContactForCode(code, contact);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Code introuvable' }, { status: 404 });
    }

    // If contact is an email, send email confirmation if SMTP is available
    if (contact.includes('@')) {
      try {
        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = parseInt(process.env.SMTP_PORT || '465');
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;

        if (smtpUser && smtpPass) {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: { user: smtpUser, pass: smtpPass },
            tls: { rejectUnauthorized: false },
          });

          await transporter.sendMail({
            from: `"Le Crispy Gourmet" <${smtpUser}>`,
            to: contact,
            subject: `🎰 Votre Code Promotionnel Exclusif Le Crispy : ${updated.code}`,
            html: `
              <div style="font-family: Arial, sans-serif; background-color: #0D1F14; color: #F5F1E8; padding: 30px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 2px solid #C9A24A;">
                <h1 style="color: #C9A24A; text-align: center; margin-bottom: 10px;">🎉 FÉLICITATIONS !</h1>
                <p style="text-align: center; font-size: 16px;">Vous avez tourné la roue de la fortune chez <strong>Le Crispy</strong> et gagné :</p>
                <div style="background-color: #14261A; border: 1px dashed #C9A24A; padding: 15px; border-radius: 12px; text-align: center; margin: 20px 0;">
                  <span style="font-size: 20px; font-weight: bold; color: #E0B84A;">${updated.rewardLabel}</span>
                  <div style="margin-top: 15px; font-size: 24px; font-weight: 900; letter-spacing: 3px; color: #FFFFFF; font-family: monospace; background: #000; padding: 10px; border-radius: 8px;">
                    ${updated.code}
                  </div>
                </div>
                <p style="text-align: center; font-size: 13px; color: #C9C4B8;">Utilisez ce code lors de votre prochaine commande en ligne ou présentez-le en caisse.</p>
                <p style="text-align: center; font-size: 11px; color: #A8A29E; margin-top: 25px;">Le Crispy Dormans — 1 rue Jean de Dormans, 51700 Dormans • 09 56 07 00 91</p>
              </div>
            `,
          });
        }
      } catch (mailErr) {
        console.warn('Could not dispatch promo email, saved contact anyway:', mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Vos coordonnées ont été enregistrées avec succès !',
      code: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur enregistrement contact' },
      { status: 500 }
    );
  }
}
