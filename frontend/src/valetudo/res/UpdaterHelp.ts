export const UpdaterHelp = `
## Updater

The Valetudo updater is a convenience feature aiming to make life with Valetudo a bit easier.

As it is built with privacy in mind, you will have to manually click a button to make it search for newer versions of Valetudo.
No daily update check means no daily pings to some external server.

By default, it's polling the GitHub API, meaning that I am not able to collect any data about you.

**Note: The updater will always try to update you to the next chronological release. If you're multiple releases behind,
you will have to update multiple times in a row.**

As the updater is just a convenience feature, there might be situations in which it doesn't work. In those situations,
you will have to do a manual update, which usually involves SSH access to the robot.

Sometimes, a configuration change might enable you to use the updater. In other instances, your model of robot might not
be able to use the updater at all as there's not enough storage built in. This is not a bug. That's just how it is.

It is also worth noting that the updater won't update the robots firmware. It only updates the Valetudo binary.

`;

export const UpdaterHelpRu = `
## Средство обновления

Средство обновления Valetudo — это функция для удобства, призванная немного облегчить жизнь с Valetudo.

Поскольку оно создано с заботой о конфиденциальности, вам придётся вручную нажать кнопку, чтобы запустить поиск более новых версий Valetudo.
Отсутствие ежедневной проверки обновлений означает отсутствие ежедневных запросов к какому-либо внешнему серверу.

По умолчанию оно опрашивает API GitHub, что означает, что я не могу собирать о вас какие-либо данные.

**Примечание: средство обновления всегда будет пытаться обновить вас до следующего по хронологии выпуска. Если вы отстаёте на несколько выпусков,
вам придётся обновляться несколько раз подряд.**

Так как средство обновления — это всего лишь функция для удобства, возможны ситуации, в которых оно не работает. В таких случаях
вам придётся выполнить обновление вручную, что обычно подразумевает доступ к роботу по SSH.

Иногда изменение конфигурации может позволить вам использовать средство обновления. В других случаях ваша модель робота может вовсе
не иметь возможности использовать средство обновления, так как в ней недостаточно встроенной памяти. Это не ошибка. Просто так уж оно есть.

Также стоит отметить, что средство обновления не обновляет прошивку робота. Оно обновляет только двоичный файл Valetudo.

`;
