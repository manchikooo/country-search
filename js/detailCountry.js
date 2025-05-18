const BASE_URL = 'https://country-search-seven-gilt.vercel.app'

let detailCountry = {}

let isEditMode = false;
let changedData = {};

document.addEventListener('DOMContentLoaded', async () => {
    const searchParams = new URLSearchParams(window.location.search)
    const cca3 = searchParams.get('code')

    const country = await fetch(`${BASE_URL}/api/countries/${cca3}`)

    detailCountry = await country.json()

    setupFlag()
    renderInfoBlock()
    setupDetailTable()
    renderControlButtons();
})

function setupFlag() {
    const flagContainer = document.querySelector('.country-flag');
    const flagUrl = detailCountry.flags?.png;

    if (!flagUrl) {
        flagContainer.remove();
    } else {
        const img = document.createElement('img');
        img.src = flagUrl;
        img.alt = `Флаг страны ${detailCountry.translations?.rus?.common || detailCountry.name.common}`;
        flagContainer.appendChild(img); // Вставляем изображение
    }
}


function renderInfoBlock () {
    const paramsContainer = document.querySelector('.params');
    paramsContainer.innerHTML = '';

    const nameElement = document.getElementById('country-name');
    const countryName = detailCountry.translations?.rus?.common || detailCountry.name.common;

    if (isEditMode) {
        nameElement.innerHTML = `<input type="text" id="input-country-name" value="${countryName}" />`;
    } else {
        nameElement.textContent = countryName;
    }


    const basicInformation = [
        { key: 'region', label: 'Регион', value: detailCountry.region },
        { key: 'area', label: 'Площадь', value: detailCountry.area, postfix: 'км²' },
        { key: 'capital', label: 'Столица', value: detailCountry.capital?.[0] || '' },
        { key: 'language', label: 'Язык', value: Object.values(detailCountry.languages || {})[0] || '' },
        { key: 'currency', label: 'Валюта', value: Object.values(detailCountry.currencies || {})[0]?.name || '' },
    ];

    // СТАРОЕ
    // basicInformation.forEach(item => {
    //     let value;
    //
    //     const paramDiv = document.createElement('div');
    //     paramDiv.className = 'country-param';
    //     paramDiv.innerHTML = `
    //     <span class="info-key">${item.label}:</span>
    //     <span class="info-value">${value}</span>
    //     `;
    //
    //     paramsContainer.appendChild(paramDiv);
    // });

    // НОВОЕ
    basicInformation.forEach((item) => {
        const paramDiv = document.createElement('div');
        paramDiv.className = 'country-param';

        const fieldId = `input-${item.key}`;
        const displayValue = item.postfix ? `${item.value} ${item.postfix}` : item.value;

        const inputHtml = isEditMode
            ? `<input id="${fieldId}" data-key="${item.key}" value="${item.value}" />`
            : `<span class="info-value">${displayValue}</span>`;

        paramDiv.innerHTML = `
            <span class="info-key">${item.label}:</span>
            ${inputHtml}
        `;

        paramsContainer.appendChild(paramDiv);
    });


    // ЭТОТ КОД ДОБАВЛЯЕТ СЛЕЖЕНИЕ ЗА ИЗМЕНЕНИЕМ ИМЕНИ СТРАНЫ И ИНФЫ ПОД ИМЕНЕМ (5 блоков)
    if (isEditMode) {
        // Название страны
        const nameInput = document.getElementById('input-country-name');
        nameInput.addEventListener('input', (e) => {
            changedData['Название страны'] = e.target.value;
        });

        // Остальные поля
        basicInformation.forEach((item) => {
            const input = document.getElementById(`input-${item.key}`);
            if (input) {
                input.addEventListener('input', (e) => {
                    changedData[item.label] = e.target.value;
                });
            }
        });
    }
}

function setupDetailTable() {
    const tableBody = document.querySelector('.table-information tbody');
    tableBody.innerHTML = ''; // Очистим старые строки

    const tableInfo = [
        { label: 'Континент', value: detailCountry.continents?.[0] },
        { label: 'Географические координаты', value: detailCountry.latlng?.join(', ') },
        { label: 'Население', value: `${detailCountry.population?.toLocaleString('ru-RU')} чел.` },
        { label: 'Часовой пояс', value: detailCountry.timezones?.[0]?.replace('UTC', 'UTC-') }, // быстрое решение
        { label: 'Выход к морю', value: detailCountry.landlocked ? 'Нет' : 'Да' },
        { label: 'Статус', value: detailCountry.status === 'officially-assigned' ? 'Официально признанная' : 'Неизвестно' },
        { label: 'Независимость', value: detailCountry.independent ? 'Да' : 'Нет' },
        { label: 'Член ООН', value: detailCountry.unMember ? 'Да' : 'Нет' },
        { label: 'Автомобильные данные', value: detailCountry.car?.side === 'right' ? 'Правостороннее движение' : 'Левостороннее движение' },
        { label: 'Начало недели', value: detailCountry.startOfWeek === 'monday' ? 'Понедельник' : detailCountry.startOfWeek },
        { label: 'Альтернативные варианты написания', value: detailCountry.altSpellings?.join(', ') },
        { label: 'Доменные зоны', value: detailCountry.tld?.join(', ') },
        { label: 'Код страны (cca2)', value: detailCountry.cca2 },
        { label: 'Код страны (ccn3)', value: detailCountry.ccn3 },
        { label: 'Код страны (cca3)', value: detailCountry.cca3 },
        { label: 'Код звонка', value: `${detailCountry.idd?.root || ''}${detailCountry.idd?.suffixes?.[0] || ''}` }
    ];

    tableInfo.forEach(item => {
        const row = document.createElement('tr');

        // БЫЛО
        // row.innerHTML = `
        // <td>${item.label}</td>
        // <td>${item.value || '—'}</td>
        // `;

        // СТАЛО
        const inputId = `input-${item.label.replace(/\s/g, '-')}`; // уникальный id сделанный из label

        const inputHtml = isEditMode
            ? `<input data-key="${item.label}" id="${inputId}" value="${item.value || ''}" />`
            : `<span>${item.value || '—'}</span>`;

        row.innerHTML = `
        <td>${item.label}</td>
        <td>${inputHtml}</td>
        `;

        tableBody.appendChild(row);

        if (isEditMode) {
            const input = row.querySelector('input');
            input.addEventListener('input', (e) => {
                const newValue = e.target.value;
                const key = item.label;

                changedData[key] = newValue;
            });
        }
    });
}

function renderControlButtons() {
    const container = document.querySelector('.country-control-buttons');

    // очищаем, чтобы кнопки не дублировались (мы их потому что добавляем через js)
    container.innerHTML = '';

    if (isEditMode) {
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Отмена';
        cancelBtn.addEventListener('click', () => {
            isEditMode = false;
            changedData = {};
            renderControlButtons();
            renderInfoBlock();
            setupDetailTable();
            // тут можно сбросить изменения, если будут поля редактирования
        });

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Сохранить изменения';
        saveBtn.addEventListener('click', () => {
            isEditMode = false;
            renderControlButtons();
            renderInfoBlock();
            setupDetailTable();

            // ПОДГОТОВКА: вызов функции сохранения
            sendChangedDataToServer(changedData);
        });

        container.append(cancelBtn, saveBtn);
    } else {
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Редактировать';
        editBtn.addEventListener('click', () => {
            isEditMode = true;
            renderControlButtons();
            renderInfoBlock();
            setupDetailTable();
            // тут можно включить поля для редактирования
        });

        container.appendChild(editBtn);
    }
}

async function sendChangedDataToServer(data) {
    const searchParams = new URLSearchParams(window.location.search);
    const cca3 = searchParams.get('code');

    if (!cca3) {
        console.error('Код страны не найден в URL');
        return;
    }

    const payload = {};
    console.log({payload});

    // Название
    if ('Название страны' in data) {
        payload.name = {
            common: data['Название страны'],
            official: detailCountry.name?.official || data['Название страны'],
        };
    }

    // Население
    if ('Население' in data) {
        payload.population = parseInt(data['Население'].replace(/[^\d]/g, '')) || 0;
    }

    // Площадь
    if ('Площадь' in data) {
        payload.area = parseFloat(data['Площадь'].replace(/[^\d.]/g, '')) || 0;
    }

    // Континент
    if ('Континент' in data) {
        payload.continents = [data['Континент']];
    }

    // Регион
    if ('Регион' in data) {
        payload.region = data['Регион'];
    }

    // Столица
    if ('Столица' in data) {
        payload.capital = [data['Столица']];
    }

    // Язык
    if ('Язык' in data) {
        const langCode = Object.keys(detailCountry.languages || {})[0] || 'lang';
        payload.languages = {
            [langCode]: data['Язык'],
        };
    }

    // Валюта
    if ('Валюта' in data) {
        const currencyCode = Object.keys(detailCountry.currencies || {})[0] || 'CUR';
        payload.currencies = {
            [currencyCode]: {
                name: data['Валюта'],
                symbol: detailCountry.currencies?.[currencyCode]?.symbol || '',
            },
        };
    }

    // Координаты
    if ('Географические координаты' in data) {
        const coords = data['Географические координаты'].split(',').map(Number);
        if (coords.length === 2 && coords.every(c => !isNaN(c))) {
            payload.latlng = coords;
        }
    }

    // Часовой пояс
    if ('Часовой пояс' in data) {
        const tz = data['Часовой пояс'].replace('UTC-', 'UTC');
        payload.timezones = [tz];
    }

    // Выход к морю
    if ('Выход к морю' in data) {
        payload.landlocked = data['Выход к морю'] === 'Нет';
    }

    // Статус
    if ('Статус' in data) {
        payload.status = data['Статус'] === 'Официально признанная' ? 'officially-assigned' : 'unknown';
    }

    // Независимость
    if ('Независимость' in data) {
        payload.independent = data['Независимость'] === 'Да';
    }

    // Член ООН
    if ('Член ООН' in data) {
        payload.unMember = data['Член ООН'] === 'Да';
    }

    // Автомобильные данные
    if ('Автомобильные данные' in data) {
        payload.car = {
            side: data['Автомобильные данные'].includes('Право') ? 'right' : 'left',
        };
    }

    // Начало недели
    if ('Начало недели' in data) {
        const map = {
            'Понедельник': 'monday',
            'Воскресенье': 'sunday',
            'Суббота': 'saturday'
        };
        payload.startOfWeek = map[data['Начало недели']] || 'monday';
    }

    // Альтернативные варианты написания
    if ('Альтернативные варианты написания' in data) {
        payload.altSpellings = data['Альтернативные варианты написания'].split(',').map(s => s.trim());
    }

    // Доменные зоны
    if ('Доменные зоны' in data) {
        payload.tld = data['Доменные зоны'].split(',').map(s => s.trim());
    }

    // Коды
    if ('Код страны (cca2)' in data) payload.cca2 = data['Код страны (cca2)'];
    if ('Код страны (ccn3)' in data) payload.ccn3 = data['Код страны (ccn3)'];
    if ('Код страны (cca3)' in data) payload.cca3 = data['Код страны (cca3)'];

    // Код звонка
    if ('Код звонка' in data) {
        const match = data['Код звонка'].match(/^(\+\d+)(\d+)?$/);
        if (match) {
            payload.idd = {
                root: match[1],
                suffixes: match[2] ? [match[2]] : [],
            };
        }
    }

    try {
        const response = await fetch(`${BASE_URL}/api/countries/${cca3}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        console.log('Ответ сервера:', result);
        // alert('Изменения успешно отправлены!');
    } catch (err) {
        console.error('Ошибка при отправке:', err);
        alert('Ошибка при сохранении данных');
    }
}

