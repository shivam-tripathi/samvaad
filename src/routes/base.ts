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

export default abstract class BaseRoute implements Route {
	abstract validate(req: Request): Joi.ValidationResult;
	abstract controller(req: Request): Promise<{
		data?: any;
		cookies?: { [_: string]: { value: string; httpOnly?: boolean, expiry?: number } };
		headers?: { [_: string]: { value: string; } }
	}>;
	async exec(req: Request, res: Response) {
		try {
			const validation = this.validate(req);
			if (validation.error) {
				throw new ValidationError(validation.error.details.map(d => d.message));
			}
			const { data = {}, cookies = {} } = await this.controller(validation.value);
			Object.keys(cookies).forEach((key => {
				const { value, httpOnly, expiry } = cookies[key];
				res.set('Set-Cookie', cookie.serialize(key, value, {
					httpOnly,
					secure: config().isProduction(),
					sameSite: 'strict',
					maxAge: expiry ?? 3600,
					path: '/',
				}))
			}));;
			res.status(200).send({ success: true, data, time: new Date() });
		} catch (err) {
			res.status(err.code || 500).send({
				sucess: false, error: err.message, data: err.details, time: new Date()
			});
		}
	}
	static route(route: new () => Route): (req: Request, res: Response) => Promise<(_: Request) => {
		data?: any;
		cookies?: { [_: string]: { value: string; httpOnly?: boolean; } };
		headers?: { [_: string]: { value: string; } };
	}> {
		const obj = new route();
		return obj.exec.bind(obj);
	}
}
