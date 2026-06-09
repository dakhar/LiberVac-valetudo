export const SegmentEditHelp = `
## Segment Management

A segment is a partition of the map as decided by the robots' firmware.
Segments enable you to just clean one or more predefined areas. Most firmwares also allow naming them.

You may know them as rooms, however they don't necessarily have to be actual rooms.
There could for example be a segment, which is just the area around your dining table.

On most firmwares, the robot uses the segment data to optimize its navigation and drive the most efficient path.


You can select a segment by clicking on it. Depending on your firmware, you can then split it into two or give it a name.
If you select another segment, you can also join the two to form one bigger segment if the firmware allows that.


Segment colors are determined on-the-fly by the map renderer and don't mean anything. They're simply different so that you
can distinguish them from each other. From time to time segments might also change color because one or more of its pixels changed.

### Common issues/Questions

#### I don't see any segments

You can only edit segments if there are any. If you only see a blue map then you have no segments.

Make sure that you've done a full cleanup task with the robot returning to its dock on its own without any interruption.
This is usually required for the robot to split the map into segments.

Also, some firmwares might need you to manually enable the saving of persistent maps before starting that full cleanup task.

#### I can't split a segment

Sometimes, the cutting line placement needs some wiggling to work.
It is not required to carefully place the cutting line exactly between the wall pixels. In fact, this often prevents
a successful split. Try dragging it over the whole width/height of the segment instead of just parts of it.

In some room layouts, you also might have to split a segment multiple times and then rejoin some of those parts to get 
the desired result.

#### Can I delete a segment?

No.

`;

export const SegmentEditHelpRu = `
## Управление сегментами

Сегмент — это часть карты, определённая прошивкой робота.
Сегменты позволяют убирать только один или несколько заранее заданных участков. Большинство прошивок также позволяют давать им названия.

Возможно, вы знаете их как комнаты, однако это не обязательно должны быть настоящие комнаты.
Например, сегментом может быть просто участок вокруг вашего обеденного стола.

В большинстве прошивок робот использует данные о сегментах для оптимизации навигации и построения наиболее эффективного маршрута.


Сегмент можно выбрать, нажав на него. В зависимости от прошивки вы затем можете разделить его на два или дать ему название.
Если выбрать другой сегмент, при поддержке этой функции прошивкой их также можно объединить в один больший сегмент.


Цвета сегментов определяются на лету модулем отрисовки карты и ничего не означают. Они просто различаются, чтобы вы
могли отличать сегменты друг от друга. Время от времени сегменты также могут менять цвет, потому что изменился один или несколько их пикселей.

### Распространённые проблемы/вопросы

#### Я не вижу никаких сегментов

Редактировать сегменты можно только при их наличии. Если вы видите лишь синюю карту, значит, сегментов нет.

Убедитесь, что вы выполнили полную уборку, при которой робот самостоятельно вернулся на базу без каких-либо прерываний.
Обычно это необходимо, чтобы робот разделил карту на сегменты.

Кроме того, некоторым прошивкам перед запуском полной уборки может потребоваться вручную включить сохранение постоянных карт.

#### Я не могу разделить сегмент

Иногда расположение линии разреза приходится немного подвигать, чтобы это сработало.
Не требуется аккуратно размещать линию разреза точно между пикселями стен. На самом деле, это часто мешает
успешному разделению. Попробуйте протянуть её на всю ширину/высоту сегмента, а не только на его часть.

При некоторых планировках комнат вам также может понадобиться несколько раз разделить сегмент, а затем снова объединить
некоторые из этих частей, чтобы получить желаемый результат.

#### Могу ли я удалить сегмент?

Нет.

`;
