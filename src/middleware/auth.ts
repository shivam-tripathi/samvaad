import { Request } from "express";
import BaseMiddleware from "./base";
import jwt from 'jsonwebtoken';
import config from "../config";
import { User } from "../entities/User";
import AuthenticationError from "../errors/AuthenticationError";

class AuthMiddleware extends BaseMiddleware {
	async attach(req: Request) {
		const { s_token: token } = req.cookies;
		if (!token) {
			throw new AuthenticationError();
		}
		const { userId } = jwt.verify(token, config().app.jwtSecret) as jwt.JwtPayload;
		const user = await User.findOne({ id: userId });
		return { user };
	}
}

export default BaseMiddleware.middleware(AuthMiddleware);
