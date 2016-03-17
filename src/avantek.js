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
		this._status.colorTemp = 0;
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

		this._status.on = true;
	}

	// switch off the light
	off() {
		this._sendMessage({
			cmd: 'switch',
			arg: {
				on: 0
			}
		});

		this._status.on = false;
	}

	// change the color
	changeColor(r, g, b) {
		this._sendMessage({
			cmd: 'color',
			arg: {
				r, g, b
			}
		});

		this._status.color.r = r;
		this._status.color.g = g;
		this._status.color.b = b;
	}

	// change the luminosity (from 0 to 255)
	changeLum(lum) {
		this._sendMessage({
			cmd: 'white',
			arg: {
				lum,
				'color-temp': this._status.colorTemp
			}
		});

		this._status.lum = lum;
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

	// run a method at hours:minutes
	// hours: int
	// minutes: int
	// repeat: true (repeat the next day) | false (do not repeat)
	runMethodAt(pMethod, pHours, pMinutes, pRepeat = false) {
		let date = null;
		let hours = null;
		let minutes = null;

		let i = setInterval(() => {
			date = new Date();
			hours = date.getHours();
			minutes = date.getMinutes();

			if (hours === pHours && minutes === pMinutes) {
				clearInterval(i);

				pMethod();

				// if repeat, launch the method again the minute after
				if (pRepeat) {
					setTimeout(() => {
						this.runMethodAt(pMethod, pHours, pMinutes, pRepeat);
					}, 61 * 1000);
				}
			}
		}, 1000);
	}

	toString() {
		return `
			IP : ${this._ip}
			Port : ${this._port}
			Sid : ${this._sid}
			--------------------------
			Light is ${this._status.on ? 'ON' : 'OFF'}
			Lum : ${this._status.lum}
			Color temp : ${this._status.colorTemp}
			Color R : ${this._status.color.r}
			Color G : ${this._status.color.g}
			Color B : ${this._status.color.b}
		`.replace(/	/g, '');
	}
}
