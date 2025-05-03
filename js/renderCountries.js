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

    const setupFilters = [
        setupAreaFilter,
        setupRegionFilter,
        setupNameFilter,
        setupPopulationFilter,
        setupLanguageFilter,
        setupContinentsFilter,
        setupTimezoneFilter,
        setupCurrencyFilter
    ]

    setupFilters.forEach(fn => fn());

    [
        {selector: '.unmember-checkbox', filterKey: 'unMember'},
        {selector: '.landlocked-checkbox', filterKey: 'landlocked'},
        {selector: '.independent-checkbox', filterKey: 'independent'}
    ].forEach(({selector, filterKey}) => {
        setupSingleCheckboxFilter(selector, filterKey)
    })
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
        <a class="navigate-to-detail" href="/country-search/country.html?code=${country.cca3}">Подробнее</a>
        `

        container.appendChild(card)
    })
}

// функция, которая формирует url запроса с помощью queryParameters
function buildQueryUrl(baseUrl, filters) {
    const url = new URL(baseUrl)

    const simpleFields = ['name', 'areaFrom', 'areaTo', 'population']
    const arrayFields = ['regions', 'languages', 'timezones', 'continents', 'currencies']
    const booleansFields = ['unMember', 'independent']

    simpleFields.forEach(fieldName => {
        if (filters[fieldName]) url.searchParams.set(fieldName, filters[fieldName])
    })

    arrayFields.forEach(fieldName => {
        if (filters[fieldName]?.length) url.searchParams.set(fieldName, filters[fieldName].join(','))
    })

    booleansFields.forEach(fieldName => {
        if (filters[fieldName] !== null) url.searchParams.set(fieldName, filters[fieldName])
    })

    if (filters.landlocked !== null) {
        const invertedLandlocked = filters.landlocked === 'true' ? 'false' : 'true'
        url.searchParams.set('landlocked', invertedLandlocked)
    }

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
        const url = isEmptyFilters(appliedFiltersState)
        ? `${BASE_URL}/api/countries`
        : buildQueryUrl(`${BASE_URL}/api/countries/search`, appliedFiltersState)

        const res = await fetch(url)
        const json = await res.json()

        currentCountries = json.data || json
        renderCountries()
    } catch (error) {
        console.error('Ошибка при применении фильтров', error)
        renderCountries([])
    }
}

function isEmptyFilters(filters) {
    console.log({filters})
    return Object.values(filters).every(value => {
        if (Array.isArray(value)) return value.length === 0
        return value === null || value === ''
    })
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
    input.addEventListener("input", e => update(e.target.value.replace(/\D/g, ""))); // убирает не цифры
}

function setupSingleCheckboxFilter(selector, filterKey) {
    const checkbox = document.querySelector(selector);
    if (!checkbox) return;

    checkbox.addEventListener("change", () => {
        appliedFiltersState[filterKey] = checkbox.checked ? "true" : null;
        applyFilters();
    });
}