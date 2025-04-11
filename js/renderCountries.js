let appliedFiltersState = {
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

let filtersFromBackend = []

let currentCountries = [];

const BASE_URL = 'https://country-search-itbali-itbalis-projects.vercel.app'

document.addEventListener("DOMContentLoaded", async () => {
    // запрашиваем все страны
    const countries = await fetch(`${BASE_URL}/api/countries`);
    const filters = await fetch(`${BASE_URL}/api/filters`);

    //присваиваем значение ответа в текущие страны
    currentCountries = await countries.json();
    filtersFromBackend = await filters.json();
        console.log({filtersFromBackend})

    loadAvailableFilters(filtersFromBackend)

    // отрисовываем страны
    renderCountries();

    //устанавливаем фильтры
    setupNameFilter();
    setupLanguageFilter();
    setupRegionFilter();
    setupContinentFilter();
    setupCurrencyFilter();
    setupTimezonesFilter();
    setupIndependentFilter();
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

function loadAvailableFilters(filtersFromBack) {
    renderCheckboxesWithLabels(".region-inputs", filtersFromBack.regions.values, "region");
    renderCheckboxesWithLabels(".independent-inputs", filtersFromBack.independent.values, "independent");
    renderCheckboxesWithLabels(".continent-inputs", filtersFromBack.continents.values, "continent");
    renderCheckboxesWithLabels(".language-inputs", filtersFromBack.languages.values, "lang");
    renderCheckboxesWithLabels(".currency-inputs", filtersFromBack.currencies.values, "currency");
    renderCheckboxesWithLabels(".timezone-inputs", filtersFromBack.timezones.values, "timezone");
}

function renderCheckboxesWithLabels(containerSelector, valuesObj, dataAttr) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const entries = Object.entries(valuesObj); // [['english', 'Английский'], ...]

    container.innerHTML = entries.map(([key, label]) => {
        // console.log({key})
        return `<label class="custom-checkbox">
            <input type="checkbox" data-${dataAttr}="${key}"> ${label}
        </label>
    `}).join("");
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

async function applyFilters() {
    console.log({appliedFiltersState});
    try {
        const url = buildQueryUrl(`${BASE_URL}/api/countries/search`, appliedFiltersState);
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
            appliedFiltersState.name = input.value.trim();
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
            appliedFiltersState.languages = Array.from(checkboxes)
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
            appliedFiltersState.regions = Array.from(checkboxes)
                .filter(c => c.checked)
                .map(c => c.dataset.region);
            applyFilters();
        });
    });
}

function setupContinentFilter() {
    const checkboxes = document.querySelectorAll('.continent-inputs input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            appliedFiltersState.continents = Array.from(checkboxes)
                .filter(c => c.checked)
                .map(c => c.dataset.continent);
            applyFilters();
        });
    });
}

function setupCurrencyFilter() {
    const checkboxes = document.querySelectorAll('.currency-inputs input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            appliedFiltersState.currencies = Array.from(checkboxes)
                .filter(c => c.checked)
                .map(c => c.dataset.currency);
            applyFilters();
        });
    });
}

function setupTimezonesFilter() {
    const checkboxes = document.querySelectorAll('.timezone-inputs input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            appliedFiltersState.timezones = Array.from(checkboxes)
                .filter(c => c.checked)
                .map(c => c.dataset.timezone);
            applyFilters();
        });
    });
}

function setupPopulationFilter() {
    const slider = document.getElementById("population-slider");
    const input = document.getElementById("population-input");
    let debounceTimer = null;

    const update = value => {
        appliedFiltersState.population = +value;
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

    const parse = str => parseFloat(str.replace(/\s|млн|/g, "")) || null;

    const update = () => {
        appliedFiltersState.areaFrom = parse(minInput.value);
        appliedFiltersState.areaTo = parse(maxInput.value);
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
            applyFilters();
        }, 400);
    };

    minInput.addEventListener("input", update);
    maxInput.addEventListener("input", update);
}

function setupUnMemberFilter() {
    const checkbox = document.querySelector(".unmember-checkbox");
    if (!checkbox) return;
    checkbox.addEventListener("change", () => {
        appliedFiltersState.unMember = checkbox.checked ? "true" : null;
        applyFilters();
    });
}

function setupLandlockedFilter() {
    const checkbox = document.querySelector(".landlocked-checkbox");
    if (!checkbox) return;

    checkbox.addEventListener("change", () => {
        appliedFiltersState.landlocked = checkbox.checked ? "true" : null;
        applyFilters();
    });
}

function setupIndependentFilter() {
    const checkbox = document.querySelector(".independent-checkbox");
    if (!checkbox) return;

    checkbox.addEventListener("change", () => {
        appliedFiltersState.independent = checkbox.checked ? "true" : null;
        applyFilters();
    });
}

// function setupIndependentFilter() {
//     const checkboxes = document.querySelectorAll('.independent-inputs input[type="checkbox"]');
//     checkboxes.forEach(cb => {
//         cb.addEventListener("change", () => {
//             appliedFiltersState.independent = Array.from(checkboxes)
//                 .filter(c => c.checked)
//                 .map(c => c.dataset.independent);
//             applyFilters();
//         });
//     });
// }