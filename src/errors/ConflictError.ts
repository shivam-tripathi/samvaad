export default class ConflictError extends Error {
	code = 409;
	details: any;
	trace: any;
	constructor(details?: any, trace?: any) {
		super('resource.ALREADY_EXISTS')
		this.details = details;
		this.trace = trace;;
	}
}
