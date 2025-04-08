const filtersState = {
    name: "",
    languages: [],
    regions: [],
    continents: [],
    currencies: [],
    timezones: [],
    population: null,
    areaFrom: null,
    areaTo: null,
    unMember: null,
    independent: null,
    landlocked: null,
};

let currentCountries = [];

const BASE_URL = 'https://country-search-itbali-itbalis-projects.vercel.app'

document.addEventListener("DOMContentLoaded", async () => {
    // запрашиваем все страны
    const response = await fetch(`${BASE_URL}/api/countries`);
    //присваиваем значение ответа в текущие страны
    currentCountries = await response.json();
    console.log(currentCountries)
    // отрисовываем страны
    renderCountries();

    //устанавливаем фильтры
    setupNameFilter();
    setupLanguageFilter();
    setupRegionFilter();
    setupContinentFilter();
    setupPopulationFilter();
    setupAreaFilter();
    setupUnMemberFilter();
    setupLandlockedFilter();
});

function buildQueryUrl(baseUrl, filters) {
    const url = new URL(baseUrl);

    if (filters.name) url.searchParams.set("name", filters.name);
    if (filters.population) url.searchParams.set("population", filters.population);
    if (filters.areaFrom) url.searchParams.set("areaFrom", filters.areaFrom);
    if (filters.areaTo) url.searchParams.set("areaTo", filters.areaTo);

    if (filters.regions.length) url.searchParams.set("regions", filters.regions.join(","));
    if (filters.languages.length) url.searchParams.set("languages", filters.languages.join(","));
    if (filters.continents.length) url.searchParams.set("continents", filters.continents.join(","));
    if (filters.currencies.length) url.searchParams.set("currencies", filters.currencies.join(","));
    if (filters.timezones.length) url.searchParams.set("timezones", filters.timezones.join(","));

    if (filters.unMember !== null) url.searchParams.set("unMember", filters.unMember);
    if (filters.independent !== null) url.searchParams.set("independent", filters.independent);
    if (filters.landlocked !== null) url.searchParams.set("landlocked", filters.landlocked);

    return url.toString();
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

// 👇 Универсальный запуск фильтрации
// async function applyFilters() {
//     try {
//         const queries = [];
//
//         if (filtersState.name) {
//             queries.push(fetch(`${BASE_URL}/api/countries/search`, {}).then(r => r.ok ? r.json() : []));
//         }
//
//         for (const lang of filtersState.languages) {
//             queries.push(fetch(`https://restcountries.com/v3.1/lang/${lang}`).then(r => r.ok ? r.json() : []));
//         }
//
//         for (const region of filtersState.regions) {
//             queries.push(fetch(`https://restcountries.com/v3.1/region/${region}`).then(r => r.ok ? r.json() : []));
//         }
//
//         // Если ничего не выбрано — показать всё
//         if (queries.length === 0) {
//             const res = await fetch("https://restcountries.com/v3.1/all");
//             currentCountries = await res.json();
//             renderCountries();
//             return;
//         }
//
//         const results = await Promise.all(queries);
//         const unique = intersectCountries(results);
//         currentCountries = unique;
//         console.log("Отфильтровано стран:", unique.length);
//
//         renderCountries();
//     } catch (error) {
//         console.error("Ошибка при применении фильтров:", error);
//         renderCountries([]);
//     }
// }

async function applyFilters() {
    try {
        const url = buildQueryUrl(`${BASE_URL}/api/countries/search`, filtersState);
        const res = await fetch(url);
        const resResult = res.ok ? await res.json() : [];

        currentCountries = resResult.data

        renderCountries();
    } catch (error) {
        console.error("Ошибка при фильтрации:", error);
        renderCountries([]);
    }
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
    console.log({checkboxes})
    checkboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            filtersState.regions = Array.from(checkboxes)
                .filter(c => c.checked)
                .map(c => c.dataset.region.toLowerCase());
            applyFilters();
        });
    });
}

function setupContinentFilter() {
    const checkboxes = document.querySelectorAll('.continent-inputs input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            filtersState.continents = Array.from(checkboxes)
                .filter(c => c.checked)
                .map(c => c.dataset.continent);
            applyFilters();
        });
    });
}

function setupPopulationFilter() {
    const slider = document.getElementById("population-slider");
    const input = document.getElementById("population-input");
    let debounceTimer = null;

    const update = value => {
        filtersState.population = +value;
        input.value = Number(value).toLocaleString("ru-RU");
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            applyFilters();
        }, 400);
    };

    slider.addEventListener("input", e => update(e.target.value));
    input.addEventListener("input", e => update(e.target.value.replace(/\D/g, "")));
}

function setupAreaFilter() {
    const minInput = document.getElementById("area-min");
    const maxInput = document.getElementById("area-max");
    let debounceTimer = null;

    const parse = str => parseFloat(str.replace(/\s|млн|\,/g, "")) || null;

    const update = () => {
        filtersState.areaFrom = parse(minInput.value);
        filtersState.areaTo = parse(maxInput.value);
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            applyFilters();
        }, 400);
    };

    minInput.addEventListener("input", update);
    maxInput.addEventListener("input", update);
}

function setupUnMemberFilter() {
    const checkbox = document.querySelector(".filters_header input[type='checkbox']:not(:disabled):nth-of-type(1)");
    checkbox.addEventListener("change", () => {
        filtersState.unMember = checkbox.checked ? "true" : null;
        applyFilters();
    });
}

function setupLandlockedFilter() {
    const checkbox = document.querySelector(".filters_header input[type='checkbox']:not(:disabled):nth-of-type(2)");
    checkbox.addEventListener("change", () => {
        filtersState.landlocked = checkbox.checked ? "true" : null;
        applyFilters();
    });
}