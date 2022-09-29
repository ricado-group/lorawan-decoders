/**
 * Milesight-IoT Payload Decoder for The Things Network v3
 * 
 * Devices Supported:
 *  EM500-PT100
 *  EM500-CO2
 *  EM500-UDL
 *  EM500-SWL
 *  EM500-LGT
 *  EM500-PP
 *  EM300-SLD
 *  EM300-ZLD
 *  EM300-MCS
 *  EM300-TH
 *  AM104
 *  AM107
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
        // Serial Number (12)
        else if (channel_id === 0xff && channel_type === 0x08) {
            decoded.sn = readSerialNumber(bytes.slice(i, i + 6));
            i += 6;
        }
        // Serial Number (16)
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
        // Battery (ALL)
        // Unit: %
        else if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = bytes[i];
            i += 1;
        }
        // Temperature (ALL)
        // Unit: °C
        else if (channel_id === 0x03 && channel_type === 0x67) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // Distance (EM500-UDL)
        // Unit: mm
        else if (channel_id === 0x03 && channel_type === 0x82) {
            decoded.distance = readInt16LE(bytes.slice(i, i + 2)) / 1000;
            i += 2;
        }
        // Water Level (EM500-SWL)
        // Unit: cm
        else if (channel_id === 0x03 && channel_type === 0x77) {
            decoded.water_level = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // Pressure (EM500-PP)
        // Unit: kPa
        else if (channel_id === 0x03 && channel_type === 0x7B) {
            decoded.pressure = readInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // Light (EM500-LGT)
        // Unit: lux
        else if (channel_id === 0x03 && channel_type === 0x94) {
            decoded.illumination = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // Humidity (ALL)
        // Unit: %RH
        else if (channel_id === 0x04 && channel_type === 0x68) {
            decoded.humidity = bytes[i] / 2;
            i += 1;
        }
        // Water Leak (EM300-SLD & EM300-ZLD)
        else if (channel_id === 0x05 && channel_type === 0x00) {
            decoded.water_leak = (bytes[i] === 0) ? 'false' : 'true';
            i += 1;
        }
        // PIR (AM104 & AM107)
        else if (channel_id === 0x05 && channel_type === 0x6A) {
            decoded.activity = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // CO2 (EM500-CO2)
        // Unit: ppm
        else if (channel_id === 0x05 && channel_type === 0x7D) {
            decoded.co2 = readInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // Door(EM300-MCS)
        else if (channel_id === 0x06 && channel_type === 0x00) {
            decoded.door = (bytes[i] === 0) ? 'false' : 'true';
            i += 1;
        }
        // Light (AM104 & AM107)
        // Unit: lux
        else if (channel_id === 0x06 && channel_type === 0x65) {
            decoded.illumination = readUInt16LE(bytes.slice(i, i + 2));
            decoded.infrared_and_visible = readUInt16LE(bytes.slice(i + 2, i + 4));
            decoded.infrared = readUInt16LE(bytes.slice(i + 4, i + 6));
            i += 6;
        }
        // Pressure (AM107)
        // Unit: hPa
        else if (channel_id === 0x06 && channel_type === 0x73) {
            decoded.pressure = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // CO2 (AM107)
        // Unit: ppm
        else if (channel_id === 0x07 && channel_type === 0x7D) {
            decoded.co2 = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // TVOC (AM107)
        // Unit: ppb
        else if (channel_id === 0x08 && channel_type === 0x7D) {
            decoded.tvoc = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // Pressure (EM500-CO2)
        // Unit: hPa
        else if (channel_id === 0x09 && channel_type === 0x73) {
            decoded.pressure = readUInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        } else {
            break;
        }
    }

    return decoded;
}

function readUInt8LE(bytes) {
    return (bytes & 0xFF);
}

function readInt8LE(bytes) {
    var ref = readUInt8LE(bytes);
    return (ref > 0x7F) ? ref - 0x100 : ref;
}

function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}

function readInt16LE(bytes) {
    var ref = readUInt16LE(bytes);
    return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xFFFFFFFF);
}

function readInt32LE(bytes) {
    var ref = readUInt32LE(bytes);
    return (ref > 0x7FFFFFFF) ? ref - 0x100000000 : ref;
}

function readFloatLE(bytes) {
    var bits = bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
    var sign = (bits >>> 31 === 0) ? 1.0 : -1.0;
    var e = bits >>> 23 & 0xff;
    var m = (e === 0) ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return f;
}

function readProtocolVersion(bytes) {
    return "v" + (bytes & 0xff).toString(16);
}

function readHardwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = (bytes[1] & 0xff) >> 4;
    return "v" + major + "." + minor;
}

function readSoftwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = (bytes[1] & 0xff).toString(16);
    return "v" + major + "." + minor;
}

function readSerialNumber(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}
