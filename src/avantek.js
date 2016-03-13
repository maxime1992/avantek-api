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

		// available status of the light
		this._status = {};
		this._status.on = null;
		this._status.lum = null;
		this._status.colorTemp = null;
		this._status.color = {};
		this._status.color.r = null;
		this._status.color.g = null;
		this._status.color.b = null;
	}

	// send a message to the device
	// pMsg: object
	_sendMessage(pMsg, waitAnswer = false) {
		return new Promise((resolve) => {
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

			// if waiting for an answer
			if (waitAnswer) {
				// listen messages
				client.on('message', (message) => {
					// close the connection once a message has been received
					client.close();

					// send the message
					resolve(JSON.parse(message.toString()));
				});
			}

			// send the request
			client.send(msg, 0, msg.length, this._port, this._ip, (err, bytes) => {
				if (err) {
					throw err;
				}

				if (!waitAnswer) {
					// reuse the message buffer,
					// or close client
					resolve();
					client.close();
				}
			});
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

	// update the status of the light
	// return a promise which is resolved when status is up to date
	updateStatus() {
		return new Promise((resolve) => {
			this._sendMessage(
				{cmd: 'status'},
				true
			)
			.then(status => {
				this._status.on = (status.result.switch === 1);
				this._status.lum = status.result.lum;
				this._status.colorTemp = status.result['color-temp'];
				this._status.color.r = status.result.r;
				this._status.color.g = status.result.g;
				this._status.color.b = status.result.b;
				resolve();
			});
		});
	}
}
