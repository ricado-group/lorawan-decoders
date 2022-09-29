/**
 * Milesight-IoT Payload Decoder for The Things Network v3
 * 
 * Devices Supported:
 * WS301
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

    for (var i = 0; i < bytes.length;) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];
        // Power State
        if (channel_id === 0xff && channel_type === 0x0b) {
            decoded.power = "true";
            i += 1;
        }
        // Protocol Version
        else if (channel_id === 0xff && channel_type === 0x01) {
            decoded.protocol_version = readProtocolVersion(bytes[i]);
            i += 1;
        }
        // Serial Number
        else if (channel_id === 0xff && channel_type === 0x08) {
            decoded.sn = readSerialNumber(bytes.slice(i, i + 6));
            i += 6;
        }
        // Serial Number
        else if (channel_id === 0xff && channel_type === 0x16) {
            decoded.sn = readSerialNumber(bytes.slice(i, i + 8));
            i += 8;
        }
        // Hardware Version
        else if (channel_id === 0xff && channel_type === 0x09) {
            decoded.hardware_version = readHardwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // Software Version
        else if (channel_id === 0xff && channel_type === 0x0a) {
            decoded.software_version = readSoftwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // LoRaWAN Class Type
        else if (channel_id === 0xff && channel_type === 0x0f) {
            switch (bytes[i]) {
                case 0:
                    decoded.class_type = "A";
                    break;
                case 1:
                    decoded.class_type = "B";
                    break;
                case 2:
                    decoded.class_type = "C";
                    break;
            }
            i += 1;
        }
        // BATTERY
        // Unit: %
        else if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = bytes[i];
            i += 1;
        }
        // Door / Window State
        else if (channel_id === 0x03 && channel_type === 0x00) {
            decoded.state = bytes[i] === 0 ? 'true' : 'false';
            i += 1;
        }
        // Installed State
        else if (channel_id === 0x04 && channel_type === 0x00) {
            decoded.install = bytes[i] === 0 ? 'true' : 'false';
            i += 1;
        } else {
            break;
        }
    }

    return decoded;
}

function readProtocolVersion(bytes) {
    var major = (bytes & 0xf0) >> 4;
    var minor = bytes & 0x0f;
    return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = (bytes[1] & 0xff) >> 4;
    return "v" + major + "." + minor;
}

function readSoftwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readSerialNumber(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}
