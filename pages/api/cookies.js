import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'cookies.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const cookies = JSON.parse(fileContent);

    if (!Array.isArray(cookies) || cookies.length === 0) {
      return res.status(200).json({ cookies: [], message: 'Belum ada cookie di daftar.' });
    }

    return res.status(200).json({ cookies });
  } catch (error) {
    return res.status(500).json({ error: 'Gagal membaca file cookies.json', detail: error.message });
  }
}
