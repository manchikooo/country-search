document.addEventListener('DOMContentLoaded', async () => {
    const modal = document.getElementById('modal');

    document.querySelector('.create-button').addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    document.getElementById('cancelModal').addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    setupFormListener()
});

function setupFormListener () {
    const form = document.getElementById('createCountryForm');
    const modal = document.getElementById('modal');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const common = form.elements['common'].value.trim();
        const official = form.elements['official'].value.trim();
        const cca3 = form.elements['cca3'].value.trim().toUpperCase();

        const payload = {
            name: {
                common,
                official
            },
            cca3
        };

        try {
            const response = await fetch('https://country-search-seven-gilt.vercel.app/api/countries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }

            const newCountry = await response.json();

            modal.classList.add('hidden');
            form.reset();

            prependCountryCard(newCountry.data);
        } catch (error) {
            console.error(error);
            alert('Произошла ошибка при создании страны.');
        }
    });
}

function prependCountryCard(country) {
    const countriesGrid = document.querySelector('.countries-grid');

    const name = country.name.official || 'Без названия';
    const cca3 = country.cca3;

    const card = document.createElement("div");
    card.className = 'card';
    card.innerHTML = `
            <h3>${name}</h3>
            <a class="navigate-to-detail" href="/country-search/country.html?code=${country.cca3}">Подробнее</a>
            <button class="delete-button" data-code="${cca3}">x</button>
        `;

    // Кнопка удаления с запросом
    card.querySelector('.delete-button').addEventListener('click', async (e) => {
        const code = e.target.dataset.code;
        if (!confirm(`Удалить страну с кодом ${code}?`)) return;

        try {
            const res = await fetch(`https://country-search-seven-gilt.vercel.app/api/countries/${code}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error(`Ошибка удаления: ${res.status}`);
            alert('Страна удалена');

            // Удаление из DOM
            card.remove();

            // Удаление из currentCountries
            currentCountries = currentCountries.filter(c => c.cca3 !== code);

        } catch (err) {
            console.error(err);
            alert('Не удалось удалить страну.');
        }
    });

    // Добавить в начало контейнера
    countriesGrid.prepend(card);
}