import { Request, Router } from "express";
import Joi from "joi";
import { User } from "../entities/User";
import BaseRoute from "./base";

class Profile extends BaseRoute {
	schema = Joi.object({
		params: Joi.object({
			userId: Joi.string().required(),
		}).unknown(),
	}).unknown(true);

	validate(req: Request) {
		console.log(req.params);
		return { validation: this.schema.validate(req) };
	}

	async controller(req: Request) {
		const { userId } = req.params;
		const user = await User.findOne({ id: userId });
		return { data: { user } };
	}
}

export default () => {
	const router = Router();
	router.get('/:userId', BaseRoute.route(Profile));
	return router;
};
