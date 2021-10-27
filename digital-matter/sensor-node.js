function decodeUplink(input)
{
	if(input === null)
	{
		return createErrorResult("Uplink Input Variable was Null");
	}

	if(input.bytes.length === 0)
	{
		return createErrorResult("Empty Payload Data");
	}

	var dataFieldId = input.fPort;
	
	var payloadBytes = input.bytes;
	var byteIndex = 0;

	var dataFieldValues = {};
	var warnings = [];

	while(byteIndex < payloadBytes.length)
	{
		switch(dataFieldId)
		{
			case 1:
				// System Firmware Version - 4 Bytes
				if(payloadBytes.length < byteIndex + 4)
				{
					return createErrorResult("Payload Length too short for System Firmware Version (4 Bytes)");
				}

				dataFieldValues['product_type'] = payloadBytes[byteIndex];
				dataFieldValues['hardware_revision'] = payloadBytes[byteIndex + 1];
				dataFieldValues['firmware_version'] = parseFloat(toString(payloadBytes[byteIndex + 2]) + '.' + toString(payloadBytes[byteIndex + 3]));
				byteIndex += 4;
				break;
			
			case 10:
				// GPS Position - 6 Bytes
				if(payloadBytes.length < byteIndex + 6)
				{
					return createErrorResult("Payload Length too short for GPS Position (6 Bytes)");
				}

				if(payloadBytes[byteIndex] === 255 && payloadBytes[byteIndex + 1] === 255 && payloadBytes[byteIndex + 2])
				{
					warnings.push("GPS Position could not be determined");
				}
				else
				{
					dataFieldValues['gps_position_latitude'] = 0.0000256 * bytesToInt24(payloadBytes, byteIndex);
					dataFieldValues['gps_position_longitude'] = 0.0000256 * bytesToInt24(payloadBytes, byteIndex + 3);
				}

				byteIndex += 6;
				break;
			
			case 20:
				// Battery Voltage - 2 Bytes
				if(payloadBytes.length < byteIndex + 2)
				{
					return createErrorResult("Payload Length too short for Battery Voltage (2 Bytes)");
				}

				dataFieldValues['battery_voltage'] = bytesToUInt16(payloadBytes, byteIndex);
				byteIndex += 2;
				break;
			
			case 21:
				// Analog Input #1 - 2 Bytes
				if(payloadBytes.length < byteIndex + 2)
				{
					return createErrorResult("Payload Length too short for Analog Input #1 (2 Bytes)");
				}

				dataFieldValues['analog_input1'] = bytesToUInt16(payloadBytes, byteIndex);
				byteIndex += 2;
				break;
			
			case 22:
				// Analog Input #2 - 2 Bytes
				if(payloadBytes.length < byteIndex + 2)
				{
					return createErrorResult("Payload Length too short for Analog Input #2 (2 Bytes)");
				}

				dataFieldValues['analog_input2'] = bytesToUInt16(payloadBytes, byteIndex);
				byteIndex += 2;
				break;
			
			case 23:
				// Analog Input #3 - 2 Bytes
				if(payloadBytes.length < byteIndex + 2)
				{
					return createErrorResult("Payload Length too short for Analog Input #3 (2 Bytes)");
				}

				dataFieldValues['analog_input3'] = bytesToUInt16(payloadBytes, byteIndex);
				byteIndex += 2;
				break;
			
			case 30:
				// Digital Input States - 1 Byte
				if(payloadBytes.length < byteIndex + 1)
				{
					return createErrorResult("Payload Length too short for Digital Input States (1 Byte)");
				}

				dataFieldValues['digital_input1_state'] = (payloadBytes[byteIndex] & 1) > 0;
				dataFieldValues['digital_input1_state'] = (payloadBytes[byteIndex] & 2) > 0;
				dataFieldValues['digital_input1_state'] = (payloadBytes[byteIndex] & 4) > 0;
				byteIndex += 1;
				break;
			
			case 31:
				// Digital Input #1 Pulse Count - 2 Bytes
				if(payloadBytes.length < byteIndex + 2)
				{
					return createErrorResult("Payload Length too short for Digital Input #1 Pulse Count (2 Bytes)");
				}

				dataFieldValues['digital_input1_pulse_count'] = bytesToUInt16(payloadBytes, byteIndex);
				byteIndex += 2;
				break;
			
			case 32:
				// Digital Input #2 Pulse Count - 2 Bytes
				if(payloadBytes.length < byteIndex + 2)
				{
					return createErrorResult("Payload Length too short for Digital Input #2 Pulse Count (2 Bytes)");
				}

				dataFieldValues['digital_input2_pulse_count'] = bytesToUInt16(payloadBytes, byteIndex);
				byteIndex += 2;
				break;
			
			case 33:
				// Digital Input #3 Pulse Count - 2 Bytes
				if(payloadBytes.length < byteIndex + 2)
				{
					return createErrorResult("Payload Length too short for Digital Input #3 Pulse Count (2 Bytes)");
				}

				dataFieldValues['digital_input3_pulse_count'] = bytesToUInt16(payloadBytes, byteIndex);
				byteIndex += 2;
				break;
			
			case 40:
				// Internal Temperature - 2 Bytes
				if(payloadBytes.length < byteIndex + 2)
				{
					return createErrorResult("Payload Length too short for Internal Temperature (2 Bytes)");
				}

				dataFieldValues['internal_temperature'] = bytesToInt16(payloadBytes, byteIndex) / 100;
				byteIndex += 2;
				break;
			
			case 51:
				// Estimated Battery % Remaining - 2 Bytes
				if(payloadBytes.length < byteIndex + 2)
				{
					return createErrorResult("Payload Length too short for Estimated Battery % Remaining (2 Bytes)");
				}

				dataFieldValues['battery_percent_remaining'] = bytesToInt16(payloadBytes, byteIndex);
				byteIndex += 2;
				break;
		}
		
		if(payloadBytes.length > byteIndex + 1)
		{
			dataFieldId = payloadBytes[byteIndex];
			byteIndex += 1;
		}
	}

	return {
		data: dataFieldValues,
		warnings,
		errors: []
	};
}

function bytesToUInt16(bytes, startIndex)
{
	if(bytes.length < startIndex + 2)
	{
		return 0;
	}

	return (bytes[startIndex + 1] << 8) + bytes[startIndex];
}

function bytesToInt16(bytes, startIndex)
{
	if(bytes.length < startIndex + 2)
	{
		return 0;
	}
	
	var value = (bytes[startIndex + 1] << 8) + bytes[startIndex];

	if(value & 0x8000 > 0)
	{
		value -= 0x10000;
	}

	return value;
}

function bytesToInt24(bytes, startIndex)
{
	if(bytes.length < startIndex + 3)
	{
		return 0;
	}
	
	var value = (bytes[startIndex + 2] << 16) + (bytes[startIndex + 1] << 8) + bytes[startIndex];

	if((value & 0x800000) > 0)
	{
		value -= 0x1000000;
	}

	return value;
}

function bytesToInt32(bytes, startIndex)
{
	if(bytes.length < startIndex + 4)
	{
		return 0;
	}
	
	var value = (bytes[startIndex + 3] << 24) + (bytes[startIndex + 2] << 16) + (bytes[startIndex + 1] << 8) + bytes[startIndex];

	if(value & 0x80000000 > 0)
	{
		value -= 0x100000000;
	}

	return value;
}

function createErrorResult(errorMessage)
{
	return {
		data: {},
		warnings: [],
		errors: [errorMessage],
	};
}