export const DoNotDisturbHelp = `
## Do not disturb

Some firmwares allow you to define a do not disturb period where certain features of the robot are disabled.
What exactly changes may differ based on robot vendor, model and firmware version.

For example, the robot might not continue a partially finished task which has been interrupted due to the
robot having to charge.
As charging back up to 100% battery may take a few hours, it could happen that the robot attempts to continue cleaning
at 3am, which is often considered undesirable.

Another thing that can be affected by the DND setting is the auto empty dock as those are usually pretty loud.


**Please note that DND times are evaluated and stored as UTC. They are only displayed in your current browser timezone
for your convenience.**
`;

export const DoNotDisturbHelpRu = `
## Режим "Не беспокоить"

Некоторые прошивки позволяют задать период "Не беспокоить", в течение которого определённые функции робота отключаются.
Что именно меняется, зависит от производителя робота, модели и версии прошивки.

Например, робот может не продолжать частично выполненную задачу, которая была прервана из-за того,
что роботу потребовалось зарядиться.
Поскольку зарядка до 100% батареи может занять несколько часов, может случиться так, что робот попытается продолжить уборку
в 3 часа ночи, что часто считается нежелательным.

Ещё одна вещь, на которую может влиять настройка DND, — это док-станция с автоматической очисткой контейнера, так как они обычно довольно громкие.


**Обратите внимание, что время DND вычисляется и хранится в UTC. Оно отображается в часовом поясе вашего текущего браузера
лишь для вашего удобства.**
`;
