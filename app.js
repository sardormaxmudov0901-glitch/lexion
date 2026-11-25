// Flippy — Faqat O'zim Kiritgan Lug'atlarni Yodlash Tizimi
// Barcha darajalar olib tashlandi, sof shaxsiy lug'at va 10 ta kartali mashq

(function() {
  'use strict';

  // --- BIRLAMCHI NAMUNAVIY SO'ZLAR (Foydalanuvchi xohlagancha o'chirishi yoki yangisini qo'shishi mumkin) ---
  const defaultStarterWords = [
    { id: 1, word: "Apple", uz: "Olma", ru: "Яблоко", example: "I eat an apple every day." },
    { id: 2, word: "Book", uz: "Kitob", ru: "Книга", example: "This book is very interesting." },
    { id: 3, word: "Water", uz: "Suv", ru: "Вода", example: "Drink plenty of clean water." },
    { id: 4, word: "Family", uz: "Oila", ru: "Семья", example: "I love my family." },
    { id: 5, word: "Friend", uz: "Do'st", ru: "Друг", example: "He is my best friend." },
    { id: 6, word: "School", uz: "Maktab", ru: "Школа", example: "We go to school together." },
    { id: 7, word: "Sun", uz: "Quyosh", ru: "Солнце", example: "The sun is shining brightly." },
    { id: 8, word: "Happy", uz: "Baxtli / Xursand", ru: "Счастливый", example: "The children are very happy." },
    { id: 9, word: "House", uz: "Uy", ru: "Дом", example: "Our house is warm and cozy." },
    { id: 10, word: "Bread", uz: "Non", ru: "Хлеб", example: "Hot bread smells delicious." },
    { id: 11, word: "Star", uz: "Yulduz", ru: "Звезда", example: "Stars light up the night sky." },
    { id: 12, word: "Flower", uz: "Gul", ru: "Цветок", example: "A beautiful flower in the garden." }
  ];

  // --- STATE ---
  let myWords = loadMyWords();
  let sessionWords = [];
  let currentIndex = 0;
  let isCardFlipped = false;
  let sessionScore = 0;
  let sessionMissedWords = [];
  let dictSearchQuery = '';

  let speechRate = 0.70; // Bolalar uchun sekin, cho'zibroq talaffuz
  let isSlowVoice = true;

  let theme = localStorage.getItem('flippy_theme') || 'light';
  let user = JSON.parse(localStorage.getItem('flippy_user') || 'null');
  let currentVerificationCode = null;

  // Lug'atni saqlash va o'qish
  function loadMyWords() {
    const data = localStorage.getItem('flippy_my_words');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Lug'atni o'qishda xatolik:", e);
      }
    }
    // Agar birinchi marta kirayotgan bo'lsa
    localStorage.setItem('flippy_my_words', JSON.stringify(defaultStarterWords));
    return defaultStarterWords;
  }

  function saveMyWords() {
    localStorage.setItem('flippy_my_words', JSON.stringify(myWords));
  }

  // --- AUDIO VA SOUND EFFECTS (Web Audio API) ---
  const audioCtx = (window.AudioContext || window.webkitAudioContext) ? new (window.AudioContext || window.webkitAudioContext)() : null;

  function playTone(freq, type, duration, delay = 0) {
    if (!audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      setTimeout(() => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      }, delay);
    } catch (e) {
      console.warn("Audio xatolik:", e);
    }
  }

  function soundFlip() { playTone(340, 'sine', 0.12); }
  function soundKnown() {
    playTone(523.25, 'triangle', 0.1, 0);
    playTone(659.25, 'triangle', 0.18, 90);
  }
  function soundMissed() {
    playTone(329.63, 'sawtooth', 0.12, 0);
    playTone(261.63, 'sawtooth', 0.2, 100);
  }
  function soundVictory() {
    playTone(440, 'triangle', 0.12, 0);
    playTone(554.37, 'triangle', 0.12, 110);
    playTone(659.25, 'triangle', 0.12, 220);
    playTone(880, 'triangle', 0.35, 330);
  }

  // --- TALAFFUZ (Cho'zib / Sekin aytish) ---
  function speakWord(text, lang = 'en-US') {
    if (!('speechSynthesis' in window)) {
      alert("Brauzeringizda nutq sintezi mavjud emas.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = speechRate;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }

  function toggleVoiceSpeed() {
    isSlowVoice = !isSlowVoice;
    speechRate = isSlowVoice ? 0.70 : 1.0;
    updateVoiceSpeedButtonText();
    const currentWord = sessionWords[currentIndex];
    if (currentWord) {
      speakWord(currentWord.word, 'en-US');
    }
  }

  function updateVoiceSpeedButtonText() {
    const btn = document.getElementById('btnSpeedToggle');
    if (!btn) return;
    if (isSlowVoice) {
      btn.textContent = '🐢 Sekin (Cho\'zib)';
      btn.classList.add('slow');
    } else {
      btn.textContent = '⚡ Oddiy tezlik';
      btn.classList.remove('slow');
    }
  }

  // --- CONFETTI ---
  function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

    for (let i = 0; i < 90; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height * 0.5,
        size: Math.random() * 9 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 4 + 2,
        speedX: Math.random() * 4 - 2,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 8 - 4
      });
    }

    let frames = 0;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      frames++;
      if (frames < 200) {
        requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    render();
  }

  // --- AKKAUNT VA KOD VERIFIKATSIYASI ---
  function checkUserAuth() {
    if (!user) {
      openAuthModal();
    } else {
      renderUserProfile();
    }
  }

  function openAuthModal() {
    document.getElementById('authModal').classList.add('active');
  }

  function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
  }

  function handleDirectLogin(e) {
    e.preventDefault();
    const firstName = document.getElementById('userFirstName').value.trim();
    const lastName = document.getElementById('userLastName').value.trim();
    const day = parseInt(document.getElementById('userBirthDay').value, 10);
    const month = parseInt(document.getElementById('userBirthMonth').value, 10);
    const year = parseInt(document.getElementById('userBirthYear').value, 10);

    if (!firstName || !lastName || !day || !month || !year) {
      alert("Please fill in your Name, Last Name, and Date of Birth!");
      return;
    }

    // Tug'ilgan sanadan yoshni aniq hisoblash
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 0) age = 0;

    const birthDateFormatted = `${day}.${month < 10 ? '0' + month : month}.${year}`;

    user = {
      firstName: firstName,
      lastName: lastName,
      birthDay: day,
      birthMonth: month,
      birthYear: year,
      birthDateFormatted: birthDateFormatted,
      age: age,
      stars: 20,
      streak: 1,
      xp: 0,
      level: 1
    };

    localStorage.setItem('flippy_user', JSON.stringify(user));
    closeAuthModal();
    soundVictory();
    launchConfetti();
    renderUserProfile();
    startStudySession();
  }

  function renderUserProfile() {
    if (!user) return;
    document.getElementById('userBar').style.display = 'flex';
    document.getElementById('userAvatarInitial').textContent = user.firstName.charAt(0).toUpperCase();
    document.getElementById('userFullName').textContent = `${user.firstName} ${user.lastName}`;
    
    const birthInfo = user.birthDateFormatted ? ` (${user.birthDateFormatted})` : '';
    document.getElementById('userAgeBadge').textContent = `${user.age} yosh${birthInfo}`;
    document.getElementById('userStarsCount').textContent = user.stars || 0;
    document.getElementById('userStreakCount').textContent = `${user.streak || 1} kun`;
    document.getElementById('userXpCount').textContent = `${user.xp || 0} XP`;
  }

  function addReward(xpGained, starsGained) {
    if (!user) return;
    user.xp = (user.xp || 0) + xpGained;
    user.stars = (user.stars || 0) + starsGained;
    localStorage.setItem('flippy_user', JSON.stringify(user));
    renderUserProfile();
  }

  function logoutUser() {
    if (confirm("Haqiqatan ham chiqmoqchimisiz?")) {
      localStorage.removeItem('flippy_user');
      user = null;
      document.getElementById('userBar').style.display = 'none';
      openAuthModal();
    }
  }

  // --- KARTALAR BILAN YODLASH MASHQI (Faqat o'z kiritgan so'zlar) ---
  function startStudySession(customList = null) {
    if (customList && customList.length > 0) {
      sessionWords = [...customList];
    } else {
      if (myWords.length === 0) {
        // So'z yo'q bo'lsa
        document.getElementById('emptyWordsNotice').style.display = 'block';
        document.getElementById('activeStudyContainer').style.display = 'none';
        document.getElementById('resultScreen').style.display = 'none';
        document.getElementById('dictionaryScreen').style.display = 'none';
        return;
      }

      // O'z so'zlarimizdan 10 tasini aralashtirib olish
      const shuffled = [...myWords].sort(() => 0.5 - Math.random());
      sessionWords = shuffled.slice(0, 10);
    }

    document.getElementById('emptyWordsNotice').style.display = 'none';
    document.getElementById('activeStudyContainer').style.display = 'flex';
    document.getElementById('studyScreen').style.display = 'flex';
    document.getElementById('resultScreen').style.display = 'none';
    document.getElementById('dictionaryScreen').style.display = 'none';

    currentIndex = 0;
    sessionScore = 0;
    sessionMissedWords = [];
    isCardFlipped = false;

    renderCurrentCard();
  }

  function renderCurrentCard() {
    const cardEl = document.getElementById('flashcard');
    if (!cardEl) return;

    cardEl.classList.remove('flipped');
    isCardFlipped = false;

    const currentWord = sessionWords[currentIndex];
    if (!currentWord) return;

    const currentNum = currentIndex + 1;
    const totalNum = sessionWords.length;
    document.getElementById('progressText').textContent = `Karta: ${currentNum} / ${totalNum}`;
    document.getElementById('progressFill').style.width = `${(currentNum / totalNum) * 100}%`;

    // Old tomoni
    document.getElementById('cardMainWord').textContent = currentWord.word;
    document.getElementById('cardPhonetic').textContent = `[${currentWord.word.toLowerCase()}]`;
    document.getElementById('cardExample').textContent = currentWord.example ? `"${currentWord.example}"` : `Learn "${currentWord.word}" with Flippy.`;

    // Orqa tomoni
    document.getElementById('cardUzTranslation').textContent = currentWord.uz;
    document.getElementById('cardRuTranslation').textContent = currentWord.ru || currentWord.uz;
    document.getElementById('cardExampleUz').textContent = currentWord.exampleUz || currentWord.example || '';
    document.getElementById('cardExampleRu').textContent = currentWord.exampleRu || '';

    updateVoiceSpeedButtonText();

    document.getElementById('btnSpeakFront').onclick = (e) => {
      e.stopPropagation();
      speakWord(currentWord.word, 'en-US');
    };
  }

  function flipCard() {
    const cardEl = document.getElementById('flashcard');
    if (!cardEl) return;
    isCardFlipped = !isCardFlipped;
    cardEl.classList.toggle('flipped', isCardFlipped);
    soundFlip();
  }

  function handleAnswerKnown() {
    soundKnown();
    sessionScore++;
    addReward(10, 1);
    nextCard();
  }

  function handleAnswerMissed() {
    soundMissed();
    const currentWord = sessionWords[currentIndex];
    if (currentWord && !sessionMissedWords.some(w => w.id === currentWord.id)) {
      sessionMissedWords.push(currentWord);
    }
    nextCard();
  }

  function nextCard() {
    currentIndex++;
    if (currentIndex < sessionWords.length) {
      renderCurrentCard();
    } else {
      finishRound();
    }
  }

  function finishRound() {
    document.getElementById('studyScreen').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'block';

    const total = sessionWords.length;
    document.getElementById('scoreNum').textContent = `${sessionScore} / ${total}`;

    if (sessionScore >= 7) {
      soundVictory();
      launchConfetti();
      addReward(50, 5);
    } else {
      soundKnown();
    }

    const missedSection = document.getElementById('missedWordsSection');
    const missedList = document.getElementById('missedWordsList');
    const perfectBanner = document.getElementById('perfectScoreBanner');
    const btnReviewMissed = document.getElementById('btnReviewMissed');

    if (sessionMissedWords.length > 0) {
      perfectBanner.style.display = 'none';
      missedSection.style.display = 'block';
      btnReviewMissed.style.display = 'inline-flex';
      missedList.innerHTML = '';

      sessionMissedWords.forEach(w => {
        const item = document.createElement('div');
        item.className = 'missed-word-card';
        item.innerHTML = `
          <div style="display:flex; flex-direction:column;">
            <span style="font-size:1.15rem; font-weight:900;">
              ${w.word}
            </span>
            <span style="font-size:0.88rem; color:var(--text-muted);">
              🇺🇿 ${w.uz} &nbsp;|&nbsp; 🇷🇺 ${w.ru || w.uz}
            </span>
          </div>
          <button class="btn-speaker" style="width:36px; height:36px; font-size:1rem;" title="Talaffuzni eshitish">🔊</button>
        `;
        item.querySelector('.btn-speaker').onclick = (e) => {
          e.stopPropagation();
          speakWord(w.word, 'en-US');
        };
        missedList.appendChild(item);
      });
    } else {
      missedSection.style.display = 'none';
      perfectBanner.style.display = 'block';
      btnReviewMissed.style.display = 'none';
    }
  }

  // --- MENING LUG'ATIM (Ro'yxat, Qo'shish, O'chirish va Qidiruv) ---
  function renderMyDictionary() {
    const grid = document.getElementById('dictGrid');
    if (!grid) return;

    const query = dictSearchQuery.trim().toLowerCase();
    const filtered = myWords.filter(item => {
      return !query ||
        item.word.toLowerCase().includes(query) ||
        item.uz.toLowerCase().includes(query) ||
        (item.ru && item.ru.toLowerCase().includes(query));
    });

    document.getElementById('dictCount').textContent = `(Jami: ${myWords.length} ta so'zingiz bor)`;
    grid.innerHTML = '';

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 2.5rem; color: var(--text-muted);">
          <div style="font-size:2rem; margin-bottom:0.5rem;">🔍</div>
          ${query ? "Qidiruv bo'yicha so'z topilmadi." : "Sizda hali so'zlar yo'q. Yuqoridagi '+ Yangi so'z qo'shish' tugmasini bosing!"}
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'dict-card';
      card.innerHTML = `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
            <span style="font-size:1.25rem; font-weight:900; display:flex; align-items:center; gap:0.4rem;">
              ${item.word}
              <button class="btn-speaker" style="width:28px; height:28px; font-size:0.85rem;" title="Talaffuz">🔊</button>
            </span>
            <button class="btn-delete-word" title="Ushbu so'zni o'chirish" style="background:none; border:none; font-size:1.1rem; cursor:pointer; color:#ef4444; padding:0.2rem 0.4rem; border-radius:6px;">
              🗑️
            </button>
          </div>
          <div style="margin-bottom:0.25rem; font-size:0.95rem;">
            <strong>🇺🇿 O'zbekcha:</strong> ${item.uz}
          </div>
          <div style="margin-bottom:0.25rem; font-size:0.95rem; color:#0284c7;">
            <strong>🇷🇺 Ruscha:</strong> ${item.ru || item.uz}
          </div>
          ${item.example ? `
            <div style="font-size:0.8rem; color:var(--text-muted); font-style:italic; margin-top:0.3rem; border-left:2px solid var(--primary-light); padding-left:0.5rem;">
              "${item.example}"
            </div>
          ` : ''}
        </div>
      `;

      // Audio eshitish
      card.querySelector('.btn-speaker').onclick = (e) => {
        e.stopPropagation();
        speakWord(item.word, 'en-US');
      };

      // O'chirish
      card.querySelector('.btn-delete-word').onclick = (e) => {
        e.stopPropagation();
        deleteWord(item.id);
      };

      grid.appendChild(card);
    });
  }

  function deleteWord(id) {
    if (confirm("Ushbu so'zni lug'atingizdan o'chirmoqchimisiz?")) {
      myWords = myWords.filter(w => w.id !== id);
      saveMyWords();
      renderMyDictionary();
    }
  }

  // --- SO'Z QO'SHISH MODALLARI ---
  function openAddSingleModal() {
    document.getElementById('addWordModal').classList.add('active');
  }

  function closeAddSingleModal() {
    document.getElementById('addWordModal').classList.remove('active');
    document.getElementById('addWordForm').reset();
  }

  function saveSingleCustomWord(e) {
    e.preventDefault();
    const en = document.getElementById('newWordEn').value.trim();
    const uz = document.getElementById('newWordUz').value.trim();
    const ru = document.getElementById('newWordRu').value.trim();
    const ex = document.getElementById('newWordExample').value.trim();

    if (!en || !uz) {
      alert("Iltimos, kamida Inglizcha va O'zbekcha so'zlarni kiriting!");
      return;
    }

    const newObj = {
      id: Date.now(),
      word: en,
      uz: uz,
      ru: ru || uz,
      example: ex || `Learn ${en} with Flippy.`
    };

    myWords.unshift(newObj);
    saveMyWords();
    closeAddSingleModal();
    soundVictory();
    addReward(20, 2);
    renderMyDictionary();
    alert("Yangi so'z muvaffaqiyatli saqlandi! 🎉");
  }

  function openBulkModal() {
    document.getElementById('bulkWordModal').classList.add('active');
  }

  function closeBulkModal() {
    document.getElementById('bulkWordModal').classList.remove('active');
    document.getElementById('bulkWordsTextarea').value = '';
  }

  function saveBulkWords(e) {
    e.preventDefault();
    const text = document.getElementById('bulkWordsTextarea').value.trim();
    if (!text) {
      alert("Iltimos, so'zlar ro'yxatini kiriting!");
      return;
    }

    const lines = text.split('\n');
    let addedCount = 0;

    lines.forEach((line, index) => {
      const parts = line.split(/[-–—=,;]/).map(p => p.trim());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        const en = parts[0];
        const uz = parts[1];
        const ru = parts[2] || parts[1];

        const newObj = {
          id: Date.now() + index,
          word: en,
          uz: uz,
          ru: ru,
          example: `Learn '${en}' in Flippy.`
        };
        myWords.unshift(newObj);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      saveMyWords();
      closeBulkModal();
      soundVictory();
      addReward(addedCount * 10, addedCount);
      renderMyDictionary();
      alert(`🎉 Barakalla! ${addedCount} ta yangi so'z lug'atingizga qo'shildi!`);
    } else {
      alert("Format to'g'ri kelmadi. Namuna: Apple - Olma - Яблоко");
    }
  }

  // --- THEME ---
  function applyTheme() {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.getElementById('themeToggleBtn').textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.getElementById('themeToggleBtn').textContent = '🌙';
    }
  }

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('flippy_theme', theme);
    applyTheme();
  }

  // --- NAVIGATION ---
  function setupNavigation() {
    const tabCards = document.getElementById('tabCards');
    const tabDict = document.getElementById('tabDict');

    tabCards.addEventListener('click', () => {
      tabCards.classList.add('active');
      tabDict.classList.remove('active');
      startStudySession();
    });

    tabDict.addEventListener('click', () => {
      tabDict.classList.add('active');
      tabCards.classList.remove('active');
      document.getElementById('studyScreen').style.display = 'none';
      document.getElementById('resultScreen').style.display = 'none';
      document.getElementById('dictionaryScreen').style.display = 'block';
      renderMyDictionary();
    });

    // "Mening Lug'atim" bo'limidagi "Yodlashni boshlash" tugmasi
    document.getElementById('btnPracticeMyWords').addEventListener('click', () => {
      tabCards.click();
    });
  }

  // --- INITIALIZATION ---
  function init() {
    applyTheme();

    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

    const cardScene = document.getElementById('cardScene');
    if (cardScene) {
      cardScene.addEventListener('click', (e) => {
        if (e.target.closest('.btn-speaker') || e.target.closest('.btn-speed-toggle')) return;
        flipCard();
      });
    }

    document.getElementById('btnFlipCard').addEventListener('click', flipCard);
    document.getElementById('btnAnswerKnown').addEventListener('click', handleAnswerKnown);
    document.getElementById('btnAnswerMissed').addEventListener('click', handleAnswerMissed);

    document.getElementById('btnSpeedToggle').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleVoiceSpeed();
    });

    // Natija tugmalari
    document.getElementById('btnNextRound').addEventListener('click', () => startStudySession());
    document.getElementById('btnReviewMissed').addEventListener('click', () => {
      if (sessionMissedWords.length > 0) {
        startStudySession(sessionMissedWords);
      }
    });
    document.getElementById('btnGoDict').addEventListener('click', () => {
      document.getElementById('tabDict').click();
    });

    // Bo'sh holatdagi tugmalar
    document.getElementById('btnEmptyAddSingle').addEventListener('click', openAddSingleModal);
    document.getElementById('btnEmptyAddBulk').addEventListener('click', openBulkModal);

    // Lug'at qidiruvi
    const searchInput = document.getElementById('dictSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        dictSearchQuery = e.target.value;
        renderMyDictionary();
      });
    }

    // Modallar
    document.getElementById('btnOpenAddModal').addEventListener('click', openAddSingleModal);
    document.getElementById('btnCancelModal').addEventListener('click', closeAddSingleModal);
    document.getElementById('addWordForm').addEventListener('submit', saveSingleCustomWord);

    document.getElementById('btnOpenBulkModal').addEventListener('click', openBulkModal);
    document.getElementById('btnCancelBulkModal').addEventListener('click', closeBulkModal);
    document.getElementById('bulkWordForm').addEventListener('submit', saveBulkWords);

    // Auth
    document.getElementById('authForm').addEventListener('submit', handleDirectLogin);
    document.getElementById('btnLogoutUser').addEventListener('click', logoutUser);

    // Klaviatura
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (document.getElementById('studyScreen').style.display === 'flex' && sessionWords.length > 0) {
        if (e.code === 'Space') {
          e.preventDefault();
          flipCard();
        } else if (e.code === 'ArrowRight') {
          e.preventDefault();
          handleAnswerKnown();
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault();
          handleAnswerMissed();
        }
      }
    });

    setupNavigation();
    checkUserAuth();
    startStudySession();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
