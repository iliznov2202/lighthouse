# Маяк — backend

NestJS 11, TypeScript, PostgreSQL, Prisma ORM 7 и REST API. Backend независим от frontend в корне репозитория. Frontend пока использует демо-данные; подключение интерфейса к API — отдельный этап.

## Запуск

Требуются Node.js 22.12+ и Docker с Compose.

```sh
cd backend
npm ci
```

Скопировать `.env.example` в `.env`: PowerShell `Copy-Item .env.example .env`, macOS/Linux `cp .env.example .env`.

Заменить заглушки `POSTGRES_PASSWORD`, пароль в `DATABASE_URL`, `JWT_ACCESS_SECRET` и `SEED_USER_PASSWORD`. Пароль базы в URL должен быть URL-encoded, если содержит специальные символы. Случайное значение можно получить командой:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Использовать отдельные значения для каждого секрета. `.env` игнорируется Git; реальные секреты не добавлять в примеры, исходники или коммиты. Backend проверяет обязательные настройки при запуске.

```sh
docker compose up -d --wait
npm run prisma:generate
npm run db:deploy
npm run db:seed
npm run start:dev
```

API: http://127.0.0.1:3000. Swagger: http://127.0.0.1:3000/docs, OpenAPI JSON: http://127.0.0.1:3000/docs-json. В Swagger вставить access token через Authorize. Локальные frontend origins заданы в `FRONTEND_ORIGINS` через запятую, по умолчанию localhost и 127.0.0.1 на порту 5173.

Для собранного приложения:

```sh
npm run build
npm start
```

Backend слушает loopback `127.0.0.1`. Для будущего контейнерного или внешнего развертывания нужно явно настроить адрес, reverse proxy и HTTPS.

Меры безопасности, ограничения текущего этапа, production HTTPS, отдельные базы, backup/restore и требования к будущим модулям описаны в [SECURITY.md](SECURITY.md). Production-конфигурация — `compose.production.yml` и `.env.production.example`; локальный запуск остаётся через `compose.yml`.

Остановка базы: `docker compose down`. Данные сохраняются в volume. Не добавлять `-v`, если нужно сохранить данные.

## Миграции и seed

Начальная SQL-миграция находится в `prisma/migrations`. Для применения существующих миграций использовать `npm run db:deploy`. Для создания новой миграции после изменения схемы:

```sh
npm run db:migrate -- --name describe_change
npm run prisma:generate
```

Prisma 7 использует `prisma.config.ts` для URL базы, миграций и seed; runtime и seed используют `@prisma/adapter-pg`. Seed запускается явно, а не автоматически после миграций.

Seed создаёт школу «Школа №123», город Москва, классы 8Б, 9А, 9Б, 10А и 10Б. В 9Б добавляются Анна (`anna@mayak.test`), Иван (`ivan@mayak.test`), Мария (`maria@mayak.test`). Пароль берётся из локального `SEED_USER_PASSWORD`. Повторный запуск сохраняет существующие аккаунты, их пароли и членство. Seed запрещён при `NODE_ENV=production`.

## REST API

| Метод | Путь | Доступ и поведение |
|---|---|---|
| POST | `/auth/register` | `{ email, password, name }`, 201, пользователь и токены |
| POST | `/auth/login` | `{ email, password }`, 200, пользователь и токены |
| POST | `/auth/refresh` | `{ refreshToken }`, 200, новая пара токенов |
| POST | `/auth/logout` | `{ refreshToken }`, 204, отзыв соответствующей сессии |
| GET | `/users/me` | Bearer access JWT, текущий пользователь, школа и класс |
| GET | `/schools?query=123` | Публичный поиск по названию или городу, максимум 50 результатов |
| GET | `/schools/:schoolId/classes` | Публичный список классов и число участников |
| POST | `/classes` | Bearer, `{ schoolId, name }`, 201, создание класса без автоматического вступления |
| POST | `/classes/:classId/join` | Bearer, 200, вступление в класс и его школу |
| GET | `/classes/:classId` | Bearer, сведения о классе и школе, число участников |

Регистрация начинается без школы и класса. Вступление назначает оба значения атомарно. Повторное вступление в тот же класс допустимо; переход в другой класс или школу возвращает 409. Создание и просмотр класса другой школы после вступления возвращают 403. Школы на этом этапе создаются seed, публичного API создания школ нет. Название класса — номер 1–11 и кириллическая буква, например `9Б`; регистр нормализуется. Уникальность названия действует внутри школы. Список учеников и их email через API класса не раскрываются.

Access JWT действует 15 минут по умолчанию, содержит идентификаторы пользователя и сессии, имеет issuer/audience и алгоритм HS256. Refresh token — 48 случайных байт (64 символа base64url); база хранит только SHA-256 hash. Пароли — Argon2id. Refresh одноразовый, обновляется атомарно: при конкурентном обновлении успешен только один запрос. Старый refresh становится недействительным. Сессия имеет абсолютный срок 30 дней; refresh не продлевает его. Входы с разных устройств создают отдельные сессии. Logout идемпотентен и немедленно блокирует access token своей сессии, поскольку guard проверяет состояние сессии в базе. Отзыв не затрагивает остальные сессии.

Токены передаются в JSON, access — в заголовке `Authorization: Bearer ...`. Это API-контракт текущего этапа; хранение токенов на frontend ещё не реализовано.

ValidationPipe отклоняет неизвестные поля. Ошибки имеют формат `{ statusCode, message, path, timestamp }`. Ожидаемые ошибки: 400 (валидация), 401 (авторизация), 403 (другая школа), 404 (нет ресурса), 409 (дубликат/конфликт членства). Ответы 500 не раскрывают внутренние детали.

## Проверки

На отдельной локальной базе применить миграции, выполнить seed и запустить сервер. Затем в другом терминале:

```sh
cd backend
npm run prisma:validate
npm run build
npm run test:e2e
npm run test:security
```

Тест использует настоящий PostgreSQL из `DATABASE_URL` и сервер `http://127.0.0.1:PORT` (можно задать `API_TEST_URL`). Он создаёт временный аккаунт, школу и класс, проверяет все endpoints, hash паролей и токенов, конкурентный refresh, срок и отзыв сессий, членство, ограничения базы, CORS и Swagger, затем удаляет свои данные. Для теста нужна seeded школа №123 и свободное имя класса `7Я`; не запускать на production базе.

Проверено 1 октября 2026 года: Node.js 22.19, Prisma 7.10, сборка, типы, Prisma validate, применение миграции, повторный seed и интеграционные тесты REST API прошли; `npm audit` — 0 уязвимостей. Docker на машине отсутствовал, поэтому runtime-проверки выполнены на временном локальном PostgreSQL 18.4. Запуск Compose с PostgreSQL 17 остаётся непроверенным в этом окружении. Временные бинарники, данные базы и локальная `.env` не входят в репозиторий.

## Архитектура

`src/prisma` — общий PrismaModule/PrismaService и жизненный цикл подключения. `src/auth` — JWT, сессии, guard, DTO и авторизация. `src/users`, `src/schools`, `src/classes` — самостоятельные Nest-модули с controller/service/DTO. `src/common` — глобальный фильтр ошибок; `src/config` — проверка окружения. Пароли и hash refresh не входят в публичную проекцию пользователя.

Одна школа и один класс задаются nullable полями `User.schoolId` и `User.classId`. Составной внешний ключ гарантирует принадлежность класса выбранной школе; SQL CHECK запрещает класс без школы.

Следующие возможности можно подключать через отдельные Nest-модули `schedule`, `homework`, `feed`, `notifications`, `competitions`, `ai`, `uploads`, `moderation`, импортируя PrismaModule и AuthModule. На этом этапе они не созданы.

Транзитивные зависимости `deepmerge-ts`, `mysql2` и `js-yaml` закреплены через `overrides` на исправленных версиях. Lockfile включён в проект; при обновлении Prisma/Swagger пересматривать overrides и проверять сборку, миграции и интеграционные тесты.
