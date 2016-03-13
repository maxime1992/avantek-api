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
}
