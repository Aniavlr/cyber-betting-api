# Cyber Betting API

REST API для ставок на киберспортивные матчи.

## Стек

- NestJS + TypeScript
- PostgreSQL
- TypeORM

## Документация API

После запуска доступна по адресу:

```
http://localhost:3000/api
```

Или файл api.json

## Тесты

```bash
npm run test
```

## Эндпоинты

| Метод | URL                 | Описание              |
| ----- | ------------------- | --------------------- |
| GET   | /users              | Все пользователи      |
| GET   | /users/:id          | Пользователь по ID    |
| POST  | /users              | Создать пользователя  |
| GET   | /matches            | Все матчи             |
| GET   | /matches/:id        | Матч по ID            |
| POST  | /matches            | Создать матч          |
| PATCH | /matches/:id/status | Изменить статус матча |
| PATCH | /matches/:id/winner | Указать победителя    |
| GET   | /bets               | Все ставки            |
| GET   | /bets/user/:userId  | Ставки пользователя   |
| POST  | /bets               | Сделать ставку        |
