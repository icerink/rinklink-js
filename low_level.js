async function main() {
    midi = (await navigator.requestMIDIAccess())

    window.onload = () => setTimeout(midiChange, 300);
    midi.onstatechange = midiChange

    function toHexString(byteArray) {
        return Array.from(byteArray, function(byte) {
          return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).map(b => "0x" + b).join(', ')
      }
      
      cnt = 0;
    
    function midiChange() {
        const messages = document.querySelector("#messages")
        messages.innerHTML = "messages:\n"

        const text = document.querySelector("#text")
        text.innerHTML = "decodet:\n"

        const out = document.querySelector("#devices")
        out.innerHTML = "inputs:\n"
        inputs = []
        midi.inputs.forEach(a => {
            out.innerHTML += `manufacturer: ${a.manufacturer || "\t"}\t name: ${a.name}\n`
            inputs.push(a)
        })

        out.innerHTML += "\noutputs:\n"
        outputs = []
        midi.outputs.forEach(a => {
            out.innerHTML += `manufacturer: ${a.manufacturer || "\t"}\t name: ${a.name}\n`
            a.open()
            outputs.push(a)
        })
        inputs.forEach(i => i.onmidimessage = m => {
            console.info(m.data)
            //messages.innerHTML += toHexString(m.data) + "\n"
            messages.scrollTop = 1000000000000000;

            // decode the message
            const d = m.data;
            if(d[0] >> 4 == 8) { // single byte
                const byte = d[1] | ((d[0] & 0b00000001) << 7);
                cnt += 1
                text.innerHTML += String.fromCharCode(byte)
            } else if (d[0] >> 4 == 9) { // two bytes
                cnt += 2
                const byte1 = d[1] | ((d[0] & 0b00000001) << 7);
                text.innerHTML += String.fromCharCode(byte1)
                const byte2 = d[2] | ((d[0] & 0b00000010) << 6);
                text.innerHTML += String.fromCharCode(byte2)
            }
        })
        /*
        setTimeout(() => {
            inputs.forEach(i => i.onmidimessage = () => null)
            messages.innerHTML = cnt + "bytes / s"
        }, 1000);
        */
    }
}
main()

function send(payload) {
    payload.split("").forEach(b => {
        outputs.forEach(i => i.send(new Uint8Array([0x80 | b >> 7, b & 0b01111111, 0x00])))
    })
}