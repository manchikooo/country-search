const fs = require('fs');
const path = require('path');

// Читаем данные
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../../mockData.json'), 'utf8'));

// Создаем статические JSON файлы для каждого эндпоинта
const endpoints = {
    'all-countries.json': data,
    'countries-by-population.json': data.sort((a, b) => b.population - a.population),
    'countries-by-region.json': data.reduce((acc, country) => {
        const region = country.region || 'Unknown';
        if (!acc[region]) acc[region] = [];
        acc[region].push(country);
        return acc;
    }, {}),
    'countries-by-language.json': data.reduce((acc, country) => {
        Object.entries(country.languages || {}).forEach(([code, name]) => {
            if (!acc[code]) acc[code] = [];
            acc[code].push(country);
        });
        return acc;
    }, {})
};

// Создаем директорию для статических файлов
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

// Сохраняем статические файлы
Object.entries(endpoints).forEach(([filename, content]) => {
    fs.writeFileSync(
        path.join(publicDir, filename),
        JSON.stringify(content, null, 2)
    );
});

// Создаем README.md с документацией
const readme = `# Country Search API

Это статическая версия API для поиска информации о странах.

## Доступные эндпоинты

1. \`/all-countries.json\` - все страны
2. \`/countries-by-population.json\` - страны, отсортированные по населению
3. \`/countries-by-region.json\` - страны, сгруппированные по регионам
4. \`/countries-by-language.json\` - страны, сгруппированные по языкам

## Примеры использования

\`\`\`javascript
// Получить все страны
fetch('https://manchikooo.github.io/country-search/all-countries.json')
  .then(response => response.json())
  .then(data => console.log(data));

// Получить страны по региону
fetch('https://manchikooo.github.io/country-search/countries-by-region.json')
  .then(response => response.json())
  .then(data => console.log(data['Europe']));
\`\`\`
`;

fs.writeFileSync(path.join(publicDir, 'README.md'), readme);

console.log('Статические файлы API успешно созданы!'); 