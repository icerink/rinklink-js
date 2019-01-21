const JZZ = require("jzz")

module.exports = class RinkLink {
    constructor() {
        this.input = JZZ().openMidiIn(/ice(skate|link|rink).*/gi);
        this.output = JZZ().openMidiIn(/ice(skate|link|rink).*/gi);
        this.subscribers = [];
        this.message_buffer = [];

        this.input.connect(this._onMidiMessage);
    }

    close() {
        this.input.close();
        this.output.close();
    }

    _onMidiMessage(message) {
        const d = message.data;
        if (d[0] >> 4 == 0xA) { // end of packet
            this._flush_buffer();
        } else if (d[0] >> 4 == 0x8) { // single byte
            this.message_buffer.push(d[1] | ((d[0] & 0b00000001) << 7));
        } else if (d[0] >> 4 == 0x9) { // two bytes
            this.message_buffer.push(d[1] | ((d[0] & 0b00000001) << 7));
            this.message_buffer.push(d[2] | ((d[0] & 0b00000010) << 6));
        } else {
            console.error("unknown message recived on icelink");
        }
    }

    _flush_buffer() {
        this.subscribers.forEach(s => s(this.message_buffer));
        this.message_buffer = [];
    }

    subscribe(callback) {
        this.subscribers.push(callback);
    }

    unsubscribe(callback) {
        this.subscribers = this.subscribers.filter(s => s != callback);
    }

    async recive() {
        return new Promise(resolve => {
            const callback = data => {
                this.unsubscribe(callback);
                resolve(data);
            }
            this.subscribe(callback);
        })
    }

    send(data) {
        // preprocess the input
        if (typeof (data) === "string") data = data.split("").map(c => c.charCodeAt(0));
        else if (typeof (data) === "number") data = [data];

        if (data.reduce((acc, cur) => true ? typeof (cur) != "number" : acc, false)) {
            throw Error("datatype is not sendable via icerink!");
        }


        // group into pairs of two to speed up transmission
        const grouped_data = data.reduce((acc, cur) => {
            if (acc.length == 0 || acc[acc.length - 1].length > 1) {
                return [...acc, cur]
            } else {
                return [...acc.slice(0, -1), [...acc.slice(-1), cur]]
            }
        }, []);


        grouped_data.forEach(b => {
            if (typeof(b) != "number") {
                this.output.send(new Uint8Array([0x90 | b[0] >> 7 | (b[1] >> 7) << 1, b[0] & 0b01111111, b[1] & 0b01111111]))
            } else {
                this.output.send(new Uint8Array([0x80 | b >> 7, b & 0b01111111, 0x00]))
            }
        })
        this.output.send(new Uint8Array([0xA0, 0x00, 0x00])); // flush the line
    }
};