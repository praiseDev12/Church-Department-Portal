import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const formatBirthday = (date) => {
  if (!date) return '';

  return new Date(date).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
  });
};

export default function BirthdayVideo({
  member,
  template,
  message,
  logoSrc = '/portal-logo.png',
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = template?.accent || '#fbbf24';

  const spr = (delay, config = {}) =>
    spring({
      frame: frame - delay,
      fps,
      config: { damping: 18, mass: 0.6, ...config },
    });

  const fadeOut = (start, end) =>
    interpolate(frame, [start, end], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  // ── Scene boundaries ──────────────────────────────────────────────
  // Scene 1 — "Happy Birthday" (0–65)
  const s1In = spr(0, { damping: 11, mass: 0.9 }); // bouncier overshoot
  const s1Out = fadeOut(50, 65);
  const s1ExitPunch = interpolate(frame, [50, 65], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scene 2 — Photo + name (55–150)
  const s2In = spr(55, { damping: 13, mass: 0.7 });
  const s2Out = fadeOut(130, 150);
  const s2ExitPunch = interpolate(frame, [130, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scene 3 — Message (135–260)
  const s3In = spr(140, { damping: 16 });
  const s3Out = fadeOut(240, 260);
  const s3ExitPunch = interpolate(frame, [240, 260], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scene 4 — Logo + portal name (250–360)
  const s4In = spr(255, { damping: 9, mass: 1 }); // extra bouncy pop at the end
  const s4Out = fadeOut(340, 360);

  const slowDrift = Math.sin(frame / 40) * 6;

  // ── Flash-cut overlay: a quick white pulse right as each scene starts ──
  const flashAt = (delay) =>
    interpolate(frame, [delay - 3, delay, delay + 6], [0, 0.55, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  const flashOpacity = Math.max(
    flashAt(0),
    flashAt(55),
    flashAt(140),
    flashAt(255),
  );

  return (
    <AbsoluteFill
      style={{
        background: template?.background || '#111827',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Vignette for text contrast */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 35%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Floating rings */}
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          right: -120,
          top: -100 + slowDrift,
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 360,
          height: 360,
          borderRadius: '50%',
          left: -170,
          bottom: -150 - slowDrift,
          backgroundColor: 'rgba(255,255,255,0.05)',
        }}
      />

      {/* Drifting particles */}
      {[...Array(14)].map((_, index) => {
        const x = 5 + ((index * 23) % 90);
        const y = 10 + ((index * 31) % 80);
        const size = 4 + (index % 4) * 2;
        const speed = 18 + (index % 5) * 6;
        const drift = Math.sin(frame / speed + index) * 10;

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor:
                index % 3 === 0 ? accent : 'rgba(255,255,255,0.4)',
              transform: `translateY(${drift}px)`,
              opacity: interpolate(frame, [0, 20], [0, 0.7], {
                extrapolateRight: 'clamp',
              }),
            }}
          />
        );
      })}

      {/* Scene 1 — HAPPY BIRTHDAY: bouncy zoom-punch in, rotation wobble, snap-out on exit */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          opacity: s1In * s1Out,
          transform: `
            scale(${interpolate(s1In, [0, 1], [0.35, 1]) * (1 - s1ExitPunch * 0.5)})
            rotate(${interpolate(s1In, [0, 1], [-14, 0]) + s1ExitPunch * 10}deg)
          `,
        }}
      >
        <div style={{ fontSize: 90 }}>🎉</div>
        <div
          style={{
            marginTop: 25,
            fontSize: 38,
            fontWeight: 600,
            letterSpacing: 1,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          The{' '}
          {member?.department?.name?.toLowerCase().includes('department')
            ? member?.department?.name
            : `${member?.department?.name + ' Department' || 'The Department'}`}{' '}
          wishes you a
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: 4,
            textTransform: 'uppercase',
            lineHeight: 1.15,
            textShadow: `0 0 60px ${accent}66`,
          }}
        >
          Happy
          <br />
          Birthday
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 42,
            fontWeight: 600,
            color: accent,
          }}
        >
          {member?.fullName}
        </div>
      </AbsoluteFill>

      {/* Scene 2 — Photo spins + slides up into place, exits by sliding down and shrinking */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          opacity: s2In * s2Out,
          transform: `
            translateY(${interpolate(s2In, [0, 1], [160, 0]) + s2ExitPunch * -140}px)
            scale(${interpolate(s2In, [0, 1], [0.5, 1]) * (1 - s2ExitPunch * 0.25)})
            rotate(${interpolate(s2In, [0, 1], [18, 0])}deg)
          `,
        }}
      >
        <div
          style={{
            width: 660,
            height: 660,
            borderRadius: '50%',
            padding: 10,
            background: `conic-gradient(from ${frame * 1.2}deg, ${accent}, transparent 55%, ${accent})`,
            boxShadow: `0 0 90px ${accent}66`,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              padding: 8,
              backgroundColor: '#0b0b12',
            }}
          >
            {member?.photoUrl ? (
              <Img
                src={member.photoUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 160,
                  fontWeight: 700,
                }}
              >
                {member?.fullName?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: 50,
            fontSize: 76,
            fontWeight: 800,
            letterSpacing: -1,
          }}
        >
          {member?.fullName}
        </div>

        <div
          style={{
            marginTop: 20,
            fontSize: 34,
            fontWeight: 600,
            color: accent,
          }}
        >
          🎂 {formatBirthday(member?.dateOfBirth)}
        </div>
      </AbsoluteFill>

      {/* Scene 3 — Message: 3D flip-in on the X axis, flips away on exit */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 110,
          opacity: s3In * s3Out,
          perspective: 1400,
        }}
      >
        <div
          style={{
            transform: `
              rotateX(${interpolate(s3In, [0, 1], [70, 0]) - s3ExitPunch * 70}deg)
              scale(${interpolate(s3In, [0, 1], [0.8, 1])})
            `,
            transformStyle: 'preserve-3d',
          }}
        >
          <div style={{ fontSize: 340, marginBottom: -300, color: accent }}>
            “
          </div>
          <div
            style={{
              fontSize: 88,
              lineHeight: 1.6,
              fontWeight: 500,
              fontStyle: 'italic',
            }}
          >
            {message}
          </div>
        </div>
      </AbsoluteFill>

      {/* Scene 4 — Logo: elastic pop-in with a settling wobble */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          opacity: s4In * s4Out,
          transform: `
            scale(${interpolate(s4In, [0, 1], [0.1, 1])})
            rotate(${Math.sin(s4In * Math.PI * 2) * (1 - s4In) * 20}deg)
          `,
        }}
      >
        <Img
          src={logoSrc}
          style={{
            width: 220,
            height: 140,
            objectFit: 'contain',
            marginBottom: 36,
          }}
        />
      </AbsoluteFill>

      {/* Flash-cut overlay — a quick white pulse right as each new scene begins */}
      <AbsoluteFill
        style={{
          backgroundColor: '#ffffff',
          opacity: flashOpacity,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
}
