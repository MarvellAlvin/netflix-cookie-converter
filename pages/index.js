import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  // ===== STATE UMUM =====
  const [activeTab, setActiveTab] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // ===== STATE UNTUK CONVERTER =====
  const [cookieInput, setCookieInput] = useState('');

  // ===== STATE UNTUK SAVED COOKIES (Converter & Checker) =====
  const [savedCookies, setSavedCookies] = useState([]);
  const [newCookieName, setNewCookieName] = useState('');

  // ===== STATE UNTUK CHECKER (dengan expiry) =====
  const [checkResults, setCheckResults] = useState({}); // { cookieId: { status: 'valid'|'invalid'|'checking', expiry: '...' } }

  // ===== STATE UNTUK AUTO GENERATE =====
  const [autoGenLoading, setAutoGenLoading] = useState(false);
  const [autoGenResult, setAutoGenResult] = useState(null);
  const [autoGenError, setAutoGenError] = useState('');

  // ===== LOAD DARI LOCALSTORAGE =====
  useEffect(() => {
    const stored = localStorage.getItem('netflix_cookies');
    if (stored) {
      try {
        setSavedCookies(JSON.parse(stored));
      } catch (_) {}
    }
  }, []);

  const updateSavedCookies = (newList) => {
    setSavedCookies(newList);
    localStorage.setItem('netflix_cookies', JSON.stringify(newList));
  };

  // ===== FUNGSI SIMPAN COOKIE =====
  const handleSaveCookie = () => {
    if (!newCookieName.trim()) {
      alert('Berikan nama untuk akun ini');
      return;
    }
    if (!cookieInput.trim() || !cookieInput.includes('NetflixId=')) {
      alert('Cookie tidak valid. Pastikan berisi NetflixId.');
      return;
    }
    if (savedCookies.some(c => c.name.toLowerCase() === newCookieName.trim().toLowerCase())) {
      alert(`Nama "${newCookieName}" sudah digunakan.`);
      return;
    }
    const newEntry = {
      id: Date.now().toString(),
      name: newCookieName.trim(),
      cookie: cookieInput.trim(),
    };
    updateSavedCookies([...savedCookies, newEntry]);
    setNewCookieName('');
    alert(`✅ Cookie "${newCookieName}" berhasil disimpan!`);
  };

  const handleDeleteCookie = (id) => {
    if (confirm('Hapus cookie ini?')) {
      const newList = savedCookies.filter(c => c.id !== id);
      updateSavedCookies(newList);
    }
  };

  // ===== FUNGSI PANGGIL API =====
  const callConvertApi = async (cookieStr) => {
    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookie: cookieStr.trim() }),
      });
      const data = await res.json();
      return { success: res.ok && data.success, data };
    } catch (_) {
      return { success: false, data: null };
    }
  };

  // ===== CONVERTER =====
  const handleConverterSubmit = async (e) => {
    e.preventDefault();
    if (!cookieInput.trim() || !cookieInput.includes('NetflixId=')) {
      setError('Cookie tidak valid. Pastikan berisi NetflixId.');
      return;
    }
    setActiveTab('converter');
    setResult(null);
    setError('');
    setLoading(true);
    const result = await callConvertApi(cookieInput);
    setLoading(false);
    if (result.success) {
      setResult(result.data);
    } else {
      setError(result.data?.error || 'Gagal mengonversi cookie');
    }
  };

  // ===== CHECKER (dengan expiry) =====
  const handleCheckCookie = async (cookieStr, cookieId) => {
    setCheckResults(prev => ({ ...prev, [cookieId]: { status: 'checking', expiry: null } }));
    const result = await callConvertApi(cookieStr);
    if (result.success) {
      setCheckResults(prev => ({
        ...prev,
        [cookieId]: {
          status: 'valid',
          expiry: result.data.expiryHuman || 'Tidak diketahui',
        }
      }));
    } else {
      setCheckResults(prev => ({
        ...prev,
        [cookieId]: {
          status: 'invalid',
          expiry: null,
        }
      }));
    }
  };

  // ===== AUTO GENERATE =====
  const handleAutoGenerate = async () => {
    setAutoGenLoading(true);
    setAutoGenError('');
    setAutoGenResult(null);
    try {
      const res = await fetch('/api/auto-generate');
      const data = await res.json();
      if (res.ok && data.success) {
        setAutoGenResult(data);
      } else {
        setAutoGenError(data.error || 'Gagal menghasilkan link.');
      }
    } catch (_) {
      setAutoGenError('Terjadi kesalahan jaringan.');
    } finally {
      setAutoGenLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`✅ ${label} disalin ke clipboard!`);
  };

  // ===== RENDER =====
  return (
    <>
      <Head>
        <title>NFTOKEN - Netflix Cookie Converter</title>
        <meta name="description" content="Konversi cookie Netflix menjadi link NFToken." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container">
        {/* HEADER */}
        <header>
          <div className="logo">
            <span className="logo-icon">▶</span>
            <span className="logo-text">NFTOKEN</span>
          </div>
          <span className="tagline">AUTO GENERATOR</span>
        </header>

        {/* TABS */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'auto' ? 'active' : ''}`} onClick={() => setActiveTab('auto')}>
            AUTO GENERATE
          </button>
          <button className={`tab ${activeTab === 'converter' ? 'active' : ''}`} onClick={() => setActiveTab('converter')}>
            CONVERTER
          </button>
          <button className={`tab ${activeTab === 'checker' ? 'active' : ''}`} onClick={() => setActiveTab('checker')}>
            CHECKER
          </button>
        </div>

        {/* ============================================ */}
        {/* TAB: AUTO GENERATE (tetap sama) */}
        {/* ============================================ */}
        {activeTab === 'auto' && (
          <div className="tab-content">
            <div className="section-label">⚡ GENERATE LINK INSTAN</div>
            <p className="hint">
              Klik tombol di bawah untuk mendapatkan satu link NFToken dari salah satu akun yang tersedia.
            </p>

            <div className="auto-generate-area">
              <button
                className="btn-generate-auto"
                onClick={handleAutoGenerate}
                disabled={autoGenLoading}
              >
                {autoGenLoading ? '⏳ Memproses...' : '⚡ Generate Link'}
              </button>
              {autoGenError && <div className="error-box">{autoGenError}</div>}
            </div>

            {autoGenResult && (
              <div className="result-box">
                <div className="result-header">
                  <span className="result-badge">✅ SUKSES!</span>
                </div>

                <div className="result-item">
                  <span className="result-label">🔗 URL LOGIN</span>
                  <div className="result-value-wrap">
                    <a href={autoGenResult.url} target="_blank" rel="noopener noreferrer" className="result-link">
                      {autoGenResult.url}
                    </a>
                    <button onClick={() => copyToClipboard(autoGenResult.url, 'Link')} className="copy-btn">📋</button>
                  </div>
                </div>

                <div className="result-item">
                  <span className="result-label">⏰ KADALUARSA</span>
                  <span className="result-value">{autoGenResult.expiry}</span>
                </div>

                {autoGenResult.profile && (
                  <>
                    <div className="result-divider"></div>
                    <div className="profile-grid">
                      <div className="profile-item">
                        <span className="profile-label">🌍 Negara</span>
                        <span className="profile-value">{autoGenResult.profile.country}</span>
                      </div>
                      <div className="profile-item">
                        <span className="profile-label">💰 Mata Uang</span>
                        <span className="profile-value">{autoGenResult.profile.currency}</span>
                      </div>
                      <div className="profile-item">
                        <span className="profile-label">📦 Paket</span>
                        <span className="profile-value">{autoGenResult.profile.plan}</span>
                      </div>
                      <div className="profile-item">
                        <span className="profile-label">📧 Email</span>
                        <span className="profile-value">{autoGenResult.profile.email}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* TAB: CONVERTER (dengan perbaikan tampilan) */}
        {/* ============================================ */}
        {activeTab === 'converter' && (
          <div className="tab-content">
            <div className="section-label">RAW COOKIES</div>
            <div className="char-counter">{cookieInput.length} CHARS</div>

            {savedCookies.length > 0 && (
              <div className="saved-section">
                <div className="saved-list">
                  {savedCookies.map((item) => (
                    <div key={item.id} className="saved-item">
                      <span className="saved-name" onClick={() => setCookieInput(item.cookie)}>
                        {item.name}
                      </span>
                      <button onClick={() => setCookieInput(item.cookie)} className="btn-use" title="Gunakan">📋</button>
                      <button onClick={() => handleDeleteCookie(item.id)} className="btn-delete" title="Hapus">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleConverterSubmit}>
              <textarea
                rows={6}
                placeholder="Paste cookie disini. Support 3 format:&#10;1. JSON Array: [{'name':'NetflixId','value':'xxx'}]&#10;2. JSON Object: {'NetflixId':'yyy'}&#10;3. String: NetflixId=xxx; SecureNetflixId=yyy"
                value={cookieInput}
                onChange={(e) => setCookieInput(e.target.value)}
                disabled={loading}
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
              />

              <div className="form-actions">
                <div className="save-section">
                  <input
                    type="text"
                    placeholder="Nama akun (contoh: Akun Pribadi)"
                    value={newCookieName}
                    onChange={(e) => setNewCookieName(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={handleSaveCookie}
                    disabled={loading || !cookieInput.trim() || !newCookieName.trim()}
                    className="btn-save"
                  >
                    💾 Simpan
                  </button>
                </div>
                <button type="submit" disabled={loading || !cookieInput.trim()} className="btn-forge">
                  {loading ? '⏳ MEMPROSES...' : '⚡ FORGE TOKEN'}
                </button>
              </div>
            </form>

            {error && <div className="error-box"><strong>❌ Error:</strong> {error}</div>}

            {/* Hasil Converter dengan tampilan lebih jelas */}
            {result && (
              <div className="result-box converter-result">
                <div className="result-header">
                  <span className="result-badge">✅ SUKSES!</span>
                </div>

                <div className="result-item">
                  <span className="result-label">🔗 URL LOGIN</span>
                  <div className="result-value-wrap">
                    <a href={result.url} target="_blank" rel="noopener noreferrer" className="result-link">
                      {result.url}
                    </a>
                    <button onClick={() => copyToClipboard(result.url, 'Link')} className="copy-btn">📋</button>
                  </div>
                </div>

                <div className="result-item">
                  <span className="result-label">⏰ KADALUARSA</span>
                  <span className="result-value">{result.expiryHuman}</span>
                </div>

                <div className="result-item">
                  <span className="result-label">🔑 TOKEN</span>
                  <div className="result-value-wrap">
                    <code className="result-token">{result.token}</code>
                    <button onClick={() => copyToClipboard(result.token, 'Token')} className="copy-btn">📋</button>
                  </div>
                </div>

                {result.profile && (
                  <>
                    <div className="result-divider"></div>
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
          </div>
        )}

        {/* ============================================ */}
        {/* TAB: CHECKER (dengan expiry) */}
        {/* ============================================ */}
        {activeTab === 'checker' && (
          <div className="tab-content">
            <div className="section-label">🔍 CEK VALIDITAS COOKIE</div>
            {savedCookies.length === 0 ? (
              <p className="empty-msg">Belum ada cookie tersimpan. Gunakan tab CONVERTER untuk menambahkan.</p>
            ) : (
              <div className="cookie-grid">
                {savedCookies.map((item) => {
                  const check = checkResults[item.id];
                  let statusLabel = '';
                  let statusColor = '';
                  let expiryLabel = '–';
                  if (!check) {
                    statusLabel = '⏹️ Belum dicek';
                    statusColor = '#6b7280';
                  } else if (check.status === 'checking') {
                    statusLabel = '⏳ Checking...';
                    statusColor = '#f59e0b';
                  } else if (check.status === 'valid') {
                    statusLabel = '✅ Valid';
                    statusColor = '#10b981';
                    expiryLabel = check.expiry || 'Tidak diketahui';
                  } else {
                    statusLabel = '❌ Invalid';
                    statusColor = '#ef4444';
                  }

                  return (
                    <div key={item.id} className="cookie-card checker-card">
                      <div className="cookie-card-info">
                        <div className="cookie-card-name">{item.name}</div>
                        <div className="cookie-card-expiry" style={{ color: '#6b7280', fontSize: '12px' }}>
                          {check && check.status === 'valid' ? `Exp: ${expiryLabel}` : expiryLabel}
                        </div>
                      </div>
                      <div className="cookie-card-status" style={{ color: statusColor }}>{statusLabel}</div>
                      <div className="cookie-card-actions">
                        <button
                          className="btn-check"
                          onClick={() => handleCheckCookie(item.cookie, item.id)}
                          disabled={check?.status === 'checking'}
                        >
                          {check?.status === 'checking' ? '⏳' : '🔍 Check'}
                        </button>
                        <button className="btn-delete-sm" onClick={() => handleDeleteCookie(item.id)}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <footer>
          <p>© 2026 NFTOKEN</p>
        </footer>
      </div>

      {/* ===== STYLES (diperbarui untuk kontras dan kerapian) ===== */}
      <style jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #0a0a0f;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #eaeef2;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        .container {
          max-width: 720px;
          width: 100%;
          background: rgba(18, 18, 30, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 28px;
          padding: 32px 28px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7);
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .logo { display: flex; align-items: center; gap: 10px; }
        .logo-icon { font-size: 22px; color: #e50914; font-weight: 700; }
        .logo-text {
          font-size: 20px; font-weight: 700; letter-spacing: 1px;
          background: linear-gradient(135deg, #e50914, #f5a623);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .tagline {
          font-size: 11px; font-weight: 600; color: #6b7280;
          letter-spacing: 2px; text-transform: uppercase;
          background: rgba(255,255,255,0.04);
          padding: 4px 12px; border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.04);
        }
        .tabs {
          display: flex; gap: 4px;
          background: rgba(255,255,255,0.04);
          border-radius: 14px; padding: 4px;
          margin-bottom: 28px;
          border: 1px solid rgba(255,255,255,0.04);
        }
        .tab {
          flex: 1; padding: 10px 12px; border: none;
          border-radius: 11px; background: transparent;
          color: #6b7280; font-size: 12px; font-weight: 600;
          letter-spacing: 0.5px; cursor: pointer;
          transition: all 0.25s ease; text-transform: uppercase;
        }
        .tab:hover { color: #eaeef2; }
        .tab.active {
          background: #e50914; color: #fff;
          box-shadow: 0 4px 16px rgba(229,9,20,0.3);
        }
        .tab-content { display: flex; flex-direction: column; gap: 16px; }
        .section-label {
          font-size: 12px; font-weight: 700; color: #6b7280;
          letter-spacing: 1.5px; text-transform: uppercase;
        }
        .hint {
          font-size: 13px; color: #6b7280; margin-top: -6px;
        }
        .char-counter {
          font-size: 12px; color: #4b5563; text-align: right;
          margin-top: -8px; font-family: monospace;
        }
        .empty-msg {
          color: #6b7280; font-size: 14px; text-align: center;
          padding: 20px 0;
        }

        /* ===== AUTO GENERATE ===== */
        .auto-generate-area {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
          padding: 20px 0;
        }
        .btn-generate-auto {
          padding: 16px 48px;
          border: none;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          background: linear-gradient(135deg, #e50914, #b20710);
          color: #fff;
          box-shadow: 0 6px 24px rgba(229,9,20,0.3);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .btn-generate-auto:hover:not(:disabled) {
          transform: scale(1.03);
          box-shadow: 0 8px 32px rgba(229,9,20,0.45);
        }
        .btn-generate-auto:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* ===== CONVERTER ===== */
        textarea {
          width: 100%;
          padding: 16px 18px;
          font-size: 13px;
          font-family: 'SF Mono', 'Fira Code', monospace;
          border: 1.5px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          background: rgba(255,255,255,0.04);
          color: #eaeef2;
          resize: vertical;
          transition: border-color 0.2s, box-shadow 0.2s;
          min-height: 140px;
          line-height: 1.7;
          white-space: pre-wrap;
          word-break: break-all;
        }
        textarea::placeholder { color: #4b5563; }
        textarea:focus {
          outline: none;
          border-color: #e50914;
          box-shadow: 0 0 0 4px rgba(229,9,20,0.08);
        }
        textarea:disabled { opacity: 0.5; cursor: not-allowed; }

        .form-actions { display: flex; flex-direction: column; gap: 10px; }
        .save-section { display: flex; gap: 10px; }
        .save-section input {
          flex: 1;
          padding: 10px 14px;
          font-size: 13px;
          border: 1.5px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          color: #eaeef2;
          transition: border-color 0.2s;
        }
        .save-section input::placeholder { color: #4b5563; }
        .save-section input:focus {
          outline: none;
          border-color: #e50914;
          box-shadow: 0 0 0 3px rgba(229,9,20,0.06);
        }
        .btn-save {
          padding: 10px 18px;
          font-size: 13px; font-weight: 600;
          border: none; border-radius: 12px;
          background: rgba(255,255,255,0.06);
          color: #eaeef2;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .btn-save:hover:not(:disabled) { background: rgba(255,255,255,0.12); }
        .btn-save:disabled { opacity: 0.3; cursor: not-allowed; }

        .btn-forge {
          width: 100%;
          padding: 16px 20px;
          font-size: 16px; font-weight: 700;
          border: none; border-radius: 14px;
          background: linear-gradient(135deg, #e50914, #b20710);
          color: #fff;
          cursor: pointer;
          transition: all 0.25s ease;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          box-shadow: 0 6px 24px rgba(229,9,20,0.25);
        }
        .btn-forge:hover:not(:disabled) {
          transform: scale(1.01);
          box-shadow: 0 8px 32px rgba(229,9,20,0.35);
        }
        .btn-forge:disabled {
          opacity: 0.4; cursor: not-allowed;
          transform: none; box-shadow: none;
        }

        /* ===== RESULT BOX (Converter & Auto) ===== */
        .result-box {
          padding: 20px 22px;
          background: rgba(16,185,129,0.06);
          border-radius: 16px;
          border: 1px solid rgba(16,185,129,0.15);
          animation: fadeUp 0.4s ease;
        }
        .converter-result {
          background: rgba(16,185,129,0.05);
          border-color: rgba(16,185,129,0.12);
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .result-header { margin-bottom: 16px; }
        .result-badge {
          font-size: 18px; font-weight: 700; color: #10b981;
        }
        .result-item {
          display: flex; flex-direction: column; gap: 4px;
          margin-bottom: 14px;
        }
        .result-label {
          font-size: 11px; font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .result-value {
          font-size: 14px;
          word-break: break-all;
          color: #eaeef2;
        }
        .result-value-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .result-link {
          color: #f87171;
          text-decoration: none;
          font-weight: 500;
          word-break: break-all;
          font-size: 14px;
        }
        .result-link:hover { text-decoration: underline; }
        .result-token {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 12px;
          background: rgba(255,255,255,0.04);
          padding: 6px 10px;
          border-radius: 8px;
          word-break: break-all;
          flex: 1; min-width: 0;
          color: #eaeef2;
        }
        .copy-btn {
          background: rgba(255,255,255,0.04);
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 8px;
          transition: background 0.15s;
          flex-shrink: 0;
          color: #eaeef2;
        }
        .copy-btn:hover { background: rgba(255,255,255,0.1); }
        .result-divider {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.04);
          margin: 16px 0 14px;
        }

        /* ===== PROFILE GRID ===== */
        .profile-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
        }
        .profile-item {
          background: rgba(255,255,255,0.03);
          padding: 10px 12px;
          border-radius: 10px;
          display: flex; flex-direction: column; gap: 2px;
          border: 1px solid rgba(255,255,255,0.03);
        }
        .profile-label {
          font-size: 10px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.3px; color: #6b7280;
        }
        .profile-value {
          font-size: 14px; font-weight: 500; color: #eaeef2;
        }

        /* ===== CHECKER ===== */
        .cookie-grid {
          display: flex; flex-direction: column; gap: 10px;
        }
        .cookie-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.03);
          padding: 12px 16px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.04);
          flex-wrap: wrap;
          gap: 8px;
        }
        .cookie-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(229,9,20,0.2);
        }
        .cookie-card-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 120px;
        }
        .cookie-card-name {
          font-size: 14px;
          font-weight: 500;
          color: #eaeef2;
        }
        .cookie-card-expiry {
          font-size: 12px;
          color: #6b7280;
        }
        .cookie-card-status {
          font-size: 13px;
          font-weight: 600;
          min-width: 100px;
          text-align: center;
        }
        .cookie-card-actions {
          display: flex; gap: 8px; align-items: center;
        }
        .btn-check {
          padding: 6px 14px;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          background: #e50914;
          color: #fff;
        }
        .btn-check:hover:not(:disabled) {
          background: #b20710;
          transform: scale(1.02);
        }
        .btn-check:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .checker-card { cursor: default; }
        .btn-delete-sm {
          background: transparent;
          border: none;
          color: #6b7280;
          font-size: 14px;
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 6px;
          transition: all 0.15s;
        }
        .btn-delete-sm:hover {
          color: #e50914;
          background: rgba(229,9,20,0.1);
        }

        /* ===== SAVED SECTION (Converter) ===== */
        .saved-section {
          background: rgba(255,255,255,0.03);
          border-radius: 12px; padding: 12px 14px;
          border: 1px solid rgba(255,255,255,0.04);
        }
        .saved-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .saved-item {
          display: flex; align-items: center; gap: 4px;
          background: rgba(229,9,20,0.08);
          padding: 4px 8px 4px 12px;
          border-radius: 16px;
          border: 1px solid rgba(229,9,20,0.12);
        }
        .saved-item:hover { background: rgba(229,9,20,0.16); }
        .saved-name {
          font-size: 12px; font-weight: 500; cursor: pointer;
          color: #eaeef2;
        }
        .saved-name:hover { color: #e50914; }
        .saved-item button {
          background: transparent; border: none; cursor: pointer;
          font-size: 12px; padding: 2px 4px; border-radius: 4px;
          color: #6b7280; transition: all 0.15s;
        }
        .saved-item button:hover { color: #eaeef2; }
        .btn-delete:hover { color: #e50914 !important; }

        /* ===== ERROR ===== */
        .error-box {
          padding: 14px 18px;
          background: rgba(229,9,20,0.1);
          border-left: 4px solid #e50914;
          border-radius: 12px;
          color: #f87171;
          font-size: 14px;
          word-break: break-word;
        }

        footer {
          margin-top: 28px; padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.04);
          text-align: center;
        }
        footer p { font-size: 12px; color: #4b5563; letter-spacing: 1px; }

        @media (max-width: 600px) {
          .container { padding: 20px 16px; border-radius: 20px; }
          header { flex-direction: column; align-items: flex-start; gap: 8px; }
          .tagline { font-size: 10px; }
          .tabs { flex-wrap: wrap; }
          .tab { font-size: 10px; padding: 8px 10px; flex: 1; min-width: 60px; text-align: center; }
          .profile-grid { grid-template-columns: 1fr; }
          .save-section { flex-direction: column; }
          .btn-save { width: 100%; justify-content: center; }
          .cookie-card { flex-direction: column; align-items: flex-start; }
          .cookie-card-status { min-width: auto; text-align: left; }
          .btn-generate-auto { width: 100%; padding: 14px 24px; font-size: 16px; }
        }
        @media (max-width: 400px) {
          .container { padding: 14px 10px; }
          textarea { font-size: 12px; padding: 12px 14px; min-height: 100px; }
          .btn-forge { font-size: 14px; padding: 14px 16px; }
          .result-token { font-size: 11px; }
        }
      `}</style>
    </>
  );
}

// ===== KOMPONEN RESULT DISPLAY (tidak digunakan lagi karena sudah inline di Converter) =====
// (Saya hapus karena hasil Converter sekarang sudah di-render langsung di dalam tab)
