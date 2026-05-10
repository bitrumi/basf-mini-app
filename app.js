require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto'); // для подписи Cryptomus
const { createPayInstance, Asset } = require('@dotred/crypto-pay'); // <── Crypto Pay [web:129]

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
const CRYPTOMUS_MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID;
const CRYPTOMUS_API_KEY = process.env.CRYPTOMUS_API_KEY;
const DISCOGS_USER_TOKEN = process.env.DISCOGS_USER_TOKEN;
const DISCOGS_USER_AGENT =
  process.env.DISCOGS_USER_AGENT || 'audiograde/1.0';

// ==== Crypto Pay API (Crypto Bot) ====
const CRYPTO_PAY_API_TOKEN = process.env.CRYPTO_PAY_API_TOKEN;
const CRYPTO_PAY_ENV = process.env.CRYPTO_PAY_ENV || 'main';

// Инициализация клиента Crypto Pay [web:129]
const cryptoPay =
  CRYPTO_PAY_API_TOKEN &&
  createPayInstance(CRYPTO_PAY_API_TOKEN, CRYPTO_PAY_ENV);

// Простая in‑memory «таблица» userId -> { invoiceId, status }
const invoicesByUser = new Map();

// Базовая "цена Near Mint" (локальный фолбэк)
const BASE_PRICE_NEAR_MINT = 5000; // ₽

// Градации с коэффициентами к цене NM и базовыми описаниями (локальный фолбэк)
const GRADES = {
  M: {
    name: 'Mint / Still Sealed',
    priceFactorMin: 1.0,
    priceFactorMax: 1.2,
    description:
      'Кассета в запечатанном или практически идеальном состоянии. Плёнка не проигрывалась, корпус и вкладыш без видимых дефектов.',
  },
  NM: {
    name: 'Near Mint',
    priceFactorMin: 0.85,
    priceFactorMax: 1.0,
    description:
      'Очень аккуратно обращались. Минимальные следы использования на корпусе, чистые наклейки, вкладыш без серьёзных заломов или пятен.',
  },
  'VG+': {
    name: 'Very Good Plus',
    priceFactorMin: 0.6,
    priceFactorMax: 0.8,
    description:
      'Корпус с лёгкими потёртостями, возможны мелкие царапины. Наклейки и вкладыш целые и читаемые, небольшие следы времени, звук в целом чистый.',
  },
  VG: {
    name: 'Very Good',
    priceFactorMin: 0.4,
    priceFactorMax: 0.6,
    description:
      'Заметные следы использования: потёртости корпуса, заломы вкладыша, возможны надписи. Звук с фоном и небольшими артефактами, но слушать можно.',
  },
  G: {
    name: 'Good / G+',
    priceFactorMin: 0.2,
    priceFactorMax: 0.35,
    description:
      'Состояние скорее «рабочее, но уставшее»: трещины/сколы корпуса, заметные дефекты вкладыша, шумы и возможные провалы по звуку.',
  },
};

// Маппинг типа носителя к формату Discogs
const MEDIA_TYPE_TO_DISCOGS_FORMAT = {
  cassette: 'Cassette',
  cd: 'CD',
  vinyl: 'Vinyl',
};

// In-memory кэш для Avito
const avitoCache = {};
const AVITO_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

// Служебка: случайный элемент массива
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Случайное число в диапазоне
function randomInRange(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10;
}

// Расчёт ценовой оценки по grade (локальный фолбэк)
function makePriceEstimate(gradeCode) {
  const gradeInfo = GRADES[gradeCode] || GRADES['VG'];
  const factor = randomInRange(
    gradeInfo.priceFactorMin,
    gradeInfo.priceFactorMax,
  );
  const priceApprox = Math.round(BASE_PRICE_NEAR_MINT * factor);
  const priceLow = Math.round(priceApprox * 0.9);
  const priceHigh = Math.round(priceApprox * 1.1);

  return {
    grade: gradeCode,
    grade_name: gradeInfo.name,
    factor,
    price_low: priceLow,
    price_high: priceHigh,
    description: gradeInfo.description,
    source: 'local',
  };
}

// Разбор строки "артист — альбом"
function splitArtistTitle(input) {
  if (!input) {
    return { artist: null, title: null };
  }

  const parts = input.split(/—|-|–/);
  if (parts.length >= 2) {
    const artist = parts[0].trim();
    const title = parts.slice(1).join('-').trim();
    return { artist: artist || null, title: title || null };
  }

  return { artist: null, title: input.trim() || null };
}

// Discogs: поиск релиза + price suggestions (release_id + master_id)
async function getDiscogsPriceSuggestions(artist, title, mediaType) {
  if (!DISCOGS_USER_TOKEN) {
    console.warn('DISCOGS_USER_TOKEN не задан, Discogs не используется');
    return null;
  }

  try {
    const params = {
      type: 'release',
      per_page: 10,
      page: 1,
      token: DISCOGS_USER_TOKEN,
    };

    const format = MEDIA_TYPE_TO_DISCOGS_FORMAT[mediaType] || 'Cassette';
    params.format = format;

    const qParts = [];
    if (artist) qParts.push(artist);
    if (title) qParts.push(title);
    if (qParts.length > 0) {
      params.q = qParts.join(' - ');
    }

    const searchResp = await axios.get(
      'https://api.discogs.com/database/search',
      {
        params,
        headers: {
          'User-Agent': DISCOGS_USER_AGENT,
        },
      },
    );

    const results =
      searchResp.data && searchResp.data.results
        ? searchResp.data.results
        : [];

    if (!results.length) {
      console.log('Discogs: не найдено релизов по запросу', params.q);
      return null;
    }

    console.log(
      'Discogs search results (первые 3):',
      results.slice(0, 3).map((r) => ({
        id: r.id,
        master_id: r.master_id,
        title: r.title,
        format: r.format,
        country: r.country,
        catno: r.catno,
        year: r.year,
      })),
    );

    // фильтруем по формату
    let filtered = results.filter(
      (r) =>
        Array.isArray(r.format) &&
        r.format.some(
          (f) =>
            typeof f === 'string' &&
            f.toLowerCase().includes(format.toLowerCase()),
        ),
    );

    // если есть несколько — пробуем оставить Russia
    if (filtered.length > 1) {
      const byRussia = filtered.filter(
        (r) => r.country && r.country.toLowerCase() === 'russia',
      );
      if (byRussia.length) {
        filtered = byRussia;
      }
    }

    const release = filtered.length ? filtered[0] : results[0];

    const releaseId = release.id;
    const masterId = release.master_id || null;

    console.log(
      'Discogs: выбран release_id =',
      releaseId,
      'master_id =',
      masterId,
      'title =',
      release.title,
      'formats =',
      release.format,
      'country =',
      release.country,
    );

    let suggestions = null;
    try {
      const priceResp = await axios.get(
        `https://api.discogs.com/marketplace/price_suggestions/${releaseId}`,
        {
          headers: {
            'User-Agent': DISCOGS_USER_AGENT,
            Authorization: `Discogs token=${DISCOGS_USER_TOKEN}`,
          },
        },
      );
      suggestions = priceResp.data || {};
    } catch (err) {
      console.error(
        'Discogs: не удалось получить price_suggestions (используем только релиз):',
        err.response?.data || err.message,
      );
      suggestions = null;
    }

    return {
      release_id: releaseId,
      master_id: masterId,
      release_title: release.title,
      price_suggestions: suggestions,
      currency: 'USD',
    };
  } catch (err) {
    console.error(
      'Ошибка при запросе к Discogs:',
      err.response?.data || err.message,
    );
    return null;
  }
}

// Discogs: парсинг списка лотов по master_id + формату
async function getDiscogsListings(masterId, mediaType) {
  try {
    if (!masterId) return [];

    const format = MEDIA_TYPE_TO_DISCOGS_FORMAT[mediaType] || 'Cassette';
    const url = `https://www.discogs.com/sell/list?master_id=${masterId}&format=${encodeURIComponent(
      format,
    )}`;
    console.log('Discogs: парсим marketplace URL:', url);

    const resp = await axios.get(url, {
      headers: {
        'User-Agent': DISCOGS_USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9,ru-RU,ru;q=0.8',
      },
    });

    const html = resp.data;
    const $ = cheerio.load(html);

    const items = [];

    $('table tbody tr.shortcut_navigable').each((i, el) => {
      const row = $(el);

      const title = row
        .find('td.item_description a.item_description_title')
        .text()
        .trim();
      const catno = row
        .find('td.item_description span.item_catno')
        .text()
        .trim();

      const mediaCond = row
        .find('td.item_description p.item_condition span')
        .first()
        .text()
        .trim();
      const sleeveCond = row
        .find('td.item_description span.item_sleeve_condition')
        .text()
        .trim();

      const sellerName = row
        .find('td.seller_info a[href*="/seller/"]')
        .first()
        .text()
        .trim();

      const sellerCountry = row
        .find('td.seller_info li span.mplabel:contains("Ships From:")')
        .parent()
        .text()
        .replace('Ships From:', '')
        .trim();

      let priceNode = row.find('td.item_price span.price').first();
      if (!priceNode.length) {
        priceNode = row.find('td.item_picture span.price').first();
      }

      const priceText = priceNode.text().trim();
      const currency = priceNode.attr('data-currency') || null;
      const priceValueStr = priceNode.attr('data-pricevalue') || null;

      if (!priceText || !priceValueStr) return;

      const priceValue = parseFloat(priceValueStr);
      if (Number.isNaN(priceValue)) return;

      items.push({
        title: title || null,
        catno: catno || null,
        media_condition: mediaCond || null,
        sleeve_condition: sleeveCond || null,
        seller: sellerName || null,
        seller_country: sellerCountry || null,
        price: priceValue,
        currency: currency,
        price_raw: priceText,
      });
    });

    console.log('Discogs: найдено лотов:', items.length);
    return items;
  } catch (err) {
    console.error('Discogs listings error:', err.message);
    return [];
  }
}

// Avito: с кэшем, каркас без реальных селекторов
async function getAvitoPriceStats(query, mediaType) {
  try {
    if (!query) {
      return null;
    }

    const now = Date.now();
    const cached = avitoCache[query];
    if (cached && cached.expiresAt > now) {
      console.log('Avito cache hit для запроса:', query);
      return cached.data;
    }

    const baseUrl = 'https://www.avito.ru';
    const searchQuery = encodeURIComponent(query);
    const searchUrl = `${baseUrl}/rossiya/audio_i_video?q=${searchQuery}`;

    console.log('Avito: запрос', searchUrl);

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept-Language': 'ru-RU,ru;q=0.9',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const prices = [];
    const items = [];

    // TODO: реальные CSS-селекторы Avito
    $('.item-selector').each((i, el) => {
      const title = $(el).find('.title-selector').text().trim();
      const priceText = $(el).find('.price-selector').text().trim();

      const priceMatch = priceText.replace(/\s/g, '').match(/(\d+)/);
      if (!priceMatch) return;

      const price = parseInt(priceMatch[1], 10);
      if (!price || Number.isNaN(price)) return;

      prices.push(price);
      items.push({ title, price });
    });

    if (!prices.length) {
      console.log('Avito: не нашли цен по запросу', query);
      return null;
    }

    prices.sort((a, b) => a - b);
    const count = prices.length;
    const min = prices[0];
    const max = prices[prices.length - 1];
    const median =
      count % 2 === 1
        ? prices[(count - 1) / 2]
        : Math.round((prices[count / 2 - 1] + prices[count / 2]) / 2);

    const result = {
      min_rub: min,
      max_rub: max,
      median_rub: median,
      count,
      sample_items: items.slice(0, 5),
    };

    avitoCache[query] = {
      data: result,
      expiresAt: now + AVITO_CACHE_TTL_MS,
    };

    return result;
  } catch (err) {
    console.error('Ошибка при запросе к Avito:', err.message);
    return null;
  }
}

/**
 * Эндпоинт анализа.
 */
app.post('/analyze', async (req, res) => {
  const { image_url, user_artist, user_album, user_grade, media_type } =
    req.body || {};

  console.log('Получен запрос /analyze с image_url:', image_url);
  console.log('User artist:', user_artist);
  console.log('User album:', user_album);
  console.log('User grade:', user_grade);
  console.log('Media type:', media_type);

  // 1. Оценка пользователя
  let userGradeCode = null;
  if (user_grade && GRADES[user_grade]) {
    userGradeCode = user_grade;
  }

  let userEstimate = null;
  if (userGradeCode) {
    userEstimate = makePriceEstimate(userGradeCode);
  }

  // 2. Discogs
  const { artist: parsedArtist, title: parsedTitle } = splitArtistTitle(
    user_artist || user_album || '',
  );

  const discogsData = await getDiscogsPriceSuggestions(
    parsedArtist,
    parsedTitle,
    media_type,
  );

  let discogsListings = [];
  if (discogsData && discogsData.master_id) {
    discogsListings = await getDiscogsListings(
      discogsData.master_id,
      media_type,
    );
  }

  // 3. Оценка сервиса на основе Discogs или фолбэка
  let aiEstimate = null;

  if (discogsData) {
    const suggestions = discogsData.price_suggestions;
    const mapGradeToDiscogsKey = {
      M: 'Mint',
      NM: 'Near Mint',
      'VG+': 'Very Good Plus',
      VG: 'Very Good',
      G: 'Good',
    };

    let usedDiscogsPrices = false;

    if (suggestions && Object.keys(suggestions).length > 0) {
      let targetKey = null;
      if (userGradeCode && mapGradeToDiscogsKey[userGradeCode]) {
        targetKey = mapGradeToDiscogsKey[userGradeCode];
      }

      let suggestionEntry = null;
      if (targetKey && suggestions[targetKey]) {
        suggestionEntry = suggestions[targetKey];
      } else {
        const firstKey = Object.keys(suggestions)[0];
        suggestionEntry = suggestions[firstKey];
        targetKey = firstKey;
      }

      if (suggestionEntry && typeof suggestionEntry.value === 'number') {
        const value = suggestionEntry.value;
        const priceLow = Math.round(value * 0.9);
        const priceHigh = Math.round(value * 1.1);

        aiEstimate = {
          grade: userGradeCode || null,
          grade_name: targetKey,
          factor: null,
          price_low: priceLow,
          price_high: priceHigh,
          description: `Диапазон рассчитан по данным Discogs для градации "${targetKey}".`,
          source: 'discogs',
          discogs_release_id: discogsData.release_id,
          discogs_release_title: discogsData.release_title,
          discogs_currency: discogsData.currency,
          discogs_value_raw: value,
        };
        usedDiscogsPrices = true;
      }
    }

    if (!usedDiscogsPrices) {
      const gradeCodes = Object.keys(GRADES);
      const fallbackGrade = userGradeCode || gradeCodes[gradeCodes.length - 1];
      aiEstimate = makePriceEstimate(fallbackGrade);
      aiEstimate.source = 'discogs_local_prices';
      aiEstimate.discogs_release_id = discogsData.release_id;
      aiEstimate.discogs_release_title = discogsData.release_title;
      aiEstimate.discogs_currency = discogsData.currency;
    }
  }

  if (!aiEstimate) {
    const gradeCodes = Object.keys(GRADES);
    const randomGradeCode = pickRandom(gradeCodes);
    aiEstimate = makePriceEstimate(randomGradeCode);
    aiEstimate.source = 'local';
  }

  // 4. Avito (каркас, может возвращать null)
  let avitoStats = null;
  try {
    const avitoParts = [];
    if (parsedArtist) avitoParts.push(parsedArtist);
    if (parsedTitle) avitoParts.push(parsedTitle);
    if (media_type === 'cassette') avitoParts.push('кассета');
    if (media_type === 'cd') avitoParts.push('cd');
    if (media_type === 'vinyl') avitoParts.push('винил');

    const avitoQuery = avitoParts.join(' ');
    avitoStats = await getAvitoPriceStats(avitoQuery, media_type);
  } catch (e) {
    console.error('Avito stats error:', e.message);
  }

  // 5. Сборка текста
  const lines = [];

  if (user_artist || user_album) {
    lines.push(
      'Данные, которые указал пользователь: ' +
        (user_artist ? `\n• Исполнитель / релиз: ${user_artist}` : '') +
        (user_album ? `\n• Альбом/релиз: ${user_album}` : ''),
    );
    lines.push('');
  }

  if (userEstimate) {
    lines.push('Оценка пользователя:');
    lines.push(
      `• Состояние: ${userEstimate.grade} (${userEstimate.grade_name}).`,
    );
    lines.push(`• ${userEstimate.description}`);
    lines.push(
      `• Ориентировочная стоимость: ${userEstimate.price_low.toLocaleString(
        'ru-RU',
      )}–${userEstimate.price_high.toLocaleString(
        'ru-RU',
      )} ₽ (примерно ${Math.round(
        userEstimate.factor * 100,
      )}% от условной цены Near Mint).`,
    );
    lines.push('');
  } else {
    lines.push(
      'Пользователь не указал состояние, поэтому оценка пользователя не рассчитана.',
    );
    lines.push('');
  }

  lines.push('Оценка сервиса (автоматическая):');

  if (aiEstimate.source === 'discogs') {
    lines.push('• Источник данных: Discogs (мировой рынок, реальные цены).');
  } else if (aiEstimate.source === 'discogs_local_prices') {
    lines.push(
      '• Источник данных: Discogs (релиз найден, но цены недоступны, используются локальные ориентиры).',
    );
  } else {
    lines.push('• Источник данных: внутренние ориентиры сервиса.');
  }

  if (aiEstimate.grade_name) {
    lines.push(`• Градация: ${aiEstimate.grade_name}.`);
  }

  if (aiEstimate.description) {
    lines.push(`• ${aiEstimate.description}`);
  }

  if (aiEstimate.price_low && aiEstimate.price_high) {
    const currencyLabel =
      aiEstimate.discogs_currency === 'USD' &&
      aiEstimate.source === 'discogs'
        ? 'USD'
        : '₽';
    lines.push(
      `• Ориентировочная стоимость: ${aiEstimate.price_low.toLocaleString(
        'ru-RU',
      )}–${aiEstimate.price_high.toLocaleString('ru-RU')} ${currencyLabel}.`,
    );
  }

  if (aiEstimate.discogs_release_id && aiEstimate.discogs_release_title) {
    lines.push(
      `• Релиз на Discogs: ID ${aiEstimate.discogs_release_id}, "${aiEstimate.discogs_release_title}".`,
    );
  }

  if (discogsListings && discogsListings.length > 0) {
    lines.push('');
    lines.push('Доступные предложения на Discogs (без учёта доставки):');

    discogsListings.slice(0, 7).forEach((item) => {
      const cond =
        item.media_condition || item.sleeve_condition
          ? `, состояние: ${
              item.media_condition || '?'
            } / ${item.sleeve_condition || '?'}`
          : '';

      const sellerPart = item.seller
        ? `, продавец: ${item.seller}${
            item.seller_country ? ' (' + item.seller_country + ')' : ''
          }`
        : '';

      const titlePart = item.title ? ` (${item.title})` : '';

      lines.push(`• ${item.price_raw}${cond}${sellerPart}${titlePart}`);
    });
  }

  if (avitoStats && avitoStats.count >= 3) {
    lines.push('');
    lines.push('По данным Avito (Россия):');
    lines.push(
      `• Цены в объявлениях: от ${avitoStats.min_rub.toLocaleString(
        'ru-RU',
      )} до ${avitoStats.max_rub.toLocaleString('ru-RU')} ₽.`,
    );
    lines.push(
      `• Медиана цены: около ${avitoStats.median_rub.toLocaleString(
        'ru-RU',
      )} ₽ по ${avitoStats.count} объявлениям.`,
    );
  }

  lines.push('');
  lines.push(
    'Важно: оценка носит ориентировочный характер и не учитывает конкретное физическое состояние именно твоего экземпляра. ' +
      'В следующих версиях будет подключен анализ фото и более точные локальные цены.',
  );

  const text = lines.join('\n');

  res.json({
    text,
    user_estimate: userEstimate,
    ai_estimate: aiEstimate,
  });
});

// === Crypto Bot: создать инвойс ===
app.post('/api/cryptobot/create-invoice', async (req, res) => {
  console.log('create-invoice req.body =', req.body);

  try {
    if (!cryptoPay) {
      console.log('cryptoPay instance is missing');
      return res
        .status(500)
        .json({ error: 'Crypto Pay API не инициализирован (нет токена)' });
    }

    const { userId } = req.body || {};
    if (!userId) {
      console.log('create-invoice: userId is missing');
      return res.status(400).json({ error: 'userId is required' });
    }

    const amount = '5';
    const asset = Asset.USDT;

    const invoice = await cryptoPay.createInvoice({
      asset,
      amount,
      description: 'BASF BOT PRO',
      payload: { userId: String(userId) },
    });

    invoicesByUser.set(String(userId), {
      invoiceId: invoice.invoice_id,
      status: 'pending',
    });

    return res.json({ payUrl: invoice.pay_url });
  } catch (e) {
    console.error('CryptoPay createInvoice error:', e);
    return res.status(500).json({ error: 'CryptoPay createInvoice failed' });
  }
});

// === Crypto Bot: проверка оплаты ===
app.post('/api/cryptobot/check-payment', async (req, res) => {
  try {
    if (!cryptoPay) {
      return res
        .status(500)
        .json({ error: 'Crypto Pay API не инициализирован (нет токена)' });
    }

    const { userId } = req.body || {};
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const info = invoicesByUser.get(String(userId));
    if (!info) {
      return res.json({ paid: false, error: 'Invoice not found for user' });
    }

    const { invoiceId } = info;

    const result = await cryptoPay.getInvoices({
      invoice_ids: [invoiceId],
    });

    const invoice = result.items?.[0];
    if (!invoice) {
      return res.json({ paid: false, error: 'Invoice not found in API' });
    }

    if (invoice.status === 'paid') {
      invoicesByUser.set(String(userId), {
        invoiceId,
        status: 'paid',
      });
      // TODO: здесь отметить пользователя как PRO в реальной БД
      return res.json({ paid: true });
    }

    return res.json({ paid: false, status: invoice.status });
  } catch (e) {
    console.error('CryptoPay getInvoices error:', e);
    return res.status(500).json({ error: 'CryptoPay getInvoices failed' });
  }
});

// === Cryptomus: утилита для подписи ===
function makeCryptomusSign(body, apiKey) {
  const json = JSON.stringify(body);
  const payloadBase64 = Buffer.from(json).toString('base64');
  const sign = crypto
    .createHash('md5')
    .update(payloadBase64 + apiKey)
    .digest('hex');
  // В ответ возвращаем СЫРОЙ JSON, а не base64
  return { json, sign };
}

app.post('/api/cryptomus/create-payment', async (req, res) => {
  try {
    if (!CRYPTOMUS_MERCHANT_ID || !CRYPTOMUS_API_KEY) {
      return res
        .status(500)
        .json({ error: 'Cryptomus credentials are missing' });
    }

    const { userId } = req.body || {};
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const body = {
      amount: '5',
      currency: 'USDT',
      order_id: String(userId),
      url_callback: 'https://example.com/cryptomus-callback',
    };

    const { json, sign } = makeCryptomusSign(body, CRYPTOMUS_API_KEY);

    const resp = await axios.post(
      'https://api.cryptomus.com/v1/payment',
      json,
      {
        headers: {
          merchant: CRYPTOMUS_MERCHANT_ID,
          sign,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = resp.data;
    console.log('Cryptomus payment response:', data);

    if (!data || !data.result || !data.result.url) {
      return res.status(500).json({ error: 'Invalid Cryptomus response' });
    }

    return res.json({ payUrl: data.result.url });
  } catch (e) {
    console.error(
      'Cryptomus create-payment error:',
      e.response?.data || e.message
    );
    return res
      .status(500)
      .json({ error: 'Cryptomus create-payment failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Cassette API listening on http://localhost:${PORT}`);
});