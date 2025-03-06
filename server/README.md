# Country Search API

REST API сервер для поиска информации о странах. Сервер предоставляет доступ к данным о странах и позволяет выполнять поиск по различным параметрам.

## Установка

1. Клонируйте репозиторий
2. Перейдите в директорию сервера:
   ```bash
   cd server
   ```
3. Установите зависимости:
   ```bash
   npm install
   ```

## Запуск

Для запуска сервера в режиме разработки:
```bash
npm run dev
```

Для запуска в продакшн режиме:
```bash
npm start
```

Сервер будет доступен по адресу: `http://localhost:3001`

## API Endpoints

### Получение всех стран
```
GET /api/countries
```

### Поиск стран
```
GET /api/countries/search
```

Параметры поиска:
- `name` - поиск по названию страны (общему или официальному)
- `population` - точное значение населения
- `areaFrom` - минимальная площадь
- `areaTo` - максимальная площадь
- `regions` - список регионов через запятую (например: "Europe,Asia")
- `continents` - список континентов через запятую (например: "Europe,Asia")
- `languages` - список языков через запятую (например: "eng,rus")
- `currencies` - список валют через запятую (например: "USD,EUR")
- `independent` - независимость страны (true/false)
- `timezones` - список часовых поясов через запятую (например: "UTC+03:00,UTC+04:00")
- `unMember` - членство в ООН (true/false)
- `landlocked` - выход к морю (true/false)

Примеры запросов:
```
# Поиск по населению
GET /api/countries/search?population=144100000

# Поиск по площади
GET /api/countries/search?areaFrom=1000000&areaTo=2000000

# Поиск по региону и континенту
GET /api/countries/search?regions=Europe&continents=Europe

# Поиск по языкам
GET /api/countries/search?languages=eng,rus

# Поиск по валютам
GET /api/countries/search?currencies=USD,EUR

# Поиск независимых стран
GET /api/countries/search?independent=true

# Поиск по часовым поясам
GET /api/countries/search?timezones=UTC+03:00

# Поиск стран-членов ООН
GET /api/countries/search?unMember=true

# Поиск стран без выхода к морю
GET /api/countries/search?landlocked=true

# Комбинированный поиск
GET /api/countries/search?regions=Europe&languages=eng&independent=true&unMember=true
```

### Получение страны по коду
```
GET /api/countries/:code
```

Параметры:
- `code` - код страны (CCA2 или CCA3)

Примеры:
```
GET /api/countries/RU
GET /api/countries/RUS
``` 