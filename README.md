# Практика 3 — Electron
Кондаров Дмитрий Александрович, ТРПО23-1. Вариант 5: системный трей.

## Запуск
Установить Node.js LTS и npm, выполнить `npm ci`, затем `npm start`.
`npm test` — проверки чтения каталога. `npm run dist` — Windows NSIS.
Закрытие окна скрывает его; значок в трее → Показать / Выйти.

## Архитектура
main.js управляет ОС и IPC; preload.js публикует два узких метода; renderer.js отвечает за DOM.
nodeIntegration отключён, contextIsolation и sandbox включены.
Удалённый репозиторий не создан. Исходники готовы для crossplatform-practice-03.
