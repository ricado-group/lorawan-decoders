/**
 * Milesight-IoT Payload Decoder for The Things Network v3
 * 
 * Devices Supported:
 * WS202
 * 
 */

 function decodeUplink(input) {
    var res = Decoder(input.bytes, input.fPort);
    if (res.error) {
        return {
            errors: [res.error],
        };
    }
    return {
        data: res,
    };
}

 function Decoder(bytes, port) {
    var decoded = {};

    for (var i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];
        // BATTERY
        // Unit: %
        if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = bytes[i];
            i += 1;
        }
        // PIR
        else if (channel_id === 0x03 && channel_type === 0x00) {
            decoded.pir = bytes[i] === 0 ? 'false' : 'true';
            i += 1;
        }
        // DAYLIGHT
        else if (channel_id === 0x04 && channel_type === 0x00) {
            decoded.daylight = bytes[i] === 0 ? 'false' : 'true';
            i += 1;
        } else {
            break;
        }
    }

    return decoded;
}