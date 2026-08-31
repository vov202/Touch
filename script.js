// Автономный фикс касаний без Firebase и регистраций
(function() {
    // Наш уникальный секретный токен для вашей пары (сгенерирован специально для вас)
    const token = "vov202_anya_secret_touch_token_2026";
    const url = `https://keyvalue.xyz{token}`;

    let user = "guest";
    if (window.location.hash === "#vova") user = "vova";
    if (window.location.hash === "#anya") user = "anya";

    const mainBtn = document.getElementById('main-btn');
    const vovaDisplay = document.getElementById('vova-count');
    const anyaDisplay = document.getElementById('anya-count');

    let currentVova = 0;
    let currentAnya = 0;

    // Функция загрузки данных из сети
    async function loadData() {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const text = await response.text();
                // Данные хранятся в виде "кликиВовы,кликиАни,дата"
                const parts = text.split(',');
                
                const todayStr = new Date().toISOString().split('T')[0];
                // Если наступил новый день — сбрасываем счетчики в ноль
                if (parts[2] !== todayStr) {
                    await saveData(0, 0);
                    return;
                }

                const newVova = parseInt(parts[0]) || 0;
                const newAnya = parseInt(parts[1]) || 0;

                // Если у другого человека изменилась цифра — запускаем пульсацию сердца
                if (user === "vova" && newAnya !== currentAnya) triggerPulse();
                if (user === "anya" && newVova !== currentVova) triggerPulse();

                currentVova = newVova;
                currentAnya = newAnya;

                vovaDisplay.textContent = currentVova;
                anyaDisplay.textContent = currentAnya;
            } else if (response.status === 404) {
                // Если базы еще нет — создаем её в сети
                await saveData(0, 0);
            }
        } catch (e) {
            console.log("Ошибка обновления данных");
        }
    }

    // Функция сохранения данных в сеть
    async function saveData(v, a) {
        const todayStr = new Date().toISOString().split('T')[0];
        try {
            await fetch(url, {
                method: 'POST',
                body: `${v},${a},${todayStr}`,
                headers: { 'Content-Type': 'text/plain' }
            });
        } catch(e) {}
    }

    // Логика клика
    if (mainBtn) {
        mainBtn.addEventListener('click', async () => {
            if (user === "guest") {
                alert("Используй секретную ссылку с #vova или #anya в конце!");
                return;
            }

            mainBtn.classList.remove('pulse');
            void mainBtn.offsetWidth;
            mainBtn.classList.add('pulse');

            if (user === "vova") currentVova++;
            if (user === "anya") currentAnya++;

            vovaDisplay.textContent = currentVova;
            anyaDisplay.textContent = currentAnya;

            await saveData(currentVova, currentAnya);
        });
    }

    function triggerPulse() {
        if (!mainBtn) return;
        mainBtn.classList.remove('pulse');
        void mainBtn.offsetWidth;
        mainBtn.classList.add('pulse');
    }

    // Запускаем бесконечное обновление каждые 2 секунды, чтобы ловить клики на расстоянии
    loadData();
    setInterval(loadData, 2000);
})();
