// ==== НАСТРОЙКА API ====
const API_URL_FOR_CASSETTE = 'http://localhost:3000/analyze';

// --- ЛОКАЛИЗАЦИЯ ---
const translations = {
  ru: {
    heroTitle: 'BASF BOT',
    heroSubtitle: 'Оценка кассет, CD и винила',
    menuAssessment: 'Оценка',
    menuCollection: 'Коллекции',
    menuRarity: 'Таблицы',
    menuReserve: 'Резерв',

    assessmentTitle: 'Оценка кассет',
    assessmentChooseMethod: 'Выберите способ оценки',
    assessmentByPhoto: 'Оценить по фото',
    assessmentManual: 'Оценить вручную',

    photoTitle: 'Оценка по фото',
    manualTitle: 'Ввод данных вручную',
    resultTitle: 'Результат оценки',
    btnCalculate: 'Рассчитать',
    btnNew: 'Оценить ещё',

    rarityTitle: 'Таблицы редкости',
    rarityBrandAgfa: 'Кассеты AGFA — серии, редкость и примерные цены',
    rarityBrandBasf: 'Кассеты BASF — серии, редкость и примерные цены',
    rarityBrandDenon: 'Кассеты Denon — серии, редкость и примерные цены',
    rarityBrandMaxell: 'Кассеты Maxell — серии, редкость и примерные цены',
    rarityBrandSony: 'Кассеты Sony — серии, редкость и примерные цены',
    rarityBrandTdk: 'Кассеты TDK — серии, редкость и примерные цены',
    rarityNoteGeneric:
      'Цены NOS указаны как ориентиры для запечатанных кассет обычной длины (60–90 мин). ' +
      'Для открытых ориентируемся примерно на 0.3× от NOS‑цен при хорошем состоянии; ' +
      'для редких серий разброс может быть значительным.',

    sonyDescriptions: {
      hf: 'Массовые базовые феррики; интересны больше для ностальгии и серийных подборок, чем как инвестиция.',
      ucx: 'Ранние хром / FeCr; заметно интереснее базовых HF, особенно в красивых дизайнах и японских версиях.',
      ux: 'Основные хромы Sony: UX / UX‑S стоят умеренно, UX‑Pro ближе к коллекционному уровню и часто дороже обычных UX.',
      'metal-es':
        'Топовые металлы, считаются одними из лучших по звуку и дизайну; цены сильно зависят от длины и конкретного рынка.',
      'metal-master':
        'Культовый керамический корпус; NOS‑экземпляры часто уходят по цене десятков евро за штуку и выше.',
    },
  },

  en: {
    heroTitle: 'BASF BOT',
    heroSubtitle: 'Cassette, CD & vinyl appraisal',
    menuAssessment: 'Appraise',
    menuCollection: 'Collections',
    menuRarity: 'Tables',
    menuReserve: 'Reserve',

    assessmentTitle: 'Cassette appraisal',
    assessmentChooseMethod: 'Choose appraisal method',
    assessmentByPhoto: 'Appraise from photo',
    assessmentManual: 'Enter data manually',

    photoTitle: 'Appraisal from photo',
    manualTitle: 'Manual data entry',
    resultTitle: 'Appraisal result',
    btnCalculate: 'Calculate',
    btnNew: 'Appraise again',

    rarityTitle: 'Rarity tables',
    rarityBrandAgfa: 'AGFA cassettes — series, rarity and typical prices',
    rarityBrandBasf: 'BASF cassettes — series, rarity and typical prices',
    rarityBrandDenon: 'Denon cassettes — series, rarity and typical prices',
    rarityBrandMaxell: 'Maxell cassettes — series, rarity and typical prices',
    rarityBrandSony: 'Sony cassettes — series, rarity and typical prices',
    rarityBrandTdk: 'TDK cassettes — series, rarity and typical prices',
    rarityNoteGeneric:
      'NOS prices are rough guides for sealed cassettes of standard length (60–90 min). ' +
      'For opened items, a ballpark is about 0.3× of the NOS price in good condition; ' +
      'for rare series the spread can be larger.',

    sonyDescriptions: {
      hf: 'Mass‑market ferric line; more interesting for nostalgia and full series sets than as an investment piece.',
      ucx: 'Early chrome / FeCr tapes, clearly more attractive than basic HF, especially in nice designs and Japanese releases.',
      ux: 'Main Sony chromes: UX / UX‑S are moderately priced, while UX‑Pro is closer to collector level and often pricier.',
      'metal-es':
        'Top metal tapes, considered among the best in both sound and design; prices vary strongly by length and market.',
      'metal-master':
        'Iconic ceramic‑shell blank; sealed copies often sell for dozens of euros per tape and above.',
    },
  },

  zh: {
    heroTitle: 'BASF BOT',
    heroSubtitle: 'Cassette, CD & vinyl appraisal',
    menuAssessment: 'Appraise',
    menuCollection: 'Collections',
    menuRarity: 'Tables',
    menuReserve: 'Reserve',
    assessmentTitle: 'Cassette appraisal',
    assessmentChooseMethod: 'Choose appraisal method',
    assessmentByPhoto: 'Appraise from photo',
    assessmentManual: 'Enter data manually',
    photoTitle: 'Appraisal from photo',
    manualTitle: 'Manual data entry',
    resultTitle: 'Appraisal result',
    btnCalculate: 'Calculate',
    btnNew: 'Appraise again',

    rarityTitle: 'Rarity tables',
    rarityBrandAgfa: 'AGFA cassettes — series, rarity and typical prices',
    rarityBrandBasf: 'BASF cassettes — series, rarity and typical prices',
    rarityBrandDenon: 'Denon cassettes — series, rarity and typical prices',
    rarityBrandMaxell: 'Maxell cassettes — series, rarity and typical prices',
    rarityBrandSony: 'Sony cassettes — series, rarity and typical prices',
    rarityBrandTdk: 'TDK cassettes — series, rarity and typical prices',
    rarityNoteGeneric:
      'NOS prices are rough guides for sealed cassettes of standard length (60–90 min). ' +
      'For opened items, a ballpark is about 0.3× of the NOS price in good condition; ' +
      'for rare series the spread can be larger.',
  },

  ja: {
    heroTitle: 'BASF BOT',
    heroSubtitle: 'Cassette, CD & vinyl appraisal',
    menuAssessment: 'Appraise',
    menuCollection: 'Collections',
    menuRarity: 'Tables',
    menuReserve: 'Reserve',
    assessmentTitle: 'Cassette appraisal',
    assessmentChooseMethod: 'Choose appraisal method',
    assessmentByPhoto: 'Appraise from photo',
    assessmentManual: 'Enter data manually',
    photoTitle: 'Appraisal from photo',
    manualTitle: 'Manual data entry',
    resultTitle: 'Appraisal result',
    btnCalculate: 'Calculate',
    btnNew: 'Appraise again',

    rarityTitle: 'Rarity tables',
    rarityBrandAgfa: 'AGFA cassettes — series, rarity and typical prices',
    rarityBrandBasf: 'BASF cassettes — series, rarity and typical prices',
    rarityBrandDenon: 'Denon cassettes — series, rarity and typical prices',
    rarityBrandMaxell: 'Maxell cassettes — series, rarity and typical prices',
    rarityBrandSony: 'Sony cassettes — series, rarity and typical prices',
    rarityBrandTdk: 'TDK cassettes — series, rarity and typical prices',
    rarityNoteGeneric:
      'NOS prices are rough guides for sealed cassettes of standard length (60–90 min). ' +
      'For opened items, a ballpark is about 0.3× of the NOS price in good condition; ' +
      'for rare series the spread can be larger.',
  },

  ko: {
    heroTitle: 'BASF BOT',
    heroSubtitle: 'Cassette, CD & vinyl appraisal',
    menuAssessment: 'Appraise',
    menuCollection: 'Collections',
    menuRarity: 'Tables',
    menuReserve: 'Reserve',
    assessmentTitle: 'Cassette appraisal',
    assessmentChooseMethod: 'Choose appraisal method',
    assessmentByPhoto: 'Appraise from photo',
    assessmentManual: 'Enter data manually',
    photoTitle: 'Appraisal from photo',
    manualTitle: 'Manual data entry',
    resultTitle: 'Appraisal result',
    btnCalculate: 'Calculate',
    btnNew: 'Appraise again',

    rarityTitle: 'Rarity tables',
    rarityBrandAgfa: 'AGFA cassettes — series, rarity and typical prices',
    rarityBrandBasf: 'BASF cassettes — series, rarity and typical prices',
    rarityBrandDenon: 'Denon cassettes — series, rarity and typical prices',
    rarityBrandMaxell: 'Maxell cassettes — series, rarity and typical prices',
    rarityBrandSony: 'Sony cassettes — series, rarity and typical prices',
    rarityBrandTdk: 'TDK cassettes — series, rarity and typical prices',
    rarityNoteGeneric:
      'NOS prices are rough guides for sealed cassettes of standard length (60–90 min). ' +
      'For opened items, a ballpark is about 0.3× of the NOS price in good condition; ' +
      'for rare series the spread can be larger.',
  },
};

// Простая система экранов
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

// --- ОБРАБОТЧИКИ ПОСЛЕ ЗАГРУЗКИ DOM ---
window.addEventListener('DOMContentLoaded', () => {
  // стартовый экран
  showScreen('screen-start');

  // --- ФУНКЦИЯ ПРИМЕНЕНИЯ ПЕРЕВОДА ---
  function applyLanguage(lang) {
    const t = translations[lang] || translations.ru;

    // Hero
    const heroTitleEl = document.querySelector('.hero-title');
    const heroSubtitleEl = document.querySelector('.hero-subtitle');
    if (heroTitleEl) heroTitleEl.textContent = t.heroTitle;
    if (heroSubtitleEl) heroSubtitleEl.textContent = t.heroSubtitle;

    // Нижнее меню
    const menuAssessment = document.querySelector(
      '.bottom-menu .menu-item[data-section="assessment"] .menu-label',
    );
    const menuCollection = document.querySelector(
      '.bottom-menu .menu-item[data-section="collection"] .menu-label',
    );
    const menuRarity = document.querySelector(
      '.bottom-menu .menu-item[data-section="rarity"] .menu-label',
    );
    const menuReserve = document.querySelector(
      '.bottom-menu .menu-item[data-section="reserve"] .menu-label',
    );

    if (menuAssessment) menuAssessment.textContent = t.menuAssessment;
    if (menuCollection) menuCollection.textContent = t.menuCollection;
    if (menuRarity) menuRarity.textContent = t.menuRarity;
    if (menuReserve) menuReserve.textContent = t.menuReserve;

    // Заголовки экранов
    const assessmentTitle = document.querySelector(
      '#screen-assessment .header h2',
    );
    const photoTitle = document.querySelector(
      '#screen-input-photo .header h2',
    );
    const manualTitle = document.querySelector(
      '#screen-input-manual .header h2',
    );
    const resultTitle = document.querySelector('#screen-result .header h2');

    if (assessmentTitle) assessmentTitle.textContent = t.assessmentTitle;
    if (photoTitle) photoTitle.textContent = t.photoTitle;
    if (manualTitle) manualTitle.textContent = t.manualTitle;
    if (resultTitle) resultTitle.textContent = t.resultTitle;

    // Текст внутри экрана выбора способа
    const assessmentChooseMethod = document.querySelector(
      '#screen-assessment .field span',
    );
    const btnPhoto = document.querySelector(
      '#screen-assessment [data-action="photo"]',
    );
    const btnManual = document.querySelector(
      '#screen-assessment [data-action="manual"]',
    );

    if (assessmentChooseMethod)
      assessmentChooseMethod.textContent = t.assessmentChooseMethod;
    if (btnPhoto) btnPhoto.textContent = t.assessmentByPhoto;
    if (btnManual) btnManual.textContent = t.assessmentManual;

    // Кнопки "Рассчитать" и "Оценить ещё"
    const btnCalcPhoto = document.getElementById('btn-calc-photo');
    const btnCalcManual = document.getElementById('btn-calc-manual');
    const btnNew = document.getElementById('btn-new');

    if (btnCalcPhoto) btnCalcPhoto.textContent = t.btnCalculate;
    if (btnCalcManual) btnCalcManual.textContent = t.btnCalculate;
    if (btnNew) btnNew.textContent = t.btnNew;

    // --- Таблицы редкости ---
    const rarityHeader = document.querySelector('#screen-rarity .header h2');
    if (rarityHeader) rarityHeader.textContent = t.rarityTitle;

    const agfaTitle = document.querySelector(
      '.brand-table[data-brand="agfa"] > span',
    );
    const basfTitle = document.querySelector(
      '.brand-table[data-brand="basf"] > span',
    );
    const denonTitle = document.querySelector(
      '.brand-table[data-brand="denon"] > span',
    );
    const maxellTitle = document.querySelector(
      '.brand-table[data-brand="maxell"] > span',
    );
    const sonyTitle = document.querySelector(
      '.brand-table[data-brand="sony"] > span',
    );
    const tdkTitle = document.querySelector(
      '.brand-table[data-brand="tdk"] > span',
    );

    if (agfaTitle) agfaTitle.textContent = t.rarityBrandAgfa;
    if (basfTitle) basfTitle.textContent = t.rarityBrandBasf;
    if (denonTitle) denonTitle.textContent = t.rarityBrandDenon;
    if (maxellTitle) maxellTitle.textContent = t.rarityBrandMaxell;
    if (sonyTitle) sonyTitle.textContent = t.rarityBrandSony;
    if (tdkTitle) tdkTitle.textContent = t.rarityBrandTdk;

    const rarityNotes = document.querySelectorAll('#screen-rarity .rarity-note');
    rarityNotes.forEach((note) => {
      note.textContent = t.rarityNoteGeneric;
    });

    if (t.sonyDescriptions) {
      const sonyRows = document.querySelectorAll(
        '.brand-table[data-brand="sony"] .rarity-row',
      );

      sonyRows.forEach((row) => {
        const seriesKey = row.dataset.series;
        const descEl = row.querySelector('.rarity-desc');
        if (!seriesKey || !descEl) return;
        const text = t.sonyDescriptions[seriesKey];
        if (text) descEl.textContent = text;
      });
    }
  }

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
    applyLanguage(langCode);
  }

  if (langToggle && langDropdown) {
    langToggle.addEventListener('click', () => {
      const isOpen = langDropdown.classList.contains('open');
      langDropdown.classList.toggle('open', !isOpen);
      langToggle.classList.toggle('open', !isOpen);
    });

    langOptions.forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.lang;
        const label = btn.textContent.split('—')[0].trim();
        setLang(code, label);
        langDropdown.classList.remove('open');
        langToggle.classList.remove('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!langDropdown.contains(e.target) && e.target !== langToggle) {
        langDropdown.classList.remove('open');
        langToggle.classList.remove('open');
      }
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

  // --- ЭКРАН РЕЗЕРВА / ОПЛАТЫ ---
  const backReserve = document.getElementById('btn-back-from-reserve');
  const btnCryptoBot = document.getElementById('btn-reserve-crypto-bot');
  const galaInfoEl = document.getElementById('gala-payment-instruction');
  const btnGalaRefresh = document.getElementById('btn-gala-refresh');
  const btnGalaCheck = document.getElementById('btn-gala-check');

  async function loadGalaPaymentDetails() {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const userId = tgUser?.id || null;

    const res = await fetch('http://localhost:3000/api/gala/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) throw new Error('Gala payment intent error');
    const data = await res.json();

    galaInfoEl.textContent =
      `Отправь ${data.amount} ${data.tokenSymbol} на адрес ${data.address}` +
      (data.memo ? ` c примечанием (memo): ${data.memo}` : '');
    window._galaDetailsLoaded = true;
  }

  if (backReserve) {
    backReserve.addEventListener('click', () => {
      showScreen('screen-start');
      setActiveMenu('assessment');
    });
  }

  btnGalaRefresh?.addEventListener('click', () => {
    loadGalaPaymentDetails().catch(() => {
      galaInfoEl.textContent =
        'Не удалось получить реквизиты GalaChain. Попробуй позже.';
    });
  });

  btnGalaCheck?.addEventListener('click', async () => {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const userId = tgUser?.id || null;

    const res = await fetch('http://localhost:3000/api/gala/check-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      alert('Ошибка проверки платежа GalaChain, попробуй позже.');
      return;
    }

    const data = await res.json();
    if (data.paid) {
      alert('Оплата в GalaChain найдена, PRO активирован!');
    } else {
      alert(
        'Платёж пока не найден. Если ты только что отправил, подожди 1–2 минуты и нажми проверить снова.',
      );
    }
  });

  btnCryptoBot?.addEventListener('click', async () => {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const userId = tgUser?.id || null;

    const res = await fetch(
      'http://localhost:3000/api/cryptobot/create-invoice',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      },
    );

    if (!res.ok) {
      alert('Не удалось создать счёт в Crypto Bot. Попробуй позже.');
      return;
    }

    const data = await res.json();
    if (data.payUrl) {
      if (window.Telegram?.WebApp?.openLink) {
        window.Telegram.WebApp.openLink(data.payUrl);
      } else {
        window.open(data.payUrl, '_blank');
      }
    } else {
      alert('Сервис вернул некорректный ответ по Crypto Bot.');
    }
  });

  // клики по нижнему меню
  menuItems.forEach((item) => {
    const section = item.dataset.section;

    item.addEventListener('click', () => {
      if (section === 'assessment') {
        showScreen('screen-assessment');
        setActiveMenu('assessment');
      } else if (section === 'collection') {
        alert('Раздел "Моя коллекция" появится позже.');
        setActiveMenu('collection');
      } else if (section === 'rarity') {
        showScreen('screen-rarity');
        setActiveMenu('rarity');
        const brandSwitcher = document.querySelector('.brand-switcher');
        if (brandSwitcher) {
          brandSwitcher.classList.add('brand-switcher--hidden');
          requestAnimationFrame(() => {
            setTimeout(() => {
              brandSwitcher.classList.remove('brand-switcher--hidden');
            }, 30);
          });
        }
      } else if (section === 'reserve') {
        showScreen('screen-reserve');
        setActiveMenu('reserve');
        if (!window._galaDetailsLoaded) {
          loadGalaPaymentDetails().catch(console.error);
        }
      }
    });
  });

  // --- ВЫБОР СПОСОБА ОЦЕНКИ ---
  const photoBtn = document.querySelector(
    '#screen-assessment [data-action="photo"]',
  );
  const manualBtn = document.querySelector(
    '#screen-assessment [data-action="manual"]',
  );

  if (photoBtn) {
    photoBtn.addEventListener('click', () => {
      showScreen('screen-input-photo');
    });
  }

  if (manualBtn) {
    manualBtn.addEventListener('click', () => {
      showScreen('screen-input-manual');
    });
  }

  const backAssessment = document.getElementById('btn-back-from-assessment');
  if (backAssessment) {
    backAssessment.addEventListener('click', () => {
      showScreen('screen-start');
      setActiveMenu('assessment');
    });
  }

  // --- КНОПКА НАЗАД ИЗ ТАБЛИЦ ---
  const backRarity = document.getElementById('btn-back-from-rarity');
  if (backRarity) {
    backRarity.addEventListener('click', () => {
      showScreen('screen-start');
      setActiveMenu('assessment');
    });
  }

  // --- ПЕРЕКЛЮЧЕНИЕ БРЕНДОВ В ТАБЛИЦАХ ---
  const brandChips = document.querySelectorAll('.brand-chip');
  const brandTables = document.querySelectorAll('.brand-table');

  function showBrand(brand) {
    brandChips.forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.brand === brand);
    });

    brandTables.forEach((block) => {
      block.style.display = block.dataset.brand === brand ? 'block' : 'none';
    });
  }

  const brandOrder = Array.from(brandChips)
    .filter((chip) => !chip.disabled)
    .map((chip) => chip.dataset.brand);

  if (brandChips.length) {
    brandChips.forEach((chip) => {
      if (chip.disabled) return;
      chip.addEventListener('click', () => {
        const brand = chip.dataset.brand;
        showBrand(brand);
      });
    });

    const initialActiveChip = document.querySelector('.brand-chip.active');
    const initialBrand =
      initialActiveChip?.dataset.brand || brandOrder[0] || 'sony';

    showBrand(initialBrand);
  }

  // --- Свайп брендов ---
  const rarityScreen = document.getElementById('screen-rarity');
  if (rarityScreen && brandOrder.length > 1) {
    let touchStartX = 0;
    let touchStartY = 0;

    rarityScreen.addEventListener(
      'touchstart',
      (e) => {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      },
      { passive: true },
    );

    rarityScreen.addEventListener(
      'touchend',
      (e) => {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;

        const minSwipe = 40;

        if (Math.abs(dx) < minSwipe || Math.abs(dx) < Math.abs(dy)) {
          return;
        }

        const activeChip = document.querySelector('.brand-chip.active');
        if (!activeChip) return;

        const currentBrand = activeChip.dataset.brand;
        const currentIndex = brandOrder.indexOf(currentBrand);
        if (currentIndex === -1) return;

        let nextIndex = currentIndex;

        if (dx < 0) {
          nextIndex = Math.min(brandOrder.length - 1, currentIndex + 1);
        } else {
          nextIndex = Math.max(0, currentIndex - 1);
        }

        const nextBrand = brandOrder[nextIndex];
        if (nextBrand && nextBrand !== currentBrand) {
          showBrand(nextBrand);
        }
      },
      { passive: true },
    );
  }

  // --- КНОПКИ "РАССЧИТАТЬ" ---
  document
    .getElementById('btn-calc-photo')
    ?.addEventListener('click', onCalcPhoto);

  document
    .getElementById('btn-calc-manual')
    ?.addEventListener('click', onCalcManual);
});

// ==== onCalcPhoto / onCalcManual ====
async function onCalcPhoto() {
  const artistTitle =
    document.getElementById('input-artist-title')?.value || '';
  const mediaType =
    document.getElementById('select-media')?.value || 'cassette';

  const gradeBtn = document.querySelector('#grade-buttons button.selected');
  const grade = gradeBtn ? gradeBtn.dataset.grade : null;
  state.gradePhoto = grade;

  const payload = {
    mode: 'photo',
    artistTitle,
    mediaType,
    grade,
  };

  try {
    const res = await fetch(API_URL_FOR_CASSETTE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    showResult(data);
  } catch (err) {
    showResult({ error: 'Ошибка запроса к API' });
  }
}

async function onCalcManual() {
  const artistTitle =
    document.getElementById('input-artist-title-manual')?.value || '';
  const mediaType =
    document.getElementById('select-media-manual')?.value || 'cassette';

  const gradeBtn = document.querySelector(
    '#grade-buttons-manual button.selected',
  );
  const grade = gradeBtn ? gradeBtn.dataset.grade : null;
  state.gradeManual = grade;

  const payload = {
    mode: 'manual',
    artistTitle,
    mediaType,
    grade,
  };

  try {
    const res = await fetch(API_URL_FOR_CASSETTE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    showResult(data);
  } catch (err) {
    showResult({ error: 'Ошибка запроса к API' });
  }
}

function showResult(data) {
  const resultEl = document.getElementById('result-text');
  if (!resultEl) return;

  if (data && typeof data === 'object' && !data.error) {
    resultEl.textContent = JSON.stringify(data, null, 2);
  } else {
    resultEl.textContent =
      data.error || 'Не удалось получить результат оценки.';
  }

  showScreen('screen-result');

  const btnNew = document.getElementById('btn-new');
  if (btnNew && !btnNew._bound) {
    btnNew.addEventListener('click', () => {
      showScreen('screen-assessment');
    });
    btnNew._bound = true;
  }
}