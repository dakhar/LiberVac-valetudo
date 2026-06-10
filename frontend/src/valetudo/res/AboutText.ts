export const AboutText = `
**LiberVac** is a fork of <a href="https://github.com/Hypfer/Valetudo" rel="noopener" target="_blank">Valetudo</a>,
adapted to bring fully local, cloud-free control to robots that the stock firmware otherwise chains to a vendor cloud.

### This fork

LiberVac is maintained by <a href="https://github.com/dakhar" rel="noopener" target="_blank">**dakhar**</a>. The work on top of upstream Valetudo focuses on the
Midea V16 (RK3566) platform and on cutting the cord to the manufacturer's cloud:

- A local bridge to the robot's on-device services, so cleaning, room selection, the map and live status
work entirely on your LAN — no Midea or Agora cloud in the loop.
- The on-board camera surfaced directly in the web interface (local RTSP → go2rtc → WebRTC), without any cloud relay.
- Re-voiced audio packs and assorted quality-of-life fixes for the device.
- This rebrand and the packaging that ties it all together.

### Thanks

None of this would exist without the people whose shoulders it stands on, and they deserve full credit:

- <a href="https://hypfer.de" rel="noopener" target="_blank">Sören Beye (Hypfer)</a> — the author of Valetudo.
LiberVac is built on years of his work, and the entire architecture, capability model and web interface are his.
Thank you.
- <a href="https://dontvacuum.me/" rel="noopener" target="_blank">Dennis Giese</a> — whose research into liberating
and actually owning our robots makes all of this possible in the first place.
- The <a href="https://github.com/Hypfer/Valetudo/graphs/contributors" rel="noopener" target="_blank">Valetudo contributors</a>
and the countless open-source projects underneath. We're all standing on the shoulders of giants.
(<a href="https://xkcd.com/2347/" rel="noopener" target="_blank">XKCD 2347</a>)

### License

LiberVac, like Valetudo, is distributed under
<a href="https://github.com/Hypfer/Valetudo/blob/master/LICENSE" rel="noopener" target="_blank">the Apache-2.0 license</a>.
LiberVac is an independent fork and is **not** affiliated with or endorsed by the Valetudo project or its author.

Just be nice, please. Thank you :)
`;

export const AboutTextRu = `
**LiberVac** — это форк <a href="https://github.com/Hypfer/Valetudo" rel="noopener" target="_blank">Valetudo</a>,
адаптированный для полностью локального управления роботами без облака, к которому их привязывает заводская прошивка.

### Об этом форке

LiberVac поддерживает <a href="https://github.com/dakhar" rel="noopener" target="_blank">**dakhar**</a>. Работа поверх оригинального Valetudo сосредоточена на платформе
Midea V16 (RK3566) и на том, чтобы перерезать пуповину с облаком производителя:

- Локальный мост к сервисам робота: уборка, выбор комнат, карта и статус в реальном времени работают целиком
в вашей локальной сети — без облаков Midea и Agora.
- Встроенная камера прямо в веб-интерфейсе (локально RTSP → go2rtc → WebRTC), без облачного ретранслятора.
- Переозвученные голосовые пакеты и набор улучшений для устройства.
- Сам ребрендинг и сборка, связывающая всё воедино.

### Благодарности

Ничего этого не было бы без людей, на плечах которых всё это стоит, и они заслуживают полного признания:

- <a href="https://hypfer.de" rel="noopener" target="_blank">Sören Beye (Hypfer)</a> — автор Valetudo.
LiberVac построен на годах его труда; вся архитектура, модель возможностей и веб-интерфейс — его заслуга. Спасибо.
- <a href="https://dontvacuum.me/" rel="noopener" target="_blank">Dennis Giese</a> — чьи исследования по освобождению
роботов и получению реального права собственности на них и делают всё это возможным.
- <a href="https://github.com/Hypfer/Valetudo/graphs/contributors" rel="noopener" target="_blank">Контрибьюторы Valetudo</a>
и бесчисленные проекты с открытым исходным кодом под капотом. Мы все стоим на плечах гигантов.
(<a href="https://xkcd.com/2347/" rel="noopener" target="_blank">XKCD 2347</a>)

### Лицензия

LiberVac, как и Valetudo, распространяется под
<a href="https://github.com/Hypfer/Valetudo/blob/master/LICENSE" rel="noopener" target="_blank">лицензией Apache-2.0</a>.
LiberVac — независимый форк, **не** аффилированный с проектом Valetudo и его автором и не одобренный ими.

Просто будьте добрее, пожалуйста. Спасибо :)
`;
