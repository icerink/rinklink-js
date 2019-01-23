# rinklink.js

Tunneling hardware protocols over WebMidi to comunicate with hardware from within the browser.
For the hardware side, see [the microcontroller firmware of the rink link bridge](https://github.com/icerink/rinklink-fw).

## Architecture

![architecture diagram of rinklink](doc/rinklink.svg)

## Message encoding

Rinklink is a packet based link. I.e. there are out of band messages for ending a packet and begining a new one.
When an empty packet is ended (I.e. two subsequent packet end messages are sent) link is placed into command mode
and the next packet is not sent to the target but is interpreted by the rinklink bridge. This can be used to reboot
the target, or change settings of the bridge. For the format and types of command mode messages consult the documentation
of the rinklink bridge

For staying inside the midi spec, only valid midi messages are sent.
Comunication is done through `Note-on`, `Note-off` and `Poly-KeyPress` messages.
Each of those messages has their very own meaning: 
x
| purpose          | midi message type | raw payload               | midi messge (3 bytes)                  |
| ---------------- | ----------------- | ------------------------- | -------------------------------------- |
| transfer 1 byte  | `Note-on`         | `0bABCDEFGH`              | `0b1000xxAx` `0b0BCDEFGH` `0bxxxxxxxx` |
| transfer 2 bytes | `Note-off`        | `0bABCDEFGH` `0bIJKLMNOP` | `0b1001xxAI` `0b0BCDEFGH` `0b0JKLMNOP` |
| end of packet    | `Poly-KeyPress`   |                           | `0b1010xxxx` `0bxxxxxxxx` `0bxxxxxxxx` |

Note: It is desirable send two bytes at a time whenever possible to improve throughput end efficiency.
