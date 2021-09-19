import { Request, Router } from "express";
import Joi, { Schema } from "joi";
import { User } from "../entities/User";
import ConflictError from "../errors/ConflictError";
import BaseRoute from "./base";
import bcrypt from "bcrypt";
import AuthenticationError from "../errors/AuthenticationError";
import ValidationError from "../errors/ValidationError";
import jwt from "jsonwebtoken";
import config from "../config";

class Signup extends BaseRoute {
	private schema = Joi.object({
		body: Joi.object({
			userName: Joi.string()
				.trim()
				.alphanum()
				.min(3)
				.max(30)
				.required(),
			password: Joi.string()
				.min(6)
				.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
				.required(),
			email: Joi.string()
				.trim()
				.email({ minDomainSegments: 2, tlds: { allow: true } })
				.required(),
		}).unknown(true),
	}).unknown(true);

	validate(req: Request): Joi.ValidationResult {
		return this.schema.validate(req);
	}

	async controller(req: Request) {
		const { email, userName, password } = req.body;
		const existingUser = await User.findOne({
			select: ['email', 'userName'],
			where: [
				{ email },
				{ userName },
			]
		});
		if (existingUser) {
			const taken = {
				email: email == existingUser.email ? 'email is already taken' : undefined,
				userName: userName === existingUser.userName ? 'userName is already taken' : undefined,
			};
			throw new ConflictError(taken, { email, userName });
		}
		const user = new User({ email, userName, password });
		await user.save();
		return { data: { user } };
	}
}

class Login extends BaseRoute {
	private schema: Schema = Joi.object({
		body: Joi.object({
			userName: Joi.string()
				.trim()
				.alphanum()
				.min(3)
				.max(30)
				.error((errs) => {
					errs[0].message = 'invalid userName';
					return errs[0];
				}),
			email: Joi.string()
				.trim()
				.email({ minDomainSegments: 2, tlds: { allow: true } })
				.error((errs) => {
					errs[0].message = 'invalid email';
					return errs[0];
				}),
			password: Joi.string()
				.min(6)
				.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
				.required()
				.error((errs) => {
					errs[0].message = 'invalid password';
					return errs[0];
				}),
		}).required().unknown(true),
	}).unknown(true);

	validate(req: Request) {
		return this.schema.validate(req);
	}

	async controller(req: Request) {
		console.log(req.body);
		const { userName, email, password } = req.body;
		if (!userName && !email) {
			throw new ValidationError(['both userName and password are missing']);
		}
		const user = await User.findOne({
			where: [{ email }, { userName }],
		});
		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			throw new AuthenticationError({ userName, email });
		}
		const token = jwt.sign({ userId: user.id }, config().app.jwtSecret);
		return { cookies: { s_token: { value: token, expires: 24 * 3600 } }, data: user };
	}
}

const router = Router();

router.post('/signup', BaseRoute.route(Signup));
router.post('/login', BaseRoute.route(Login));

export default router;
