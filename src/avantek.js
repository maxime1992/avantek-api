import dgram from 'dgram';

export class Avantek {
	// pIp: string
	// pPort: int
	// pSid: string
	constructor(pIp, pPort, pSid) {
		this._ip = pIp;
		this._port = pPort;
		this._sid = pSid;

		// every request must start with uid and sid
		// then, the request will have a command 'cmd' and
		// some arugment(s) 'arg'
		this._baseRequest = {
			uid: `0`,
			sid: `${this._sid}`
		};
	}

	// send a message to the device
	// pMsg: object
	_sendMessage(pMsg) {
		// create the request from a copy of base request ...
		let request = JSON.parse(JSON.stringify(this._baseRequest));

		// ... and add the message into it
		Object.assign(request, pMsg);

		// stringify the request
		request = JSON.stringify(request);

		// create the client to send the UDP request
		let client = dgram.createSocket('udp4');

		// transform the request into a buffer
		let msg = new Buffer(request);

		// send the request
		client.send(msg, 0, msg.length, this._port, this._ip, (err, bytes) => {
			if (err) {
				throw err;
			}
			// reuse the message buffer,
			// or close client
			client.close();
		});
	}

	// switch on the light
	on() {
		this._sendMessage({
			cmd: 'switch',
			arg: {
				on: 1
			}
		});
	}

	// switch off the light
	off() {
		this._sendMessage({
			cmd: 'switch',
			arg: {
				on: 0
			}
		});
	}
}
