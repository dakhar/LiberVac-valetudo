export const VoicepackHelp = `
## Voice packs

Custom voice packs are a bit more complicated as the exact format differs depending on your choice of robot.

As I personally don't really care about them, this feature is a bit rough around the edges.
For me, these things are first and foremost tools that should simply work and do so reliably.
Thus, I'm fine with it just talking english as that's perfectly serviceable for a tool.

If you want to install a custom one anyways, you will need a voicepack in the correct format as required by your
robot hosted on some http server. Note that the official CDN is often blocked in the robots firmware meaning that just
using the official URL likely won't work.

Depending on the model of robot, you will also need a hash of that voice pack file.
The type of hash differs depending on the firmware.

Furthermore, you'll also need to specify a language code. That value largely doesn't matter much unless you use a reserved code.
"EN", "CN" etc are often codes reserved for the inbuilt voice packs of the firmware.

Usually it's possible to revert to the initially installed voice pack by specifying one of those inbuilt voicepack codes during the install.

`;

export const VoicepackHelpRu = `
## Голосовые пакеты

Пользовательские голосовые пакеты немного сложнее, так как точный формат зависит от выбранной вами модели робота.

Поскольку лично мне они не особо важны, эта функция немного сыровата.
Для меня все эти вещи в первую очередь являются инструментами, которые должны просто работать и делать это надёжно.
Поэтому меня вполне устраивает, что робот говорит по-английски, так как для инструмента этого вполне достаточно.

Если вы всё же хотите установить пользовательский пакет, вам понадобится голосовой пакет в правильном формате, требуемом вашим
роботом, размещённый на каком-либо http-сервере. Обратите внимание, что официальный CDN часто заблокирован в прошивке робота, а значит просто
использование официального URL, скорее всего, не сработает.

В зависимости от модели робота вам также может понадобиться хеш этого файла голосового пакета.
Тип хеша зависит от прошивки.

Кроме того, вам также нужно указать код языка. Это значение в большинстве случаев не имеет особого значения, если только вы не используете зарезервированный код.
"EN", "CN" и т. п. — это коды, часто зарезервированные для встроенных голосовых пакетов прошивки.

Обычно можно вернуться к изначально установленному голосовому пакету, указав один из этих кодов встроенных голосовых пакетов при установке.

`;
