# Country Search API

Это статическая версия API для поиска информации о странах.

## Документация

Интерактивная документация API доступна по адресу:
[https://manchikooo.github.io/country-search/](https://manchikooo.github.io/country-search/)

## Доступные эндпоинты

1. `/all-countries.json` - все страны
2. `/countries-by-population.json` - страны, отсортированные по населению
3. `/countries-by-region.json` - страны, сгруппированные по регионам
4. `/countries-by-language.json` - страны, сгруппированные по языкам

## Примеры использования

```javascript
// Получить все страны
fetch('https://manchikooo.github.io/country-search/all-countries.json')
  .then(response => response.json())
  .then(data => console.log(data));

// Получить страны по региону
fetch('https://manchikooo.github.io/country-search/countries-by-region.json')
  .then(response => response.json())
  .then(data => console.log(data['Europe']));
```
