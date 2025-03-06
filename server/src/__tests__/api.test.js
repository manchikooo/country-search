const request = require('supertest');
const { app, loadData } = require('../index');

describe('API Endpoints', () => {
    let server;

    beforeAll(async () => {
        server = app.listen();
    });

    afterAll(async () => {
        await server.close();
    });

    describe('GET /api/countries before data load', () => {
        it('should return 503 when data is not loaded', async () => {
            const response = await request(server).get('/api/countries');
            expect(response.status).toBe(503);
            expect(response.body.message).toBe('Сервис временно недоступен. Загрузка данных...');
        });
    });

    describe('API endpoints after data load', () => {
        beforeAll(async () => {
            await loadData();
        });

        describe('GET /api/countries', () => {
            it('should return all countries', async () => {
                const response = await request(server).get('/api/countries');
                expect(response.status).toBe(200);
                expect(Array.isArray(response.body)).toBe(true);
                expect(response.body.length).toBeGreaterThan(0);
            });
        });

        describe('GET /api/countries/search', () => {
            it('should search by name', async () => {
                const response = await request(server)
                    .get('/api/countries/search')
                    .query({ name: 'Russia' });
                
                expect(response.status).toBe(200);
                expect(response.body.data.length).toBeGreaterThan(0);
                expect(response.body.data[0].name.common).toBe('Russia');
            });

            it('should search by population', async () => {
                const response = await request(server)
                    .get('/api/countries/search')
                    .query({ population: '144100000' });
                
                expect(response.status).toBe(200);
                expect(response.body.data.length).toBeGreaterThan(0);
                expect(response.body.data[0].name.common).toBe('Russia');
            });

            it('should search by area range', async () => {
                const response = await request(server)
                    .get('/api/countries/search')
                    .query({ areaFrom: '1000000', areaTo: '2000000' });
                
                expect(response.status).toBe(200);
                expect(response.body.data.length).toBeGreaterThan(0);
                expect(response.body.data[0].area).toBeGreaterThanOrEqual(1000000);
                expect(response.body.data[0].area).toBeLessThanOrEqual(2000000);
            });

            it('should search by region', async () => {
                const response = await request(server)
                    .get('/api/countries/search')
                    .query({ regions: 'Europe' });
                
                expect(response.status).toBe(200);
                expect(response.body.data.length).toBeGreaterThan(0);
                expect(response.body.data[0].region).toBe('Europe');
            });

            it('should search by continent', async () => {
                const response = await request(server)
                    .get('/api/countries/search')
                    .query({ continents: 'Europe' });
                
                expect(response.status).toBe(200);
                expect(response.body.data.length).toBeGreaterThan(0);
                expect(response.body.data[0].continents).toContain('Europe');
            });

            it('should search by language', async () => {
                const response = await request(server)
                    .get('/api/countries/search')
                    .query({ languages: 'rus' });
                
                expect(response.status).toBe(200);
                expect(response.body.data.length).toBeGreaterThan(0);
                expect(response.body.data[0].languages).toHaveProperty('rus');
            });

            it('should search by currency', async () => {
                const response = await request(server)
                    .get('/api/countries/search')
                    .query({ currencies: 'RUB' });
                
                expect(response.status).toBe(200);
                expect(response.body.data.length).toBeGreaterThan(0);
                expect(response.body.data[0].currencies).toHaveProperty('RUB');
            });

            it('should search by independence status', async () => {
                const response = await request(server)
                    .get('/api/countries/search')
                    .query({ independent: 'true' });
                
                expect(response.status).toBe(200);
                expect(response.body.data.length).toBeGreaterThan(0);
                expect(response.body.data[0].independent).toBe(true);
            });

            it('should search by timezone', async () => {
                const response = await request(server)
                    .get('/api/countries/search')
                    .query({ timezones: 'UTC+03:00' });
                
                expect(response.status).toBe(200);
                expect(response.body.data.length).toBeGreaterThan(0);
                expect(response.body.data[0].timezones).toContain('UTC+03:00');
            });

            it('should search by UN membership', async () => {
                const response = await request(server)
                    .get('/api/countries/search')
                    .query({ unMember: 'true' });
                
                expect(response.status).toBe(200);
                expect(response.body.data.length).toBeGreaterThan(0);
                expect(response.body.data[0].unMember).toBe(true);
            });

            it('should search by landlocked status', async () => {
                const response = await request(server)
                    .get('/api/countries/search')
                    .query({ landlocked: 'true' });
                
                expect(response.status).toBe(200);
                expect(response.body.data.length).toBeGreaterThan(0);
                expect(response.body.data[0].landlocked).toBe(true);
            });

            it('should handle pagination', async () => {
                const response = await request(server)
                    .get('/api/countries/search')
                    .query({ page: 1, limit: 10 });
                
                expect(response.status).toBe(200);
                expect(response.body.data.length).toBeLessThanOrEqual(10);
                expect(response.body.page).toBe(1);
                expect(response.body.limit).toBe(10);
                expect(response.body.total).toBeGreaterThan(0);
            });

            it('should validate numeric parameters', async () => {
                const response = await request(server)
                    .get('/api/countries/search')
                    .query({ population: 'invalid' });
                
                expect(response.status).toBe(400);
                expect(response.body.message).toBe('Некорректное значение населения');
            });
        });

        describe('GET /api/countries/:code', () => {
            it('should return country by code', async () => {
                const response = await request(server).get('/api/countries/RU');
                
                expect(response.status).toBe(200);
                expect(response.body.name.common).toBe('Russia');
            });

            it('should return 404 for invalid code', async () => {
                const response = await request(server).get('/api/countries/XX');
                
                expect(response.status).toBe(404);
                expect(response.body.message).toBe('Страна не найдена');
            });

            it('should validate code length', async () => {
                const response = await request(server).get('/api/countries/X');
                
                expect(response.status).toBe(400);
                expect(response.body.message).toBe('Некорректный код страны');
            });
        });

        describe('Rate Limiting', () => {
            it('should limit requests to 60 per minute', async () => {
                const requests = Array(61).fill().map(() => 
                    request(server).get('/api/countries')
                );

                const responses = await Promise.all(requests);
                const failedRequests = responses.filter(r => r.status === 429);
                
                expect(failedRequests.length).toBeGreaterThan(0);
                expect(failedRequests[0].body.message).toBe('Слишком много запросов. Пожалуйста, подождите минуту.');
            });
        });
    });
});