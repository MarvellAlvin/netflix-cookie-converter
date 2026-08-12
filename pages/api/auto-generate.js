import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Baca file cookies.json
    const filePath = path.join(process.cwd(), 'data', 'cookies.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const cookies = JSON.parse(fileContent);

    if (!Array.isArray(cookies) || cookies.length === 0) {
      return res.status(404).json({ error: 'Tidak ada cookie tersedia.' });
    }

    // 2. Acak urutan cookie
    const shuffled = [...cookies].sort(() => Math.random() - 0.5);

    // 3. Coba satu per satu hingga berhasil
    for (const cookieStr of shuffled) {
      try {
        // Panggil API konversi internal (fungsi yang sama dengan /api/convert)
        const result = await convertCookie(cookieStr);
        if (result.success) {
          // Jika berhasil, kirim hasil (tanpa cookie)
          return res.status(200).json({
            success: true,
            token: result.data.token,
            url: result.data.url,
            expiry: result.data.expiryHuman,
            profile: result.data.profile,
          });
        }
      } catch (_) {
        // Gagal, lanjut ke cookie berikutnya
        continue;
      }
    }

    // Jika semua cookie gagal
    return res.status(404).json({ error: 'Tidak ada cookie yang aktif/valid.' });
  } catch (error) {
    return res.status(500).json({ error: 'Gagal membaca file cookies.json', detail: error.message });
  }
}

// ===== Fungsi konversi (copied dari /api/convert) =====
async function convertCookie(cookieStr) {
  const API_URL = 'https://ios.prod.ftl.netflix.com/iosui/user/15.48';
  const QUERY_PARAMS = {
    appVersion: '15.48.1',
    config: '{"gamesInTrailersEnabled":"false","isTrailersEvidenceEnabled":"false","cdsMyListSortEnabled":"true","kidsBillboardEnabled":"true","addHorizontalBoxArtToVideoSummariesEnabled":"false","skOverlayTestEnabled":"false","homeFeedTestTVMovieListsEnabled":"false","baselineOnIpadEnabled":"true","trailersVideoIdLoggingFixEnabled":"true","postPlayPreviewsEnabled":"false","bypassContextualAssetsEnabled":"false","roarEnabled":"false","useSeason1AltLabelEnabled":"false","disableCDSSearchPaginationSectionKinds":["searchVideoCarousel"],"cdsSearchHorizontalPaginationEnabled":"true","searchPreQueryGamesEnabled":"true","kidsMyListEnabled":"true","billboardEnabled":"true","useCDSGalleryEnabled":"true","contentWarningEnabled":"true","videosInPopularGamesEnabled":"true","avifFormatEnabled":"false","sharksEnabled":"true"}',
    device_type: 'NFAPPL-02-',
    esn: 'NFAPPL-02-IPHONE8%3D1-PXA-02026U9VV5O8AUKEAEO8PUJETCGDD4PQRI9DEB3MDLEMD0EACM4CS78LMD334MN3MQ3NMJ8SU9O9MVGS6BJCURM1PH1MUTGDPF4S4200',
    idiom: 'phone',
    iosVersion: '15.8.5',
    isTablet: 'false',
    languages: 'en-US',
    locale: 'en-US',
    maxDeviceWidth: '375',
    model: 'saget',
    modelType: 'IPHONE8-1',
    odpAware: 'true',
    path: '["account","token","default"]',
    pathFormat: 'graph',
    pixelDensity: '2.0',
    progressive: 'false',
    responseFormat: 'json',
  };

  const BASE_HEADERS = {
    'User-Agent': 'Argo/15.48.1 (iPhone; iOS 15.8.5; Scale/2.00)',
    'x-netflix.request.attempt': '1',
    'x-netflix.request.client.user.guid': 'A4CS633D7VCBPE2GPK2HL4EKOE',
    'x-netflix.context.profile-guid': 'A4CS633D7VCBPE2GPK2HL4EKOE',
    'x-netflix.request.routing': '{"path":"/nq/mobile/nqios/~15.48.0/user","control_tag":"iosui_argo"}',
    'x-netflix.context.app-version': '15.48.1',
    'x-netflix.argo.translated': 'true',
    'x-netflix.context.form-factor': 'phone',
    'x-netflix.context.sdk-version': '2012.4',
    'x-netflix.client.appversion': '15.48.1',
    'x-netflix.context.max-device-width': '375',
    'x-netflix.context.ab-tests': '',
    'x-netflix.tracing.cl.useractionid': '4DC655F2-9C3C-4343-8229-CA1B003C3053',
    'x-netflix.client.type': 'argo',
    'x-netflix.client.ftl.esn': 'NFAPPL-02-IPHONE8=1-PXA-02026U9VV5O8AUKEAEO8PUJETCGDD4PQRI9DEB3MDLEMD0EACM4CS78LMD334MN3MQ3NMJ8SU9O9MVGS6BJCURM1PH1MUTGDPF4S4200',
    'x-netflix.context.locales': 'en-US',
    'x-netflix.context.top-level-uuid': '90AFE39F-ADF1-4D8A-B33E-528730990FE3',
    'x-netflix.client.iosversion': '15.8.5',
    'accept-language': 'en-US;q=1',
    'x-netflix.argo.abtests': '',
    'x-netflix.context.os-version': '15.8.5',
    'x-netflix.request.client.context': '{"appState":"foreground"}',
    'x-netflix.context.ui-flavor': 'argo',
    'x-netflix.argo.nfnsm': '9',
    'x-netflix.context.pixel-density': '2.0',
    'x-netflix.request.toplevel.uuid': '90AFE39F-ADF1-4D8A-B33E-528730990FE3',
    'x-netflix.request.client.timezoneid': 'Asia/Dhaka',
  };

  const url = new URL(API_URL);
  Object.entries(QUERY_PARAMS).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const headers = {
    ...BASE_HEADERS,
    Cookie: cookieStr.trim(),
  };

  const response = await fetch(url.toString(), { method: 'GET', headers });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  const tokenData = data?.value?.account?.token?.default || {};
  const token = tokenData.token;
  const expires = tokenData.expires;

  if (!token) {
    throw new Error('Token tidak ditemukan');
  }

  let expiryDate = null;
  if (expires) {
    if (typeof expires === 'number' && expires.toString().length === 13) {
      expiryDate = new Date(expires);
    } else if (typeof expires === 'number') {
      expiryDate = new Date(expires * 1000);
    } else {
      expiryDate = new Date(expires);
    }
  }

  // Ambil info profil (opsional)
  let profileInfo = null;
  try {
    const profileUrl = new URL('https://ios.prod.ftl.netflix.com/iosui/profiles/current');
    profileUrl.searchParams.append('appVersion', '15.48.1');
    profileUrl.searchParams.append('esn', QUERY_PARAMS.esn);
    profileUrl.searchParams.append('model', 'saget');
    profileUrl.searchParams.append('modelType', 'IPHONE8-1');
    profileUrl.searchParams.append('device_type', 'NFAPPL-02-');
    profileUrl.searchParams.append('iosVersion', '15.8.5');

    const profileHeaders = { ...BASE_HEADERS, Cookie: cookieStr.trim() };
    const profileRes = await fetch(profileUrl.toString(), { method: 'GET', headers: profileHeaders });
    if (profileRes.ok) {
      const profileData = await profileRes.json();
      const account = profileData?.value?.account;
      if (account) {
        profileInfo = {
          country: account.country || 'Tidak diketahui',
          currency: account.currency || 'Tidak diketahui',
          plan: account.plan || 'Tidak diketahui',
          email: account.email || 'Tidak diketahui',
        };
      }
    }
  } catch (_) {}

  return {
    success: true,
    data: {
      token,
      url: `https://netflix.com/?nftoken=${token}`,
      expiryHuman: expiryDate ? expiryDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : 'Tidak diketahui',
      profile: profileInfo,
    },
  };
}
