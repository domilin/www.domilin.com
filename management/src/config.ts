const prod = process.env.NODE_ENV === "production";
export const domilinDomain = prod ? "https://www.domilin.com" : "http://localhost:3082";
