export default class ValidationError extends Error {
	code: number;
	details: any;
	constructor(details?: any) {
		super('validation.Error');
		this.code = 400;
		this.details = details;
	}
}
