const filtersState = {
    name: "",
    languages: [],
    regions: []
};

let currentCountries = [];

document.addEventListener("DOMContentLoaded", async () => {
    // запрашиваем все страны
    const response = await fetch("https://restcountries.com/v3.1/all");
    //присваиваем значение ответа в текущие страны
    currentCountries = await response.json();
    // отрисовываем страны
    renderCountries();

    setupNameFilter();
    setupLanguageFilter();
    setupRegionFilter();
});

// 👇 Универсальный запуск фильтрации
async function applyFilters() {
    try {
        const queries = [];

        if (filtersState.name) {
            queries.push(fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(filtersState.name)}`).then(r => r.ok ? r.json() : []));
        }

        for (const lang of filtersState.languages) {
            queries.push(fetch(`https://restcountries.com/v3.1/lang/${lang}`).then(r => r.ok ? r.json() : []));
        }

        for (const region of filtersState.regions) {
            queries.push(fetch(`https://restcountries.com/v3.1/region/${region}`).then(r => r.ok ? r.json() : []));
        }

        // Если ничего не выбрано — показать всё
        if (queries.length === 0) {
            const res = await fetch("https://restcountries.com/v3.1/all");
            currentCountries = await res.json();
            renderCountries();
            return;
        }

        const results = await Promise.all(queries);
        const unique = intersectCountries(results);
        currentCountries = unique;
        console.log("Отфильтровано стран:", unique.length);

        renderCountries();
    } catch (error) {
        console.error("Ошибка при применении фильтров:", error);
        renderCountries([]);
    }
}

// пересекающиеся страны
function intersectCountries(countryLists) {
    if (!countryLists.length) return [];

    const key = country => country.cca3 || country.name.common;

    // массив массивов ключей
    const keysOfTreeArrays = countryLists.map(list => {
        return list.map(key)
    });

    const firstList = countryLists[0];
    const result = [];

    firstList.forEach(country => {
        const countryKey = key(country);

        const inAll = keysOfTreeArrays.every(list => list.includes(countryKey));
        if (inAll) {
            result.push(country);
        }
    });

    return result;
}

function renderCountries() {
    const container = document.querySelector(".countries-grid");
    container.innerHTML = "";

    if (!currentCountries || currentCountries.length === 0) {
        container.classList.add("empty");
        container.innerHTML = `<p class="not-found">Ничего не найдено</p>`;
        return;
    }

    currentCountries.forEach(country => {
        const name = country.translations?.rus?.official || "Без названия";
        const capital = country.capital?.[0] || "Нет данных";
        const region = country.region || "Нет региона";
        const flag = country.flags?.png || "";

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${flag}" alt="Флаг ${name}">
            <h3>${name}</h3>
            <p>Регион: ${region}</p>
            <p>Столица: ${capital}</p>
        `;
        container.appendChild(card);
    });
}

// функция поиска
function setupNameFilter() {
    const input = document.getElementById("titleSearch");
    let debounceTimer = null;

    // слушатель на ипут поиска
    input.addEventListener("input", () => {
        // чистим старый таймаут
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            filtersState.name = input.value.trim();
            applyFilters();
        }, 400);
    });
}

// фильтр по языка
function setupLanguageFilter() {
    // собираем все чекбоксы
    const checkboxes = document.querySelectorAll('.language-inputs input[type="checkbox"]');
    // бежим по ним всем
    checkboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            // добавляем на кжадый чекбокс слушатель и выбираем значение языка
            filtersState.languages = Array.from(checkboxes)
                .filter(c => c.checked)
                .map(c => c.dataset.lang);
            applyFilters();
        });
    });
}

function setupRegionFilter() {
    const checkboxes = document.querySelectorAll('.region-inputs input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            filtersState.regions = Array.from(checkboxes)
                .filter(c => c.checked)
                .map(c => c.dataset.region.toLowerCase());
            applyFilters();
        });
    });
}
