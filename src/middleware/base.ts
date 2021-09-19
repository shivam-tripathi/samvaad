import { Request, Response, NextFunction } from "express";

interface Middleware {
	exec(req: Request, res: Response, next: NextFunction): void;
}

export default abstract class BaseMiddleware implements Middleware {
	abstract attach(req: Request): Promise<any>;

	exec(req: Request, res: Response, next: NextFunction): void {
		this.attach(req)
			.catch(err => {
				next(err);
			}).then((locals: Record<string, any>) => {
				res.locals = locals ?? {};
				next();
			});
	}

	static middleware(
		middleware: new () => Middleware
	): (req: Request, res: Response, next: NextFunction) => void {
		const obj = new middleware();
		console.log(obj.exec.toString());
		return obj.exec.bind(obj);
	}
}