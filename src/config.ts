class Config {
	env: string;
	app: {
		port: number;
		jwtSecret: string;
	}

	constructor() {
		this.env = process.env.NODE_ENV;
		this.app = {
			port: parseInt(process.env.PORT, 10) || 5000,
			jwtSecret: process.env.JWT_SECRET,
		};
	}

	isProduction() {
		return this.env === 'production';
	}
}

let _config: Config = null;

export default () => {
	if (_config === null) {
		_config = new Config();
	}
	return _config;
};
