import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  try {
    const interfaces = os.networkInterfaces();
    let localIp = 'localhost';

    for (const ifaceName of Object.keys(interfaces)) {
      const iface = interfaces[ifaceName];
      if (!iface) continue;

      for (const alias of iface) {
        // Skip internal/loopback and non-IPv4 addresses
        if (alias.family === 'IPv4' && !alias.internal) {
          // Prefer standard private IP ranges (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
          if (
            alias.address.startsWith('192.168.') ||
            alias.address.startsWith('10.') ||
            alias.address.startsWith('172.')
          ) {
            localIp = alias.address;
            break;
          } else if (localIp === 'localhost') {
            localIp = alias.address;
          }
        }
      }
      if (localIp !== 'localhost' && localIp.startsWith('192.168.')) {
        break;
      }
    }

    return NextResponse.json({
      success: true,
      localIp,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      localIp: 'localhost',
    });
  }
}
