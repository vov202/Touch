(function() {
    // Твой личный секретный ключ для базы данных
    const token = "vov202_anya_touch_key_2026_v2";
    const url = `https://keyvalue.xyz{token}`;

    // Определяем пользователя строго по хэшу ссылки
    let user = "guest";
    if (window.location.hash === "#vova") user = "vova";
    if (window.location.hash === "#anya") user = "anya";

    const mainBtn = document.getElementById('main-btn');
    const vovaDisplay = document.getElementById('vova-count');
    const anyaDisplay = document.getElementById('anya-count');

    let currentVova = 0;
    let currentAnya = 0;

    // Функция отправки данных на сервер
    async function saveData(v, a) {
        const todayStr = new Date().toISOString().split('T')[0];
        try {
            await fetch(url, {
                method: 'POST',
                body: `${v},${a},${todayStr}`,
                headers: { 'Content-Type': 'text/plain' }
            });
        } catch(e) {
            console.log("Ошибка отправки");
        }
    }

    // Функция получения данных из сети
    async function loadData() {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const text = await response.text();
                const parts = text.split(',');
                
                const todayStr = new Date().toISOString().split('T')[0];
                
                // Ежедневный сброс: если дата с сервера не совпадает с сегодняшней
                if (parts[2] && parts[2] !== todayStr) {
                    if (user === "vova") { // Сбрасывает первый, кто зашел в новые сутки
                        await saveData(0, 0);
                    }
                    vovaDisplay.textContent = "0";
                    anyaDisplay.textContent = "0";
                    currentVova = 0;
                    currentAnya = 0;
                    return;
                }

                const newVova = parseInt(parts[0]) || 0;
                const newAnya = parseInt(parts[1]) || 0;

                // Пульсация сердца, если прилетел новый клик от партнера
                if (user === "vova" && newAnya > currentAnya) triggerPulse();
                if (user === "anya" && newVova > currentVova) triggerPulse();

                currentVova = newVova;
                currentAnya = newAnya;

                vovaDisplay.textContent = currentVova;
                anyaDisplay.textContent = currentAnya;
            } else if (response.status === 404) {
                // Если базы нет — принудительно создаем её на сервере инициализирующим запросом
                await saveData(0, 0);
            }
        } catch (e) {
            console.log("Ошибка сети");
        }
    }

    // Обработчик нажатия на кнопку
    if (mainBtn) {
        mainBtn.addEventListener('click', async () => {
            if (user === "guest") {
                alert("Внимание! Зайди по секретной ссылке с #vova или #anya в конце, чтобы сайт понял, кто нажимает кнопку!");
                return;
            }

            // Анимация клика
            mainBtn.classList.remove('pulse');
            void mainBtn.offsetWidth;
            mainBtn.classList.add('pulse');

            // Прибавляем локально, чтобы не ждать ответа сервера
            if (user === "vova") currentVova++;
            if (user === "anya") currentAnya++;

            vovaDisplay.textContent = currentVova;
            anyaDisplay.textContent = currentAnya;

            // Срочно шлём апдейт в облако
            await saveData(currentVova, currentAnya);
        });
    }

    function triggerPulse() {
        if (!mainBtn) return;
        mainBtn.classList.remove('pulse');
        void mainBtn.offsetWidth;
        mainBtn.classList.add('pulse');
    }

    // Запускаем бесконечный цикл синхронизации каждые 1.5 секунды
    loadData();
    setInterval(loadData, 1500);
})();
