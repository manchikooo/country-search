const filterState = {
    name: '',
    languages: [],
    regions: []
}

let currentCountries = []

document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('https://country-search-seven-gilt.vercel.app/api/countries')

    currentCountries = await response.json();
    renderCountries()

    setupNameFilter()
    setupRegionFilter()
    setupLanguageFilter()
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

async function applyFilters() {
    try {
        const queries = []

        if (filterState.name) {
            queries.push(fetch(`https://country-search-seven-gilt.vercel.app/api/countries/search?name=${encodeURIComponent(filterState.name)}`)
                .then(response => response.ok ? response.json() : ''))
        }

        for (const region of filterState.regions) {
            queries.push(fetch(`https://restcountries.com/v3.1/region/${region}`)
                .then(response => response.ok ? response.json() : []))
        }

        for (const lang of filterState.languages) {
            queries.push(fetch(`https://restcountries.com/v3.1/lang/${lang}`)
                .then(response => response.ok ? response.json() : []))
        }

        if (queries.length === 0) {
            const res = await fetch('https://restcountries.com/v3.1/all')
            currentCountries = res.json()
            renderCountries()
        }

        const results = await Promise.all(queries)
        console.log({results})
        // передаем массив с массивами
        currentCountries = intersectCountries(results)
        console.log(111, {currentCountries})


        renderCountries()
    } catch (error) {
        console.error('Ошибка при применении фильтров', error)
        renderCountries([])
    }
}

function intersectCountries(countriesList) {
    if (!countriesList.length) return []

    const key = (country) => country.cca3 || country.name.common

    const keysOfTreeArrays = countriesList.map(list => {
        return list.map(key)
    })

    console.log({ keysOfTreeArrays})

    const firstList = countriesList[0]
    const result = []

    firstList.forEach(country => {
        const countryKey = key(country)

        const inAll = keysOfTreeArrays.every(list => list.includes(countryKey))
        if (inAll) {
            result.push(country)
        }
    })

    return result
}

function setupNameFilter () {
    const input = document.getElementById('titleSearch')

    let debounceTimer = null

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(()=>{
            filterState.name = input.value.trim()
            applyFilters()
        }, 400)
    })
}

function setupRegionFilter () {
    const checkboxes = document.querySelectorAll('.region-inputs input[type="checkbox"]')

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            filterState.regions = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map( c => c.dataset.region.toLowerCase())
            applyFilters()
        })
    })
}

function setupLanguageFilter () {
    const checkboxes = document.querySelectorAll('.language-inputs input[type="checkbox"]')

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            filterState.languages = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map( c => c.dataset.language.toLowerCase())
            applyFilters()
        })
    })
}