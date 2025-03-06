const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 3001;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const CACHE_TTL = 60 * 60; // 1 час
const cache = new NodeCache({ stdTTL: CACHE_TTL });

// Настройка rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 минута
    max: 60, // максимум 60 запросов в минуту
    message: { message: 'Слишком много запросов. Пожалуйста, подождите минуту.' }
});

// Настройка CORS
const corsOptions = {
    origin: '*',
    methods: ['GET'],
    allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(limiter);

// Загрузка данных
let countries = [];
let isDataLoaded = false;

async function loadData() {
    try {
        const filePath = path.join(__dirname, '../../mockData.json');
        
        // Проверка существования файла
        try {
            await fs.access(filePath);
        } catch (error) {
            throw new Error('Файл с данными не найден');
        }

        // Проверка размера файла
        const stats = await fs.stat(filePath);
        if (stats.size > MAX_FILE_SIZE) {
            throw new Error('Файл слишком большой');
        }

        const data = await fs.readFile(filePath, 'utf8');
        const parsedData = JSON.parse(data);

        // Валидация данных
        if (!Array.isArray(parsedData) || parsedData.length === 0) {
            throw new Error('Некорректный формат данных');
        }

        countries = parsedData;
        isDataLoaded = true;
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        process.exit(1); // Завершаем процесс, так как без данных сервер не может работать
    }
}

// Загрузка данных при запуске сервера
loadData();

// Middleware для проверки загрузки данных
const checkDataLoaded = (req, res, next) => {
    if (!isDataLoaded) {
        return res.status(503).json({ message: 'Сервис временно недоступен. Загрузка данных...' });
    }
    next();
};

// Middleware для валидации параметров
const validateSearchParams = (req, res, next) => {
    const { population, areaFrom, areaTo } = req.query;
    
    if (population && (isNaN(Number(population)) || Number(population) < 0)) {
        return res.status(400).json({ message: 'Некорректное значение населения' });
    }

    if (areaFrom && (isNaN(Number(areaFrom)) || Number(areaFrom) < 0)) {
        return res.status(400).json({ message: 'Некорректное значение минимальной площади' });
    }

    if (areaTo && (isNaN(Number(areaTo)) || Number(areaTo) < 0)) {
        return res.status(400).json({ message: 'Некорректное значение максимальной площади' });
    }

    next();
};

// Получение всех стран с кэшированием
app.get('/api/countries', checkDataLoaded, (req, res) => {
    const cacheKey = 'all_countries';
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
        return res.json(cachedData);
    }

    cache.set(cacheKey, countries);
    res.json(countries);
});

// Поиск по названию
app.get('/api/countries/search', checkDataLoaded, validateSearchParams, (req, res) => {
    const { 
        name,
        population,
        areaFrom,
        areaTo,
        regions,
        continents,
        languages,
        currencies,
        independent,
        timezones,
        unMember,
        landlocked,
        page = 1,
        limit = 20
    } = req.query;
    
    let filteredCountries = [...countries];

    try {
        if (name) {
            const searchName = name.toLowerCase();
            filteredCountries = filteredCountries.filter(country => 
                country.name.common.toLowerCase().includes(searchName) ||
                country.name.official.toLowerCase().includes(searchName)
            );
        }

        if (population) {
            const populationValue = Number(population);
            const minPopulation = populationValue * 0.9;
            const maxPopulation = populationValue * 1.1;
            filteredCountries = filteredCountries.filter(country => 
                country.population >= minPopulation && country.population <= maxPopulation
            );
        }

        if (areaFrom) {
            const fromValue = Number(areaFrom);
            filteredCountries = filteredCountries.filter(country => 
                country.area >= fromValue
            );
        }

        if (areaTo) {
            const toValue = Number(areaTo);
            filteredCountries = filteredCountries.filter(country => 
                country.area <= toValue
            );
        }

        if (regions) {
            const regionList = regions.split(',');
            filteredCountries = filteredCountries.filter(country => 
                regionList.includes(country.region)
            );
        }

        if (continents) {
            const continentList = continents.split(',');
            filteredCountries = filteredCountries.filter(country => 
                country.continents.some(continent => continentList.includes(continent))
            );
        }

        if (languages) {
            const languageList = languages.split(',');
            filteredCountries = filteredCountries.filter(country => 
                Object.keys(country.languages || {}).some(lang => languageList.includes(lang))
            );
        }

        if (currencies) {
            const currencyList = currencies.split(',');
            filteredCountries = filteredCountries.filter(country => 
                Object.keys(country.currencies || {}).some(currency => currencyList.includes(currency))
            );
        }

        if (independent !== undefined) {
            const isIndependent = independent === 'true';
            filteredCountries = filteredCountries.filter(country => 
                country.independent === isIndependent
            );
        }

        if (timezones) {
            const timezoneList = timezones.split(',').map(tz => {
                return tz.replace('UTC ', 'UTC+');
            });
            filteredCountries = filteredCountries.filter(country => 
                timezoneList.some(searchTimezone => 
                    country.timezones.includes(searchTimezone)
                )
            );
        }

        if (unMember !== undefined) {
            const isUnMember = unMember === 'true';
            filteredCountries = filteredCountries.filter(country => 
                country.unMember === isUnMember
            );
        }

        if (landlocked !== undefined) {
            const isLandlocked = landlocked === 'true';
            filteredCountries = filteredCountries.filter(country => 
                country.landlocked === isLandlocked
            );
        }

        // Пагинация
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const paginatedCountries = filteredCountries.slice(startIndex, endIndex);

        res.json({
            total: filteredCountries.length,
            page: pageNum,
            limit: limitNum,
            data: paginatedCountries
        });
    } catch (error) {
        console.error('Ошибка при фильтрации:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

// Получение страны по коду
app.get('/api/countries/:code', checkDataLoaded, (req, res) => {
    const { code } = req.params;
    
    if (!code || code.length < 2 || code.length > 3) {
        return res.status(400).json({ message: 'Некорректный код страны' });
    }

    const country = countries.find(c => 
        c.cca2.toLowerCase() === code.toLowerCase() ||
        c.cca3.toLowerCase() === code.toLowerCase()
    );
    
    if (!country) {
        return res.status(404).json({ message: 'Страна не найдена' });
    }
    
    res.json(country);
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Получен сигнал SIGTERM. Завершение работы...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Получен сигнал SIGINT. Завершение работы...');
    process.exit(0);
});

// Экспортируем приложение для тестов
module.exports = {
    app,
    isDataLoaded
};

// Запускаем сервер только если файл запущен напрямую
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Сервер запущен на порту ${PORT}`);
    });
} 