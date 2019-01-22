const assert = require('assert');

const RinkLink = require('../index')


describe('RinkLink', function() {
    it('should be constructable & closable', () => {
        const link = new RinkLink(true);
        link.close();
    });

    [[42], [255, 3, 16, 7, 32], new Uint8Array([255, 3, 16, 7, 32]), "hello"].forEach(test_payload => {
        it(`should be able to encode & decode "${test_payload}"`, done => {
            const link = new RinkLink(true);
    
            // loopback the output
            link.output.send = data => {
                if(!data.every((b, i) => b >= 0 && b <= i == 0 ? 255 : 127)) {
                    done(new Error("value out of bounds: " + JSON.stringify(Array.from(data))))
                }
                link._onMidiMessage({data});
            };
            link.subscribe(data => {
                const to_compare = Array.from(test_payload).map(b => typeof(b) === "string" ? b.charCodeAt(0) : b)
                if(JSON.stringify(data) === JSON.stringify(to_compare)) done();
                else done(new Error(`number is wrong! expected ${JSON.stringify(to_compare)}, got ${JSON.stringify(data)}`))
            })
    
            link.send(test_payload);
    
            link.close();
        });
    })

    it("async/await recive works", async () => {
            const link = new RinkLink(true);
    
            // loopback the output
            link.output.send = data => setTimeout(() => link._onMidiMessage({data}), 10);

            test_payload = 42;
    
            link.send(test_payload);
            response = await link.recive();

            if(response != test_payload) throw Error("response is wrong!");

            link.close();
    });
});
