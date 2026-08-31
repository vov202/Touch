// Конфигурация твоей базы данных Firebase
// (Замени эти данные на свои из шага 3 ниже!)
const firebaseConfig = {
    apiKey: "ТВОЙ_API_KEY",
    authDomain: "ТВОЙ_PROJECT_://firebaseapp.com",
    databaseURL: "https://ТВОЙ_PROJECT_://firebaseio.com",
    projectId: "ТВОЙ_PROJECT_ID",
    storageBucket: "ТВОЙ_PROJECT_://appspot.com",
    messagingSenderId: "ТВОЙ_SENDER_ID",
    appId: "ТВОЙ_APP_ID"
};

// Инициализируем Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Определяем, кто зашел на сайт, по хэшу в ссылке
// Если зайти по ссылке вида сайта/#vova — ты Вова. Если сайт/#anya — ты Аня.
let user = "guest";
if (window.location.hash === "#vova") user = "vova";
if (window.location.hash === "#anya") user = "anya";

const mainBtn = document.getElementById('main-btn');
const vovaDisplay = document.getElementById('vova-count');
const anyaDisplay = document.getElementById('anya-count');

// Получаем текущую дату в формате ГГГГ-ММ-ДД для ежедневного сброса
function getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

const todayStr = getTodayString();
const dbRef = database.ref('clicks/' + todayStr);

// Слушаем изменения в базе данных реального времени
dbRef.on('value', (snapshot) => {
    const data = snapshot.val() || { vova: 0, anya: 0 };
    
    // Мягкая анимация цифр при обновлении
    if (parseInt(vovaDisplay.textContent) !== data.vova && user === "anya") triggerPulse();
    if (parseInt(anyaDisplay.textContent) !== data.anya && user === "vova") triggerPulse();
    
    vovaDisplay.textContent = data.vova || 0;
    anyaDisplay.textContent = data.anya || 0;
});

// Логика клика по кнопке
mainBtn.addEventListener('click', () => {
    if (user === "guest") {
        alert("Пожалуйста, используй секретную ссылку с хэшем #vova или #anya в конце!");
        return;
    }

    // Запускаем анимацию кнопки на своем экране
    mainBtn.classList.remove('pulse');
    void mainBtn.offsetWidth; // Хак для перезапуска CSS-анимации
    mainBtn.classList.add('pulse');

    // Атомарно увеличиваем счетчик кликов в облаке
    dbRef.child(user).transaction((currentValue) => {
        return (currentValue || 0) + 1;
    });
});

function triggerPulse() {
    mainBtn.classList.remove('pulse');
    void mainBtn.offsetWidth;
    mainBtn.classList.add('pulse');
}
