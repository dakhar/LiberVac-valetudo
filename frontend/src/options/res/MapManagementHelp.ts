export const MapManagementHelp = `
## Map Management

This page allows you to do map-related tasks. What exactly can be done here depends on your model of robot as well
as its firmware.<br/>If you don't see something on this page, it is likely not supported by your robot.

Some robots may require you to manually enable persistent maps before you can do most map-related things.
Others may not even allow disabling of persistent maps because why would you.

There are also some legacy robots, which don't feature persistent maps at all.

Some robots may require a full cleanup task including them returning to the dock on their own for a new map to be saved.
Others may either optionally allow for fast mapping via a mapping pass or even require a mapping pass before they can be used.

### Terminology

Please note that all these concepts need firmware support by your robot.
Not everything might be available on every robot. 

#### Segments

A segment is a partition of the map as decided by the robots' firmware.
Segments enable you to just clean one or more predefined areas. Most firmwares also allow naming them.

You may know them as rooms, however they don't necessarily have to be actual rooms.
There could for example be a segment, which is just the area around your dining table.

On most firmwares, the robot uses the segment data to optimize its navigation and drive the most efficient path.

#### Zones

Zones are just rectangles that you can draw on the map to send the robot there.
Depending on the firmware of your robot, it might accept just one or multiple zones as an input.
`;

export const MapManagementHelpRu = `
## Управление картой

Эта страница позволяет выполнять задачи, связанные с картой. Что именно здесь можно сделать, зависит от модели вашего робота,
а также от его прошивки.<br/>Если вы не видите чего-либо на этой странице, скорее всего, это не поддерживается вашим роботом.

Некоторым роботам может потребоваться вручную включить постоянные карты, прежде чем вы сможете выполнять большинство связанных с картой действий.
Другие могут даже не позволять отключать постоянные карты, потому что зачем это вообще нужно.

Существуют также некоторые устаревшие роботы, которые вовсе не поддерживают постоянные карты.

Одним роботам для сохранения новой карты может потребоваться полная уборка, включая самостоятельное возвращение на базу.
Другие могут либо опционально позволять быстрое построение карты с помощью прохода картографирования, либо даже требовать такой проход перед использованием.

### Терминология

Обратите внимание, что все эти концепции требуют поддержки со стороны прошивки вашего робота.
Не всё может быть доступно на каждом роботе.

#### Сегменты

Сегмент — это часть карты, определённая прошивкой робота.
Сегменты позволяют убирать только один или несколько заранее заданных участков. Большинство прошивок также позволяют давать им названия.

Возможно, вы знаете их как комнаты, однако это не обязательно должны быть настоящие комнаты.
Например, сегментом может быть просто участок вокруг вашего обеденного стола.

В большинстве прошивок робот использует данные о сегментах для оптимизации навигации и построения наиболее эффективного маршрута.

#### Зоны

Зоны — это просто прямоугольники, которые можно нарисовать на карте, чтобы отправить туда робота.
В зависимости от прошивки вашего робота он может принимать на вход одну или несколько зон.
`;
