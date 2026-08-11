import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [cookieInput, setCookieInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookie: cookieInput.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data);
      } else {
        setError(data.error || data.message || 'Gagal mengonversi cookie');
        if (data.debug) console.log('Debug:', data.debug);
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan atau server');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`✅ ${label} disalin ke clipboard!`);
  };

  return (
    <>
      <Head>
        <title>Netflix Cookie → NFToken Converter</title>
        <meta name="description" content="Konversi cookie Netflix menjadi link NFToken dengan cepat dan mudah." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container">
        <header>
          <h1>🍪 Netflix Cookie → NFToken</h1>
          <p className="subtitle">
            Tempelkan cookie Netflix Anda untuk mendapatkan link akses instan.
            <br />
            <span className="hint">Format: <code>NetflixId=...; SecureNetflixId=...; ...</code></span>
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <textarea
            rows={5}
            placeholder="Tempel cookie di sini..."
            value={cookieInput}
            onChange={(e) => setCookieInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !cookieInput.trim()}>
            {loading ? '⏳ Memproses...' : '🚀 Convert ke NFToken'}
          </button>
        </form>

        {error && (
          <div className="error-box">
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="result-box">
            <h2>✅ Sukses!</h2>

            <div className="info-row">
              <span className="label">🔗 URL Login</span>
              <div className="value-with-copy">
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="link">
                  {result.url}
                </a>
                <button onClick={() => copyToClipboard(result.url, 'Link')} className="copy-btn">
                  📋
                </button>
              </div>
            </div>

            <div className="info-row">
              <span className="label">⏰ Kadaluarsa</span>
              <span className="value">{result.expiryHuman}</span>
            </div>

            <div className="info-row">
              <span className="label">🔑 Token</span>
              <div className="value-with-copy">
                <code className="token">{result.token}</code>
                <button onClick={() => copyToClipboard(result.token, 'Token')} className="copy-btn">
                  📋
                </button>
              </div>
            </div>

            {result.profile && (
              <>
                <hr className="divider" />
                <h3>👤 Informasi Akun</h3>
                <div className="profile-grid">
                  <div className="profile-item">
                    <span className="profile-label">🌍 Negara</span>
                    <span className="profile-value">{result.profile.country}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">💰 Mata Uang</span>
                    <span className="profile-value">{result.profile.currency}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">📦 Paket</span>
                    <span className="profile-value">{result.profile.plan}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">📧 Email</span>
                    <span className="profile-value">{result.profile.email}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <footer>
          <p>
            ⚠️ Gunakan hanya untuk akun Anda sendiri. Melanggar ketentuan Netflix.
            <br />
            Dibuat dengan ❤️ untuk keperluan edukasi.
          </p>
        </footer>
      </div>

      <style jsx>{`
        /* ===== GLOBAL STYLES ===== */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          background: #f7f9fc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #1a1a2e;
          padding: 20px;
          line-height: 1.6;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .container {
          max-width: 720px;
          width: 100%;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 32px;
          padding: 36px 28px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.5);
          transition: all 0.2s ease;
        }

        @media (prefers-color-scheme: dark) {
          body {
            background: #0f0f1a;
          }
          .container {
            background: rgba(26, 26, 46, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-color: rgba(255, 255, 255, 0.08);
            color: #eaeef2;
          }
        }

        /* ===== HEADER ===== */
        header {
          margin-bottom: 28px;
        }

        h1 {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #e50914, #b20710);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: inline-block;
          margin-bottom: 6px;
        }

        .subtitle {
          color: #6b7280;
          font-size: 15px;
          margin-top: 4px;
        }

        .hint {
          font-size: 13px;
          color: #9ca3af;
        }

        code {
          background: rgba(0, 0, 0, 0.06);
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 13px;
          word-break: break-all;
        }

        @media (prefers-color-scheme: dark) {
          .subtitle { color: #b0b8c5; }
          .hint { color: #7a8290; }
          code { background: rgba(255,255,255,0.08); }
        }

        /* ===== FORM ===== */
        form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        textarea {
          width: 100%;
          padding: 16px 18px;
          font-size: 14px;
          font-family: 'SF Mono', 'Fira Code', monospace;
          border: 1.5px solid #e5e7eb;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          transition: border-color 0.2s, box-shadow 0.2s;
          resize: vertical;
          color: #1a1a2e;
        }

        textarea:focus {
          outline: none;
          border-color: #e50914;
          box-shadow: 0 0 0 4px rgba(229, 9, 20, 0.12);
        }

        textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (prefers-color-scheme: dark) {
          textarea {
            background: rgba(30, 30, 50, 0.7);
            border-color: #2d2d44;
            color: #eaeef2;
          }
          textarea:focus {
            border-color: #e50914;
            box-shadow: 0 0 0 4px rgba(229, 9, 20, 0.2);
          }
        }

        button[type="submit"] {
          padding: 14px 20px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 16px;
          background: #e50914;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(229, 9, 20, 0.25);
        }

        button[type="submit"]:hover:not(:disabled) {
          background: #b20710;
          transform: scale(1.01);
          box-shadow: 0 6px 20px rgba(229, 9, 20, 0.35);
        }

        button[type="submit"]:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* ===== ERROR BOX ===== */
        .error-box {
          padding: 16px 20px;
          background: rgba(229, 9, 20, 0.08);
          border-left: 4px solid #e50914;
          border-radius: 12px;
          color: #b20710;
          margin-bottom: 20px;
          font-size: 14px;
          word-break: break-word;
        }

        @media (prefers-color-scheme: dark) {
          .error-box {
            background: rgba(229, 9, 20, 0.15);
            color: #f87171;
          }
        }

        /* ===== RESULT BOX ===== */
        .result-box {
          margin-top: 8px;
          padding: 24px 20px;
          background: rgba(16, 185, 129, 0.06);
          border-radius: 20px;
          border: 1px solid rgba(16, 185, 129, 0.15);
          animation: fadeUp 0.4s ease;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .result-box h2 {
          font-size: 22px;
          font-weight: 700;
          color: #10b981;
          margin-bottom: 20px;
        }

        .info-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 16px;
        }

        .label {
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .value {
          font-size: 15px;
          word-break: break-all;
        }

        .value-with-copy {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .link {
          color: #e50914;
          text-decoration: none;
          font-weight: 500;
          word-break: break-all;
          font-size: 15px;
        }

        .link:hover {
          text-decoration: underline;
        }

        .token {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 13px;
          background: rgba(0,0,0,0.04);
          padding: 6px 10px;
          border-radius: 8px;
          word-break: break-all;
          flex: 1;
          min-width: 0;
        }

        @media (prefers-color-scheme: dark) {
          .label { color: #9ca3af; }
          .token { background: rgba(255,255,255,0.06); }
        }

        .copy-btn {
          background: transparent;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 8px;
          transition: background 0.15s;
          flex-shrink: 0;
        }

        .copy-btn:hover {
          background: rgba(0,0,0,0.06);
        }

        @media (prefers-color-scheme: dark) {
          .copy-btn:hover {
            background: rgba(255,255,255,0.08);
          }
        }

        .divider {
          border: none;
          border-top: 1.5px solid rgba(0,0,0,0.06);
          margin: 20px 0 16px;
        }

        @media (prefers-color-scheme: dark) {
          .divider {
            border-top-color: rgba(255,255,255,0.06);
          }
        }

        .result-box h3 {
          font-size: 17px;
          font-weight: 600;
          margin-bottom: 14px;
          color: #1a1a2e;
        }

        @media (prefers-color-scheme: dark) {
          .result-box h3 { color: #eaeef2; }
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .profile-item {
          background: rgba(255,255,255,0.4);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          padding: 12px 14px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        @media (prefers-color-scheme: dark) {
          .profile-item {
            background: rgba(255,255,255,0.04);
          }
        }

        .profile-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          color: #6b7280;
        }

        .profile-value {
          font-size: 14px;
          font-weight: 500;
          color: #1a1a2e;
        }

        @media (prefers-color-scheme: dark) {
          .profile-label { color: #9ca3af; }
          .profile-value { color: #eaeef2; }
        }

        /* ===== FOOTER ===== */
        footer {
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid rgba(0,0,0,0.04);
          text-align: center;
          font-size: 13px;
          color: #9ca3af;
        }

        @media (prefers-color-scheme: dark) {
          footer {
            border-top-color: rgba(255,255,255,0.04);
            color: #6b7280;
          }
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 600px) {
          .container {
            padding: 24px 16px;
            border-radius: 24px;
          }
          h1 {
            font-size: 24px;
          }
          .profile-grid {
            grid-template-columns: 1fr;
          }
          .info-row {
            flex-direction: column;
          }
          .value-with-copy {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 400px) {
          .container {
            padding: 16px 12px;
          }
          textarea {
            font-size: 13px;
            padding: 12px 14px;
          }
          button[type="submit"] {
            font-size: 14px;
            padding: 12px 16px;
          }
        }
      `}</style>
    </>
  );
}
