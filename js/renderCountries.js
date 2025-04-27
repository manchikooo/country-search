const appliedFiltersState = {
    name: '',
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
    landlocked: null
}

let filtersFromBackend = []

let currentCountries = []

const BASE_URL = 'https://country-search-seven-gilt.vercel.app'

document.addEventListener('DOMContentLoaded', async () => {
    const countries = await fetch(`${BASE_URL}/api/countries`)
    const filters = await fetch(`${BASE_URL}/api/filters`)

    currentCountries = await countries.json();
    filtersFromBackend = await filters.json();

    renderCountries()
    loadAvailableFilters(filtersFromBackend)

    setupAreaFilter()
    setupNameFilter()
    setupPopulationFilter()

    setupNameFilter()
    setupRegionFilter()
    setupLanguageFilter()
    setupContinentsFilter()
    setupTimezoneFilter()
    setupCurrencyFilter()

    setupSingleCheckboxFilter(".unmember-checkbox", "unMember");
    setupSingleCheckboxFilter(".landlocked-checkbox", "landlocked");
    setupSingleCheckboxFilter(".independent-checkbox", "independent");
})

function renderCountries() {
    const container = document.querySelector('.countries-grid')
    container.innerHTML = ''

    if (!currentCountries || currentCountries.length === 0) {
        container.classList.add('empty');
        container.innerHTML = `<p>Ничего не найдено</p>`
    }

    currentCountries.forEach(country => {
        const name = country.translations?.rus?.official || 'Без названия'
        const capital = country.capital?.[0] || 'Нет данных'
        const region = country.region || 'Нет региона'
        const flag = country.flags?.png || ''

        const card = document.createElement("div")
        card.className = 'card'
        card.innerHTML = `
        <img src="${flag}" alt="${country.name}" />
        <h3>${name}</h3>
        <p>Регион: ${region}</p>
        <p>Столица: ${capital}</p>
        `

        container.appendChild(card)
    })
}

// функция, которая формирует url запроса с помощью queryParameters
function buildQueryUrl(baseUrl, filters) {
    const url = new URL(baseUrl)
console.log({filters})
    if (filters.name) url.searchParams.set('name', filters.name)
    if (filters.areaFrom) url.searchParams.set('areaFrom', filters.areaFrom)
    if (filters.areaTo) url.searchParams.set('areaTo', filters.areaTo)
    if (filters.population) url.searchParams.set('population', filters.population)

    if (filters.regions.length) url.searchParams.set('regions', filters.regions.join())
    if (filters.languages.length) url.searchParams.set('languages', filters.languages.join())
    if (filters.timezones.length) url.searchParams.set('timezones', filters.timezones.join())
    if (filters.continents.length) url.searchParams.set('continents', filters.continents.join())
    if (filters.currencies.length) url.searchParams.set('currencies', filters.currencies.join())

    if (filters.unMember !== null) url.searchParams.set('unMember', filters.unMember.join())
    if (filters.landlocked !== null) url.searchParams.set('landlocked', filters.landlocked.join())
    if (filters.independent !== null) url.searchParams.set('independent', filters.independent.join())

    return url.toString()
}

function loadAvailableFilters(filtersFromBack) {
    const filtersParameters = [
        {
            containerSelector: '.region-inputs',
            valuesObj: filtersFromBack.regions.values,
            dataAttr: 'region'
        },
        {
            containerSelector: '.language-inputs',
            valuesObj: filtersFromBack.languages.values,
            dataAttr: 'lang'
        },
        {
            containerSelector: '.currency-inputs',
            valuesObj: filtersFromBack.currencies.values,
            dataAttr: 'currency'
        },
        {
            containerSelector: '.timezone-inputs',
            valuesObj: filtersFromBack.timezones.values,
            dataAttr: 'timezone'
        },
        {
            containerSelector: '.continent-inputs',
            valuesObj: filtersFromBack.continents.values,
            dataAttr: 'continent'
        },
        {
            containerSelector: '.continent-inputs',
            valuesObj: filtersFromBack.continents.values,
            dataAttr: 'continent'
        }
    ]

    filtersParameters.forEach(param => {
        renderCheckboxesWithLabels({
            containerSelector: param.containerSelector,
            valuesObj: param.valuesObj,
            dataAttr: param.dataAttr,
        })
    })
}

function renderCheckboxesWithLabels({containerSelector, valuesObj, dataAttr}) {
    const container  = document.querySelector(containerSelector)
    if (!container) return;

    const entries = Object.entries(valuesObj);

    container.innerHTML= entries.map(([key, label]) =>
    `<label class="custom-checkbox">
        <input type="checkbox" data-${dataAttr}="${key}">${label}</label>
    </label>`).join('')
}

async function applyFilters() {
    try {
        const url = buildQueryUrl(`${BASE_URL}/api/countries/search`, appliedFiltersState)
        const res = await fetch(url)
        const resResult = res.ok ? await res.json() : []
        currentCountries = resResult.data
        renderCountries()
    } catch (error) {
        console.error('Ошибка при применении фильтров', error)
        renderCountries([])
    }
}

function setupNameFilter () {
    const input = document.getElementById('titleSearch')

    let debounceTimer = null

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(()=>{
            appliedFiltersState.name = input.value.trim()
            applyFilters()
        }, 400)
    })
}

function setupRegionFilter () {
    const checkboxes = document.querySelectorAll('.region-inputs input[type="checkbox"]')

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            appliedFiltersState.regions = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map( c => c.dataset.region.toLowerCase())
            applyFilters()
        })
    })
}

function setupContinentsFilter () {
    const checkboxes = document.querySelectorAll('.continent-inputs input[type="checkbox"]')

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            appliedFiltersState.continents = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map( c => c.dataset.continent.toLowerCase())
            applyFilters()
        })
    })
}

function setupLanguageFilter () {
    const checkboxes = document.querySelectorAll('.language-inputs input[type="checkbox"]')

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            appliedFiltersState.languages = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map( c => c.dataset.lang.toLowerCase())
            applyFilters()
        })
    })
}

function setupTimezoneFilter () {
    const checkboxes = document.querySelectorAll('.timezone-inputs input[type="checkbox"]')

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            appliedFiltersState.timezones = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map( c => c.dataset.timezone.toLowerCase())
            applyFilters()
        })
    })
}

function setupCurrencyFilter () {
    const checkboxes = document.querySelectorAll('.currency-inputs input[type="checkbox"]')

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            appliedFiltersState.currencies = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map( c => c.dataset.currency.toLowerCase())
            applyFilters()
        })
    })
}

function setupAreaFilter () {
    const minInput = document.getElementById('area-min')
    const maxInput = document.getElementById('area-max')
    let debounceTimer = null

    const update = () => {
        appliedFiltersState.areaFrom = minInput.value
        appliedFiltersState.areaTo = maxInput.value
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(()=>{
            applyFilters()
        },400)
    }

    minInput.addEventListener('input', update)
    maxInput.addEventListener('input', update)
}

function setupPopulationFilter () {
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
    input.addEventListener("input", e => update(e.target.value(/\D/g, ""))); // убирает не цифры
}

function setupSingleCheckboxFilter(selector, filterKey) {
    console.log({selector, filterKey});

    const checkbox = document.querySelector(selector);
    if (!checkbox) return;

    checkbox.addEventListener("change", () => {
        appliedFiltersState[filterKey] = checkbox.checked ? "true" : null;
        applyFilters();
    });
}