const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

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

## Документация

Интерактивная документация API доступна по адресу:
[https://manchikooo.github.io/country-search/](https://manchikooo.github.io/country-search/)

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

fs.copyFileSync(
    path.join(__dirname, 'swagger.yaml'),
    path.join(publicDir, 'swagger.yaml')
);

const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Country Search API Documentation" />
    <title>Country Search API - Documentation</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
    <script>
        window.onload = () => {
            window.ui = SwaggerUIBundle({
                url: 'swagger.yaml',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset
                ],
            });
        };
    </script>
</body>
</html>
`;

fs.writeFileSync(path.join(publicDir, 'index.html'), swaggerHtml);