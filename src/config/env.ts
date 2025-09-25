import { z } from "zod";

/* Syfte: 
Centralt ställe för att läsa + validera miljövariabler (process.env),
så att resten av koden inte behöver göra egna "process.env.X" anrop.
Zod används för att få tydliga fel och statiska typer. */

const EnvSchema = z.object({
	// PORT: sträng i env -> konverteras till number, default 3000
	PORT: z.string().default("3000").transform(Number),
	// NODE_ENV: strikt enum med default 'development'
	NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
	// DATABASE_URL: kan vara tom i vissa körningar (ex. innan prisma init), därför optional
	DATABASE_URL: z.string().optional(),
});

// Parse + validera hela process.env. Vid fel kastar Zod ett tydligt error vid uppstart.
export const env = EnvSchema.parse(process.env);
