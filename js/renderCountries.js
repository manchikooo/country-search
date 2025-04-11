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

    loadAvailableFilters(filtersFromBackend)

    // отрисовываем страны
    renderCountries();

    //устанавливаем фильтры
    setupAreaFilter();
    setupNameFilter();
    setupPopulationFilter();

    setupCheckboxFilter(".region-inputs", "regions", "region");
    setupCheckboxFilter(".language-inputs", "languages", "lang");
    setupCheckboxFilter(".timezone-inputs", "timezones", "timezone");
    setupCheckboxFilter(".currency-inputs", "currencies", "currency");
    setupCheckboxFilter(".continent-inputs", "continents", "continent");

    setupSingleCheckboxFilter(".unmember-checkbox", "unMember");
    setupSingleCheckboxFilter(".landlocked-checkbox", "landlocked");
    setupSingleCheckboxFilter(".independent-checkbox", "independent");
});

function buildQueryUrl(baseUrl, filters) {
    const url = new URL(baseUrl);

    if (filters.name) url.searchParams.set("name", filters.name);
    if (filters.areaTo) url.searchParams.set("areaTo", filters.areaTo);
    if (filters.areaFrom) url.searchParams.set("areaFrom", filters.areaFrom);
    if (filters.population) url.searchParams.set("population", filters.population);

    if (filters.regions.length) url.searchParams.set("regions", filters.regions.join(","));
    if (filters.languages.length) url.searchParams.set("languages", filters.languages.join(","));
    if (filters.timezones.length) url.searchParams.set("timezones", filters.timezones.join(","));
    if (filters.continents.length) url.searchParams.set("continents", filters.continents.join(","));
    if (filters.currencies.length) url.searchParams.set("currencies", filters.currencies.join(","));

    if (filters.unMember !== null) url.searchParams.set("unMember", filters.unMember);
    if (filters.landlocked !== null) url.searchParams.set("landlocked", filters.landlocked);
    if (filters.independent !== null) url.searchParams.set("independent", filters.independent);

    return url.toString();
}

function loadAvailableFilters(filtersFromBack) {
    renderCheckboxesWithLabels(".region-inputs", filtersFromBack.regions.values, "region");
    renderCheckboxesWithLabels(".language-inputs", filtersFromBack.languages.values, "lang");
    renderCheckboxesWithLabels(".timezone-inputs", filtersFromBack.timezones.values, "timezone");
    renderCheckboxesWithLabels(".currency-inputs", filtersFromBack.currencies.values, "currency");
    renderCheckboxesWithLabels(".continent-inputs", filtersFromBack.continents.values, "continent");
    renderCheckboxesWithLabels(".independent-inputs", filtersFromBack.independent.values, "independent");
}

function renderCheckboxesWithLabels(containerSelector, valuesObj, dataAttr) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const entries = Object.entries(valuesObj); // [['english', 'Английский'], ...]

    container.innerHTML = entries.map(([key, label]) =>
        `<label class="custom-checkbox">
            <input type="checkbox" data-${dataAttr}="${key}"> ${label}
        </label>
    `).join("");
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
    try {
        const url = buildQueryUrl(`${BASE_URL}/api/countries/search`, appliedFiltersState);
        const res = await fetch(url);
        const resResult = res.ok ? await res.json() : [];

        currentCountries = resResult.data;

        renderCountries();
    } catch (error) {
        console.error("Ошибка при фильтрации:", error);
        renderCountries([]);
    }
}

function setupNameFilter() {
    const input = document.getElementById("titleSearch");
    let debounceTimer = null;

    input.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            appliedFiltersState.name = input.value.trim();
            applyFilters();
        }, 400);
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

    const parse = str => parseFloat(str.replace(/\s|млн|,/g, "")) || null;

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

function setupCheckboxFilter(containerSelector, filterKey, datasetKey) {
    const checkboxes = document.querySelectorAll(`${containerSelector} input[type="checkbox"]`);

    checkboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            appliedFiltersState[filterKey] = Array.from(checkboxes)
                .filter(c => c.checked)
                .map(c => c.dataset[datasetKey]);
            applyFilters();
        });
    });
}

function setupSingleCheckboxFilter(selector, filterKey) {
    const checkbox = document.querySelector(selector);
    if (!checkbox) return;

    checkbox.addEventListener("change", () => {
        appliedFiltersState[filterKey] = checkbox.checked ? "true" : null;
        applyFilters();
    });
}