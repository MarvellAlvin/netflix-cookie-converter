 import { useState } from 'react';

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

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h1>🍪 Netflix Cookie → NFToken Converter</h1>
      <p style={{ color: '#555' }}>
        Tempelkan string cookie Netflix Anda di bawah ini untuk mendapatkan link NFToken.
        Cookie biasanya berupa teks panjang seperti <code>NetflixId=...; SecureNetflixId=...; ...</code>
      </p>
      <form onSubmit={handleSubmit}>
        <textarea
          rows={6}
          style={{ width: '100%', padding: 10, fontSize: 14, border: '1px solid #ccc', borderRadius: 4 }}
          placeholder="Tempel cookie di sini..."
          value={cookieInput}
          onChange={(e) => setCookieInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !cookieInput.trim()}
          style={{
            marginTop: 10,
            padding: '10px 20px',
            background: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          {loading ? 'Memproses...' : 'Convert ke NFToken'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: 20, padding: 15, background: '#fdd', border: '1px solid #f99', borderRadius: 4 }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 20, padding: 15, background: '#dfd', border: '1px solid #9c9', borderRadius: 4 }}>
          <h3>✅ Sukses!</h3>
          <p>
            <strong>🔗 URL Login:</strong>{' '}
            <a href={result.url} target="_blank" rel="noopener noreferrer">
              {result.url}
            </a>
          </p>
          <p><strong>⏰ Kadaluarsa:</strong> {result.expiryHuman}</p>
          <p>
            <strong>Token:</strong> <code style={{ wordBreak: 'break-all' }}>{result.token}</code>
          </p>
        </div>
      )}

      <hr style={{ margin: '30px 0' }} />
      <footer style={{ fontSize: 12, color: '#888' }}>
        ⚠️ Gunakan hanya untuk akun Anda sendiri. Melanggar ketentuan Netflix.<br />
        Dibuat dengan ❤️ untuk keperluan edukasi.
      </footer>
    </div>
  );
}
