const BASE_URL = 'https://country-search-seven-gilt.vercel.app'

let detailCountry = {}

document.addEventListener('DOMContentLoaded', async () => {
    const searchParams = new URLSearchParams(window.location.search)
    const cca3 = searchParams.get('code')

    const country = await fetch(`${BASE_URL}/api/countries/${cca3}`)

    detailCountry = await country.json()
    console.log({detailCountry})
})


