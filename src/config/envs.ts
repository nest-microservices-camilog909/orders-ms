import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
	PORT: number;
	DATABASE_URL: string;
	PRODUCTS_MS_HOST: string;
	PRODUCTS_MS_PORT: number;
}

const envsSchema = joi
	.object({
		PORT: joi.number().required(),
		DATABASE_URL: joi.string().required(),
		PRODUCTS_MS_HOST: joi.string().required(),
		PRODUCTS_MS_PORT: joi.number().required(),
	})
	.unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
	throw new Error(`Config valition error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
	port: envVars.PORT,
	database_url: envVars.DATABASE_URL,
	productsMsHost: envVars.PRODUCTS_MS_HOST,
	productsMsPort: envVars.PRODUCTS_MS_PORT,
};
