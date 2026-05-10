// ==== НАСТРОЙКА API ====
const API_URL_FOR_CASSETTE = 'http://localhost:3000/analyze';

// --- ЛОКАЛИЗАЦИЯ ---
const translations = {
  /* ... твой объект translations без изменений ... */
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

// ===== НОВОЕ: универсальная функция получения userId из Telegram =====
function getTelegramUserId() {
  const tg = window.Telegram?.WebApp;
  const user = tg?.initDataUnsafe?.user;
  console.log('Telegram WebApp user =', user);
  // Для чистого браузера оставим тестовый id, чтобы не было null
  return user?.id || 123456789;
}

// --- ОБРАБОТЧИКИ ПОСЛЕ ЗАГРУЗКИ DOM ---
window.addEventListener('DOMContentLoaded', () => {
  // стартовый экран
  showScreen('screen-start');

  // --- ФУНКЦИЯ ПРИМЕНЕНИЯ ПЕРЕВОДА ---
  function applyLanguage(lang) {
    const t = translations[lang] || translations.ru;
    // ... ВЕСЬ ТВОЙ applyLanguage БЕЗ ИЗМЕНЕНИЙ ...
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
    // ... весь твой код переключателя языка без изменений ...
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
  const btnCryptomus = document.getElementById('btn-reserve-cryptomus');

  // Cryptomus
  if (btnCryptomus) {
    btnCryptomus.addEventListener('click', async () => {
      const userId = getTelegramUserId();
      console.log('Cryptomus userId before fetch =', userId);

      if (!userId) {
        alert(
          'Не удалось определить userId. Открой мини‑апп из Telegram, а не из браузера.'
        );
        return;
      }

      const res = await fetch(
        'http://localhost:3000/api/cryptomus/create-payment',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        }
      );

      console.log('Cryptomus create-payment HTTP status =', res.status);

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.log('Cryptomus error body =', errText);
        alert('Не удалось создать счёт в Cryptomus. Попробуй позже.');
        return;
      }

      const data = await res.json();
      console.log('Cryptomus create-payment data =', data);

      if (!data.payUrl) {
        alert('Некорректный ответ от Cryptomus.');
        return;
      }

      const url = data.payUrl;
      console.log('Opening Cryptomus payUrl =', url);

      const tg = window.Telegram?.WebApp;
      if (tg?.openLink) {
        tg.openLink(url);
      } else {
        window.open(url, '_blank');
      }
    });
  }

  // ===== Gala ВРЕМЕННО ОТКЛЮЧАЕМ, ЧТОБЫ НЕ БЫЛО 404 =====
  async function loadGalaPaymentDetails() {
    console.log('Gala payment: not implemented yet');
    if (galaInfoEl) {
      galaInfoEl.textContent =
        'GalaChain-оплата пока в разработке. Используй кнопку Crypto Bot.';
    }
    window._galaDetailsLoaded = true;
  }

  if (backReserve) {
    backReserve.addEventListener('click', () => {
      showScreen('screen-start');
      setActiveMenu('assessment');
    });
  }

  if (btnGalaRefresh) {
    btnGalaRefresh.addEventListener('click', () => {
      loadGalaPaymentDetails().catch(() => {
        if (galaInfoEl) {
          galaInfoEl.textContent =
            'Не удалось получить реквизиты GalaChain. Попробуй позже.';
        }
      });
    });
  }

  if (btnGalaCheck) {
    btnGalaCheck.addEventListener('click', async () => {
      alert('Проверка платежа GalaChain появится в следующих версиях.');
    });
  }

  // ===== обработчик кнопки Crypto Bot через getTelegramUserId =====
  if (btnCryptoBot) {
    btnCryptoBot.addEventListener('click', async () => {
      const userId = getTelegramUserId();
      console.log('userId before fetch =', userId);

      if (!userId) {
        alert(
          'Не удалось определить userId. Открой мини‑апп из Telegram, а не из браузера.'
        );
        return;
      }

      const res = await fetch(
        'http://localhost:3000/api/cryptobot/create-invoice',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        }
      );

      console.log('create-invoice HTTP status =', res.status);

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.log('create-invoice error body =', errText);
        alert('Не удалось создать счёт в Crypto Bot. Попробуй позже.');
        return;
      }

      const data = await res.json();
      console.log('create-invoice data =', data);

      if (!data.payUrl) {
        alert('Сервис вернул некорректный ответ по Crypto Bot.');
        return;
      }

      const url = data.payUrl;
      console.log('Opening payUrl =', url);

      const urlEl = document.getElementById('crypto-pay-url');
      console.log('crypto-pay-url element =', urlEl);
      if (urlEl) {
        urlEl.textContent = url;
        urlEl.style.cursor = 'pointer';
        urlEl.onclick = () => window.open(url, '_blank');
      }

      const tg = window.Telegram?.WebApp;

      if (tg?.openInvoice) {
        tg.openInvoice(url, (status) => {
          console.log('openInvoice status =', status);
        });
        return;
      }

      if (tg?.openLink) {
        tg.openLink(url);
        return;
      }

      window.open(url, '_blank');
    });
  }

  // --- КЛИКИ ПО НИЖНЕМУ МЕНЮ ---
  menuItems.forEach((item) => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      console.log('MENU click =', section);

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
    '#screen-assessment [data-action="photo"]'
  );
  const manualBtn = document.querySelector(
    '#screen-assessment [data-action="manual"]'
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
    // переключаем активный чип
    brandChips.forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.brand === brand);
    });

    // показываем только нужную таблицу
    brandTables.forEach((table) => {
      if (table.dataset.brand === brand) {
        table.style.display = 'block';
      } else {
        table.style.display = 'none';
      }
    });
  }

  // обработчики клика по чипам
  brandChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const brand = chip.dataset.brand;
      showBrand(brand);
    });
  });

  // при первом входе в таблицы показываем Sony (или любой стартовый бренд)
  showBrand('sony');

  // --- КНОПКИ "РАССЧИТАТЬ" (пока закомментированы) ---
  /*
  document
    .getElementById('btn-calc-photo')
    ?.addEventListener('click', onCalcPhoto);

  document
    .getElementById('btn-calc-manual')
    ?.addEventListener('click', onCalcManual);
  */
}); // конец window.addEventListener('DOMContentLoaded', ...)