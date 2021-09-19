import { Request, Response } from "express";
import Joi from "joi";
import ValidationError from "../errors/ValidationError";
import cookie from "cookie";
import config from "../config";

interface Route {
	validate(req: Request): void;
	controller(req: Request): Promise<any>;
	exec(req: Request, res: Response): Promise<any>;
}

/**
 * ValidationResult is the interface which is returned by the validation method in BaseRoute.
 * Although we are normally relying on Joi for validation, we are decoupling it in BaseRoute by
 * using this interface so that if required we can swap out Joi with some other validation
 * mechanism.
 */
interface ValidationResult {
	error?: {
		details: { message: string; }[];
	};
	warning?: {
		details: { message: string; }[];
	};
	value: any;
}

export default abstract class BaseRoute implements Route {
	abstract validate(req: Request): { validation?: ValidationResult; };
	abstract controller(req: Request, locals?: Record<string, any>): Promise<{
		data?: any;
		cookies?: { [_: string]: { value: string; httpOnly?: boolean, expiry?: number; }; };
		headers?: { [_: string]: { value: string; }; };
	}>;

	async exec(req: Request, res: Response) {
		try {
			const { validation = { error: null, value: null } } = this.validate(req);
			if (validation.error) {
				throw new ValidationError(validation.error.details.map(d => d.message));
			}
			const { locals } = res;
			const { data = {}, cookies = {} } = await this.controller(validation.value ?? req, locals);
			Object.keys(cookies).forEach((key => {
				const { value, httpOnly, expiry } = cookies[key];
				res.set('Set-Cookie', cookie.serialize(key, value, {
					httpOnly,
					secure: config().isProduction(),
					sameSite: 'strict',
					maxAge: expiry ?? 3600,
					path: '/',
				}));
			}));;
			res.status(200).send({ success: true, data, time: new Date() });
		} catch (err) {
			res.status(err.code || 500).send({
				sucess: false, error: err.message, data: err.details, time: new Date()
			});
		}
	}

	static route(route: new () => Route): (req: Request, res: Response) => Promise<
		(req: Request, res: Response) => Promise<void>
	> {
		const obj = new route();
		return obj.exec.bind(obj);
	}
}
