export default class AuthenticationError extends Error {
	code = 401;
	details: any;
	trace: any;
	constructor(details?: any, trace?: any) {
		super('Unauthorized request');
		this.details = details;
		this.trace = trace;
	}
}
