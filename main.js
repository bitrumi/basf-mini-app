// ==== НАСТРОЙКА API ====
// Мини‑аппа (GitHub / Telegram) → API на VPS
const API_BASE = 'https://api.nftsound.ru';

const API_URL_FOR_CASSETTE = `${API_BASE}/api/analyze`;
const API_URL_FOR_MUSIC_SEARCH = `${API_BASE}/api/music-search`;

// Простая система экранов (оставляем только старт и результат)
function showScreen(id) {
  document.querySelectorAll('.screen').forEach((el) => {
    el.style.display = el.id === id ? 'block' : 'none';
  });
}

// Текущее состояние (grade и тип носителя)
let state = {
  gradePhoto: null,
  gradeManual: null,
};

// ===== НОВОЕ: универсальная функция получения userId из Telegram =====
function getTelegramUserId() {
  const tg = window.Telegram?.WebApp;
  const user = tg?.initDataUnsafe?.user;
  console.log('Telegram WebApp user =', user);
  return user?.id || 123456789;
}

// --- I18N РЕСУРСЫ ---
const resources = {
  ru: {
    translation: {
      start_title: 'BASF BOT',
      start_subtitle: 'Оценка кассет, CD и винила',
      menu_assessment: 'Оценка',
      menu_music: 'Музыка',
      menu_rarity: 'Таблицы',
      menu_reserve: 'Резерв',
      music_modal_title: 'Музыка',
      music_modal_hint: 'Введи название трека, исполнителя или кусок текста песни.',
      music_modal_search_btn: 'Найти',
      music_modal_placeholder: 'Скоро здесь появится поиск по Deezer/Spotify. Пока это заглушка.',
      reserve_modal_title: 'Резерв / PRO доступ',
      reserve_modal_pro_title: 'Что даёт BASF BOT PRO:',
      reserve_modal_pro_bullets: '• Приоритетная обработка запросов\n• Расширенные текстовые отчёты\n• Ранний доступ к новым таблицам и брендам',
      reserve_modal_cryptomus_title: 'Оплата через Cryptomus (web):',
      reserve_modal_cryptomus_text: 'Откроется страница оплаты Cryptomus во встроенном браузере Telegram.',
      reserve_modal_cryptomus_btn: 'Оплатить через Cryptomus',
      reserve_modal_cryptobot_title: 'Оплата через Crypto Bot (крипта в Telegram):',
      reserve_modal_cryptobot_text: 'Откроется окно с оплатой в @CryptoBot. После успешного платежа PRO активируется автоматически.',
      reserve_modal_cryptobot_btn: 'Оплатить через Crypto Bot',
      reserve_modal_gala_title: 'Оплата токенами в GalaChain:',
      reserve_modal_gala_text: 'Адрес и сумма подтянутся с сервера. Отправь платёж, затем нажми «Я оплатил».',
      reserve_modal_gala_refresh_btn: 'Обновить реквизиты GalaChain',
      reserve_modal_gala_check_btn: 'Я оплатил, проверить',
    },
  },
  en: {
    translation: {
      start_title: 'BASF BOT',
      start_subtitle: 'Cassette, CD and vinyl appraisal',
      menu_assessment: 'Appraisal',
      menu_music: 'Music',
      menu_rarity: 'Charts',
      menu_reserve: 'Reserve',
      music_modal_title: 'Music',
      music_modal_hint: 'Enter a track name, artist, or a piece of the lyrics.',
      music_modal_search_btn: 'Search',
      music_modal_placeholder: 'Deezer/Spotify search will appear here soon. For now this is a placeholder.',
      reserve_modal_title: 'Reserve / PRO access',
      reserve_modal_pro_title: 'What BASF BOT PRO gives you:',
      reserve_modal_pro_bullets: '• Priority request processing\n• Extended text reports\n• Early access to new tables and brands',
      reserve_modal_cryptomus_title: 'Payment via Cryptomus (web):',
      reserve_modal_cryptomus_text: 'A Cryptomus payment page will open in Telegram’s in-app browser.',
      reserve_modal_cryptomus_btn: 'Pay via Cryptomus',
      reserve_modal_cryptobot_title: 'Payment via Crypto Bot (crypto in Telegram):',
      reserve_modal_cryptobot_text: 'A payment window in @CryptoBot will open. After a successful payment, PRO will be activated automatically.',
      reserve_modal_cryptobot_btn: 'Pay via Crypto Bot',
      reserve_modal_gala_title: 'Payment with tokens on GalaChain:',
      reserve_modal_gala_text: 'The address and amount will be loaded from the server. Send the payment, then tap "I have paid".',
      reserve_modal_gala_refresh_btn: 'Refresh GalaChain details',
      reserve_modal_gala_check_btn: 'I have paid, check',
    },
  },
};


// --- ДАННЫЕ ПО TDK (черновой JSON) ---
const TDK_SERIES = [
  {
    brand: 'TDK',
    name: 'TDK D',
    type: 'I',
    years: '1979–2001',
    examples: ['D-C90 1979', 'D30 1984', 'D60 1985', 'D90 1985', 'D90 1992–1997', 'D60 1997–2001', 'Super D90 1997–2001'],
    rarity: '1',
    price_nos_eur: '2–5',
    price_open_eur: '1–2',
    note: 'Массовый феррик TDK, самый распространённый вариант; хорош для повседневной записи и ностальгии, коллекционная ценность минимальна.'
  },
  {
    brand: 'TDK',
    series: 'AD',
    name: 'TDK AD',
    type: 'I (High)',
    years: '1982–1997',
    examples: ['AD60 1982', 'AD90 1985', 'AD46 1986', 'AD90 1995–1997'],
    rarity: '2–3',
    price_nos_eur: '3–7',
    price_open_eur: '1–3',
    note: 'Усиленный феррик; по измерениям не сильно уступает ранним SA, считается одним из лучших Type I у TDK своего времени.'
  },
  {
    brand: 'TDK',
    series: 'OD',
    name: 'TDK OD',
    type: 'I (Super Ferric)',
    years: '1979–1983',
    examples: ['OD C60 1979', 'OD C90 1979', 'OD 60 1982–1983 (JP)'],
    rarity: '3–4',
    price_nos_eur: '10–25+',
    price_open_eur: '4–8+',
    note: 'Ранняя суперферритовая линейка до AD/AR; встречается заметно реже обычных D/AD, особенно ранние японские выпуски конца 70‑х и начала 80‑х.'
  },
  {
    brand: 'TDK',
    series: 'AR',
    name: 'TDK AR',
    type: 'I (High / Super Ferric)',
    years: '1984–1997',
    examples: ['AR60 1984–1986', 'AR60 1990–1993', 'AR-X 1990–1995 (JP)'],
    rarity: '3–4',
    price_nos_eur: '8–18+',
    price_open_eur: '3–7+',
    note: 'Топовый Type I TDK поверх AD; ближе к superferric, с хорошими басами и динамическим диапазоном, особенно поздние AR и AR‑X ценятся у записывающих на Type I.'
  },
  {
    brand: 'TDK',
    series: 'SA',
    name: 'TDK SA',
    type: 'II (High Bias)',
    years: '1975–1997',
    examples: ['SA-C60 1975–1977', 'SA-C90 1979', 'SA90 1983', 'SA90 1985', 'SA90 1990', 'SA90 1992–1997'],
    rarity: '2–3',
    price_nos_eur: '5–12',
    price_open_eur: '2–4',
    note: 'Классический хром TDK, один из самых популярных Type II; большой разброс по ценам в зависимости от года, рынка (Japan/US/Europe) и дизайна.'
  },
  {
    brand: 'TDK',
    series: 'SA-X',
    name: 'TDK SA-X',
    type: 'II (Super, dual layer)',
    years: '1979–2001',
    examples: ['SA-X C60 1979', 'SA-X90 1986', 'SA-X90 1988', 'SA-X90 1990', 'SA-X60 1997–2001', 'SA-X90 1997–2001'],
    rarity: '3–4',
    price_nos_eur: '12–25+',
    price_open_eur: '4–8+',
    note: 'Топовый хром TDK с двухслойным покрытием; считается одним из лучших Type II на рынке, особенно ранние поколения и японские версии.'
  },
  {
    brand: 'TDK',
    series: 'SA-XS',
    name: 'TDK SA-XS',
    type: 'II (Super)',
    years: '1995–2001',
    examples: ['SA-XS90 1995–1997', 'SA-XS90 1997–2001'],
    rarity: '4',
    price_nos_eur: '20–35+',
    price_open_eur: '7–12+',
    note: 'Ещё более продвинутая версия SA‑X с ориентацией на аудиофилов; сравнительно редкая линейка с заметным спросом среди коллекционеров.'
  },
  {
    brand: 'TDK',
    series: 'MA',
    name: 'TDK MA',
    type: 'IV (Metal)',
    years: '1986–2001',
    examples: ['MA60 1986', 'MA90 1986', 'MA110 1988', 'MA90 1990', 'MA60 1995–1997', 'MA90 1995–1997', 'MA90 1997–2001'],
    rarity: '3–4',
    price_nos_eur: '15–30+',
    price_open_eur: '5–10+',
    note: 'Основная металлическая линейка TDK; ценится и за звук, и за разнообразие корпусов разных поколений.'
  },
  {
    brand: 'TDK',
    series: 'MA-X',
    name: 'TDK MA-X',
    type: 'IV (Metal, high grade)',
    years: '1986–1990',
    examples: ['MA-X60 1986', 'MA-X90 1986', 'MA-X 1990'],
    rarity: '4',
    price_nos_eur: '25–45+',
    price_open_eur: '8–15+',
    note: 'Усиленная версия MA с улучшенными характеристиками и более дорогим позиционированием; востребована среди коллекционеров и любителей металла.'
  },
  {
    brand: 'TDK',
    series: 'MA-XG',
    name: 'TDK MA-XG',
    type: 'IV (Metal, flagship)',
    years: '1990',
    examples: ['MA-XG 60 1990', 'MA-XG 90 1990'],
    rarity: '5',
    price_nos_eur: '50–100+',
    price_open_eur: '20–40+',
    note: 'Флагманская металлическая серия с тяжёлым корпусом; одни из самых дорогих и желанных TDK на рынке, особенно в состоянии NOS.'
  }
];

// --- ПЕРЕКЛЮЧЕНИЕ БРЕНДОВ В ТАБЛИЦАХ (объявлено до модалок) ---
const brandChips = document.querySelectorAll('.brand-chip');
const brandTables = document.querySelectorAll('.brand-table');

function showBrand(brand) {
  brandChips.forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.brand === brand);
  });

  brandTables.forEach((table) => {
    const isTarget = table.dataset.brand === brand;
    table.style.display = isTarget ? 'block' : 'none';

    if (isTarget) {
      table.classList.remove('show-animated');
      void table.offsetWidth;
      table.classList.add('show-animated');

      if (brand === 'tdk') {
        const wowBlocks = [
          document.getElementById('tape-wow-ma-xg'),
          document.getElementById('tape-wow-sa-x'),
        ];

        wowBlocks.forEach((el, i) => {
          if (!el) return;
          el.classList.remove('loaded');
          void el.offsetWidth;
          el.style.transitionDelay = `${0.05 * i}s`;
          el.classList.add('loaded');
        });
      }
    }
  });
}

function fillWowBlockForSAX() {
  const data = TDK_SERIES.find(
    (item) => item.brand === 'TDK' && item.series === 'SA-X'
  );
  if (!data) return;

  const titleEl = document.getElementById('wow-sa-x-title');
  const subtitleEl = document.getElementById('wow-sa-x-subtitle');
  const detailEl = document.getElementById('wow-sa-x-detail');

  if (titleEl) titleEl.textContent = data.name;
  if (subtitleEl) subtitleEl.textContent = `${data.type}, ${data.years}, редкость ${data.rarity}`;
  if (detailEl) detailEl.textContent = `NOS: ${data.price_nos_eur} €, открытая: ${data.price_open_eur} €. ${data.note}`;
}

function fillWowBlockForMAXG() {
  const data = TDK_SERIES.find(
    (item) => item.brand === 'TDK' && item.series === 'MA-XG'
  );
  if (!data) return;

  const titleEl = document.getElementById('wow-ma-xg-title');
  const subtitleEl = document.getElementById('wow-ma-xg-subtitle');
  const detailEl = document.getElementById('wow-ma-xg-detail');

  if (titleEl) titleEl.textContent = data.name;
  if (subtitleEl) subtitleEl.textContent = `${data.type}, ${data.years}, редкость ${data.rarity}`;
  if (detailEl) detailEl.textContent = `NOS: ${data.price_nos_eur} €, открытая: ${data.price_open_eur} €. ${data.note}`;
}

// --- ОБРАБОТЧИКИ ПОСЛЕ ЗАГРУЗКИ DOM ---
window.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.expand();
  }
  fillWowBlockForMAXG();
  fillWowBlockForSAX();

  // --- I18N INIT ---
  i18next.init(
    {
      lng: 'ru',
      debug: false,
      resources,
    },
    () => {
      updateContent();
    }
  );

  function updateContent() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      el.textContent = i18next.t(key);
    });
  }

  showScreen('screen-start');

  // --- ЯЗЫКОВОЙ ПЕРЕКЛЮЧАТЕЛЬ ---
  const langToggle = document.getElementById('lang-toggle');
  const langDropdown = document.getElementById('lang-dropdown');
  const langOptions = document.querySelectorAll('.lang-option');

  let currentLang = 'ru';

  function setLang(langCode, labelText) {
    currentLang = langCode;
    if (langToggle) {
      langToggle.textContent = labelText || langCode.toUpperCase();
    }
    i18next.changeLanguage(langCode, () => {
      updateContent();
    });
  }

  if (langToggle && langDropdown) {
    langToggle.addEventListener('click', () => {
      langDropdown.classList.toggle('open');
    });

    langOptions.forEach((btn) => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        const label = btn.textContent.trim();
        const supported = ['ru', 'en'];
        const target = supported.includes(lang) ? lang : 'en';

        setLang(target, label);
        langDropdown.classList.remove('open');
      });
    });

    setLang('ru', 'RU');
  }

  // --- НИЖНЕЕ МЕНЮ ---
  const menuItems = document.querySelectorAll('.menu-item');

  function setActiveMenu(section) {
    menuItems.forEach((item) => {
      item.classList.toggle('active', item.dataset.section === section);
    });
  }
  
  async function searchMusic(query) {
  if (!musicResults) return;

  musicResults.innerHTML = '<p>Ищу треки...</p>';

  try {
    const res = await fetch(`${API_BASE}/api/music-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      musicResults.innerHTML =
        '<p>Не удалось получить результаты. Попробуй позже.</p>';
      return;
    }

    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];

    if (!items.length) {
      musicResults.innerHTML =
        '<p>Ничего не найдено. Попробуй сформулировать запрос по‑другому.</p>';
      return;
    }

    const html = items
      .map((t) => {
        const artist = t.artist || 'Неизвестный артист';
        const title = t.title || 'Без названия';
        const album = t.album || 'Без альбома';
        return `<div class="music-result-item">
          <div class="music-result-title">${artist} — ${title}</div>
          <div class="music-result-subtitle">${album}</div>
        </div>`;
      })
      .join('');

    musicResults.innerHTML = html;
  } catch (e) {
    console.error('Music search frontend error', e);
    musicResults.innerHTML =
      '<p>Произошла ошибка при запросе к серверу. Попробуй позже.</p>';
  }
}

  // --- МОДАЛКА МУЗЫКИ ---
  const musicModal = document.getElementById('music-modal');
  const musicModalClose = document.getElementById('music-modal-close');
  const musicSearchInput = document.getElementById('music-query');
  const musicSearchBtn = document.getElementById('music-search-btn');
  const musicResults = document.getElementById('music-results');

  function openMusicModal() {
    if (musicModal) musicModal.classList.add('show');
  }

  function closeMusicModal() {
    if (musicModal) musicModal.classList.remove('show');
  }

  if (musicModal && musicModalClose) {
    musicModalClose.addEventListener('click', closeMusicModal);
    musicModal.addEventListener('click', (e) => {
      if (e.target === musicModal) closeMusicModal();
    });
  }

  if (musicSearchBtn && musicSearchInput && musicResults) {
  musicSearchBtn.addEventListener('click', () => {
    const query = musicSearchInput.value.trim();
    if (!query) {
      musicResults.innerHTML = '<p>Введи текст запроса.</p>';
      return;
    }
     searchMusic(query);
    });
  }

  // --- МОДАЛКА ТАБЛИЦ РЕДКОСТИ ---
  const rarityModal = document.getElementById('rarity-modal');
  const rarityModalClose = document.getElementById('rarity-modal-close');

  function openRarityModal() {
    if (rarityModal) {
      rarityModal.classList.add('show');
      showBrand('sony');
    }
  }

  function closeRarityModal() {
    if (rarityModal) rarityModal.classList.remove('show');
  }

  if (rarityModal && rarityModalClose) {
    rarityModalClose.addEventListener('click', closeRarityModal);
    rarityModal.addEventListener('click', (e) => {
      if (e.target === rarityModal) closeRarityModal();
    });
  }

  // --- МОДАЛКА РЕЗЕРВА / ОПЛАТЫ ---
  const reserveModal = document.getElementById('reserve-modal');
  const reserveModalClose = document.getElementById('reserve-modal-close');

  function openReserveModal() {
    if (reserveModal) reserveModal.classList.add('show');
  }

  function closeReserveModal() {
    if (reserveModal) reserveModal.classList.remove('show');
  }

  if (reserveModal && reserveModalClose) {
    reserveModalClose.addEventListener('click', closeReserveModal);
    reserveModal.addEventListener('click', (e) => {
      if (e.target === reserveModal) closeReserveModal();
    });
  }

  // --- МОДАЛКИ ОЦЕНКИ ---
  const assessmentModal = document.getElementById('assessment-modal');
  const assessmentModalClose = document.getElementById('assessment-modal-close');
  const modalAssessmentPhoto = document.getElementById('modal-assessment-photo');
  const modalAssessmentManual = document.getElementById('modal-assessment-manual');

  const assessmentPhotoModal = document.getElementById('assessment-photo-modal');
  const assessmentPhotoModalClose = document.getElementById('assessment-photo-modal-close');

  const assessmentManualModal = document.getElementById('assessment-manual-modal');
  const assessmentManualModalClose = document.getElementById('assessment-manual-modal-close');

  function openAssessmentModal() {
    if (assessmentModal) assessmentModal.classList.add('show');
  }

  function closeAssessmentModal() {
    if (assessmentModal) assessmentModal.classList.remove('show');
  }

  function openAssessmentPhotoModal() {
    if (assessmentPhotoModal) assessmentPhotoModal.classList.add('show');
  }

  function closeAssessmentPhotoModal() {
    if (assessmentPhotoModal) assessmentPhotoModal.classList.remove('show');
  }

  function openAssessmentManualModal() {
    if (assessmentManualModal) assessmentManualModal.classList.add('show');
  }

  function closeAssessmentManualModal() {
    if (assessmentManualModal) assessmentManualModal.classList.remove('show');
  }

  if (assessmentModal && assessmentModalClose) {
    assessmentModalClose.addEventListener('click', closeAssessmentModal);
    assessmentModal.addEventListener('click', (e) => {
      if (e.target === assessmentModal) closeAssessmentModal();
    });
  }

  if (assessmentPhotoModal && assessmentPhotoModalClose) {
    assessmentPhotoModalClose.addEventListener('click', closeAssessmentPhotoModal);
    assessmentPhotoModal.addEventListener('click', (e) => {
      if (e.target === assessmentPhotoModal) closeAssessmentPhotoModal();
    });
  }

  if (assessmentManualModal && assessmentManualModalClose) {
    assessmentManualModalClose.addEventListener('click', closeAssessmentManualModal);
    assessmentManualModal.addEventListener('click', (e) => {
      if (e.target === assessmentManualModal) closeAssessmentManualModal();
    });
  }

  if (modalAssessmentPhoto) {
    modalAssessmentPhoto.addEventListener('click', () => {
      closeAssessmentModal();
      openAssessmentPhotoModal();
    });
  }

  if (modalAssessmentManual) {
    modalAssessmentManual.addEventListener('click', () => {
      closeAssessmentModal();
      openAssessmentManualModal();
    });
  }
  
  // --- GRADE + активация кнопок "Рассчитать" ---
const gradeButtonsPhoto = document.querySelectorAll('#grade-buttons button');
const gradeButtonsManual = document.querySelectorAll('#grade-buttons-manual button');
const btnCalcPhoto = document.getElementById('btn-calc-photo');
const btnCalcManual = document.getElementById('btn-calc-manual');

function handleGradeClick(buttons, targetStateKey, calcButton) {
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const grade = btn.dataset.grade;
      if (!grade) return;

      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      state[targetStateKey] = grade;

      if (calcButton) {
        calcButton.disabled = false;
      }
    });
  });
}

if (gradeButtonsPhoto.length && btnCalcPhoto) {
  btnCalcPhoto.disabled = true;
  handleGradeClick(gradeButtonsPhoto, 'gradePhoto', btnCalcPhoto);
}

if (gradeButtonsManual.length && btnCalcManual) {
  btnCalcManual.disabled = true;
  handleGradeClick(gradeButtonsManual, 'gradeManual', btnCalcManual);
}

  // --- МОДАЛКА РЕЗУЛЬТАТА ---
  const resultModal = document.getElementById('result-modal');
  const resultModalClose = document.getElementById('result-modal-close');
  const resultText = document.getElementById('result-text');
  const btnNew = document.getElementById('btn-new');

  function openResultModal() {
    if (resultModal) {
      resultModal.classList.add('show');
    }
  }

  function closeResultModal() {
    if (resultModal) {
      resultModal.classList.remove('show');
    }
  }

  if (resultModal && resultModalClose) {
    resultModalClose.addEventListener('click', () => {
      closeResultModal();
      setActiveMenu('assessment');
    });

    resultModal.addEventListener('click', (e) => {
      if (e.target === resultModal) {
        closeResultModal();
        setActiveMenu('assessment');
      }
    });
  }

  if (btnNew) {
    btnNew.addEventListener('click', () => {
      closeResultModal();
      setActiveMenu('assessment');
      // по умолчанию открываем выбор способа оценки
      openAssessmentModal();
    });
  }
  
    // --- ОБРАБОТЧИКИ КНОПОК "Рассчитать" ---

  if (btnCalcPhoto) {
  btnCalcPhoto.addEventListener('click', async () => {
    const artistTitleInput = document.getElementById('input-artist-title');
    const mediaSelect = document.getElementById('select-media');
    const grade = state.gradePhoto;

    const artistTitle = artistTitleInput?.value.trim();
    const media = mediaSelect?.value;

    if (!artistTitle || !media || !grade) {
      alert('Заполни все поля и выбери grade.');
      return;
    }

    try {
      const res = await fetch(API_URL_FOR_CASSETTE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: null,          // пока фото не отправляем
          user_artist: artistTitle, // строка "Исполнитель — Альбом"
          user_album: artistTitle,  // можно то же самое
          user_grade: grade,        // M / NM / VG+ / VG / G
          media_type: media,        // cassette / cd / vinyl
        }),
      });

      if (!res.ok) {
        alert('Не удалось получить оценку. Попробуй позже.');
        return;
      }

      const data = await res.json();

      const textParts = [
        `Результат для: ${artistTitle}`,
        `Носитель: ${media}`,
        `Grade: ${grade}`,
        '',
        data.text || 'Сервер вернул пустой ответ.',
      ];

      if (resultText) {
        resultText.textContent = textParts.join('\n');
      }

      openResultModal();
    } catch (e) {
      console.error(e);
      alert('Произошла ошибка при запросе к серверу.');
      }
    });
  }

  if (btnCalcManual) {
  btnCalcManual.addEventListener('click', async () => {
    const artistTitleInput = document.getElementById('input-artist-title-manual');
    const mediaSelect = document.getElementById('select-media-manual');
    const grade = state.gradeManual;

    const artistTitle = artistTitleInput?.value.trim();
    const media = mediaSelect?.value;

    if (!artistTitle || !media || !grade) {
      alert('Заполни все поля и выбери grade.');
      return;
    }

    try {
      const res = await fetch(API_URL_FOR_CASSETTE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: null,
          user_artist: artistTitle,
          user_album: artistTitle,
          user_grade: grade,
          media_type: media,
        }),
      });

      if (!res.ok) {
        alert('Не удалось получить оценку. Попробуй позже.');
        return;
      }

      const data = await res.json();

      const textParts = [
        `Результат для: ${artistTitle}`,
        `Носитель: ${media}`,
        `Grade: ${grade}`,
        '',
        data.text || 'Сервер вернул пустой ответ.',
      ];

      if (resultText) {
        resultText.textContent = textParts.join('\n');
      }

      openResultModal();
    } catch (e) {
      console.error(e);
      alert('Произошла ошибка при запросе к серверу.');
    }
  });
 }

  // --- ЭКРАН РЕЗЕРВА / ОПЛАТЫ (DOM-элементы) ---
  const backReserve = document.getElementById('btn-back-from-reserve');
  const btnCryptoBot = document.getElementById('btn-reserve-crypto-bot');
  const galaInfoEl = document.getElementById('gala-payment-instruction');
  const btnGalaRefresh = document.getElementById('btn-gala-refresh');
  const btnGalaCheck = document.getElementById('btn-gala-check');
  const btnCryptomus = document.getElementById('btn-reserve-cryptomus');

  const modalBtnCryptoBot = document.getElementById('modal-btn-reserve-crypto-bot');
  const modalGalaInfoEl = document.getElementById('modal-gala-payment-instruction');
  const modalBtnGalaRefresh = document.getElementById('modal-btn-gala-refresh');
  const modalBtnGalaCheck = document.getElementById('modal-btn-gala-check');
  const modalBtnCryptomus = document.getElementById('modal-btn-reserve-cryptomus');
  const modalCryptoPayUrl = document.getElementById('modal-crypto-pay-url');

  // --- Cryptomus ---
  if (btnCryptomus || modalBtnCryptomus) {
    const attachCryptomusHandler = (buttonEl) => {
      if (!buttonEl) return;
      buttonEl.addEventListener('click', async () => {
        const userId = getTelegramUserId();
        console.log('Cryptomus userId before fetch =', userId);

        if (!userId) {
          alert('Не удалось определить userId. Открой мини‑апп из Telegram, а не из браузера.');
          return;
        }

        const res = await fetch(`${API_BASE}/api/cryptomus/create-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        if (!res.ok) {
          alert('Не удалось создать счёт в Cryptomus. Попробуй позже.');
          return;
        }

        const data = await res.json();
        if (!data.payUrl) {
          alert('Некорректный ответ от Cryptomus.');
          return;
        }

        const tg = window.Telegram?.WebApp;
        if (tg?.openLink) {
          tg.openLink(data.payUrl);
        } else {
          window.open(data.payUrl, '_blank');
        }
      });
    };

    attachCryptomusHandler(btnCryptomus);
    attachCryptomusHandler(modalBtnCryptomus);
  }

  // ===== Gala ВРЕМЕННО ОТКЛЮЧАЕМ =====
  async function loadGalaPaymentDetails() {
    console.log('Gala payment: not implemented yet');
    if (galaInfoEl) {
      galaInfoEl.textContent = 'GalaChain-оплата пока в разработке. Используй кнопку Crypto Bot.';
    }
    if (modalGalaInfoEl) {
      modalGalaInfoEl.textContent = 'GalaChain-оплата пока в разработке. Используй кнопку Crypto Bot.';
    }
    window._galaDetailsLoaded = true;
  }

  if (backReserve) {
    backReserve.addEventListener('click', () => {
      showScreen('screen-start');
      setActiveMenu('assessment');
    });
  }

  if (btnGalaRefresh || modalBtnGalaRefresh) {
    const attachGalaRefresh = (buttonEl, infoEl) => {
      if (!buttonEl) return;
      buttonEl.addEventListener('click', () => {
        loadGalaPaymentDetails().catch(() => {
          if (infoEl) infoEl.textContent = 'Не удалось получить реквизиты GalaChain. Попробуй позже.';
        });
      });
    };

    attachGalaRefresh(btnGalaRefresh, galaInfoEl);
    attachGalaRefresh(modalBtnGalaRefresh, modalGalaInfoEl);
  }

  if (btnGalaCheck || modalBtnGalaCheck) {
    const attachGalaCheck = (buttonEl) => {
      if (!buttonEl) return;
      buttonEl.addEventListener('click', async () => {
        alert('Проверка платежа GalaChain появится в следующих версиях.');
      });
    };

    attachGalaCheck(btnGalaCheck);
    attachGalaCheck(modalBtnGalaCheck);
  }

  // ===== обработчик кнопки Crypto Bot =====
  if (btnCryptoBot || modalBtnCryptoBot) {
    const attachCryptoBotHandler = (buttonEl, urlTargetEl) => {
      if (!buttonEl) return;
      buttonEl.addEventListener('click', async () => {
        const userId = getTelegramUserId();
        console.log('userId before fetch =', userId);

        if (!userId) {
          alert('Не удалось определить userId. Открой мини‑апп из Telegram, а не из браузера.');
          return;
        }

        const res = await fetch(`${API_BASE}/api/cryptobot/create-invoice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        if (!res.ok) {
          alert('Не удалось создать счёт в Crypto Bot. Попробуй позже.');
          return;
        }

        const data = await res.json();
        if (!data.payUrl) {
          alert('Сервис вернул некорректный ответ по Crypto Bot.');
          return;
        }

        if (urlTargetEl) {
          urlTargetEl.textContent = data.payUrl;
          urlTargetEl.style.cursor = 'pointer';
          urlTargetEl.onclick = () => window.open(data.payUrl, '_blank');
        }

        const tg2 = window.Telegram?.WebApp;
        if (tg2?.openInvoice) {
          tg2.openInvoice(data.payUrl, (status) => {
            console.log('openInvoice status =', status);
          });
          return;
        }
        if (tg2?.openLink) {
          tg2.openLink(data.payUrl);
          return;
        }
        window.open(data.payUrl, '_blank');
      });
    };

    const oldCryptoUrlEl = document.getElementById('crypto-pay-url');
    attachCryptoBotHandler(btnCryptoBot, oldCryptoUrlEl);
    attachCryptoBotHandler(modalBtnCryptoBot, modalCryptoPayUrl);
  }

  // --- КЛИКИ ПО НИЖНЕМУ МЕНЮ ---
  menuItems.forEach((item) => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      console.log('MENU click =', section);

      if (section === 'assessment') {
        openAssessmentModal();
        setActiveMenu('assessment');
      } else if (section === 'music') {
        openMusicModal();
        setActiveMenu('music');
      } else if (section === 'rarity') {
        openRarityModal();
        setActiveMenu('rarity');
      } else if (section === 'reserve') {
        openReserveModal();
        setActiveMenu('reserve');
        if (!window._galaDetailsLoaded) {
          loadGalaPaymentDetails().catch(console.error);
        }
      }
    });
  });

  // --- обработчики клика по чипам брендов ---
  brandChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const brand = chip.dataset.brand;
      console.log('BRAND click =', brand);
      showBrand(brand);
    });
  });

  // при первом входе в таблицы показываем Sony
  showBrand('sony');
});