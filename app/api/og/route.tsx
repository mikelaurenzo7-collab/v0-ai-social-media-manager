import { ImageResponse } from 'next/og'

export const runtime = 'edge'

const SIZE = { width: 1200, height: 630 } as const

/**
 * Dynamic Open Graph image. Returns a 1200×630 branded card with the
 * passed `title` and optional `eyebrow` overlaid on a warm gradient
 * with the PostPilot wordmark.
 *
 * Usage:
 *   /api/og?title=Meet the agents&eyebrow=The roster
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const title = (searchParams.get('title') || 'PostPilot').slice(0, 120)
  const eyebrow = (searchParams.get('eyebrow') || 'One AI agent per channel.').slice(0, 80)
  const subtitle = (searchParams.get('subtitle') || '').slice(0, 200)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background:
            'linear-gradient(135deg, #1a120e 0%, #28160e 50%, #2c0e1d 100%)',
          padding: 80,
          color: 'white',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Brand glow top-right */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(234,88,12,0.55), transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -180,
            left: -160,
            width: 540,
            height: 540,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(219,39,119,0.45), transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Top row: logo + chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background:
                  'linear-gradient(135deg, #F59E0B 0%, #EA580C 50%, #DB2777 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 40px rgba(234,88,12,0.55)',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13" />
                <path d="m22 2-7 20-4-9-9-4 20-7Z" />
              </svg>
            </div>
            <div
              style={{
                fontSize: 38,
                fontWeight: 700,
                letterSpacing: -1.5,
                color: 'white',
                display: 'flex',
              }}
            >
              PostPilot
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 9999,
              border: '1px solid rgba(255,255,255,0.18)',
              fontSize: 18,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.78)',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 9999,
                background: '#34D399',
                display: 'flex',
              }}
            />
            All systems normal
          </div>
        </div>

        {/* Title block */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#FB923C',
              display: 'flex',
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: title.length > 60 ? 64 : 80,
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1.05,
              color: 'white',
              display: 'flex',
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                marginTop: 22,
                fontSize: 28,
                fontWeight: 400,
                lineHeight: 1.35,
                color: 'rgba(255,255,255,0.72)',
                display: 'flex',
                maxWidth: 980,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {/* Bottom row: channel chips */}
        <div
          style={{
            marginTop: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            {['X', 'Meta', 'LinkedIn', 'TikTok', 'Gmail', 'Outlook'].map(
              (label) => (
                <div
                  key={label}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 9999,
                    border: '1px solid rgba(255,255,255,0.16)',
                    background: 'rgba(255,255,255,0.04)',
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.85)',
                    display: 'flex',
                  }}
                >
                  {label}
                </div>
              ),
            )}
          </div>
          <div
            style={{
              fontSize: 20,
              color: 'rgba(255,255,255,0.5)',
              display: 'flex',
            }}
          >
            postpilot.app
          </div>
        </div>
      </div>
    ),
    SIZE,
  )
}
