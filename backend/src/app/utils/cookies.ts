import { CookieOptions, Request, Response } from "express";

const setCookie = (res: Response, key: string, value: string, options: CookieOptions) => {
    res.cookie(key, value, options);
}

const getCookie = (req: Request, key: string): string | undefined => {
    if (req.cookies && req.cookies[key]) {
        return req.cookies[key];
    }
    if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(";").reduce((acc: Record<string, string>, item) => {
            const [k, ...v] = item.trim().split("=");
            if (k) acc[k] = decodeURIComponent(v.join("="));
            return acc;
        }, {});
        return cookies[key];
    }
    return undefined;
}

const clearCookie = (res: Response, key: string, options: CookieOptions) => {
    res.clearCookie(key, options);
}

export const cookieUtils = {
    setCookie,
    getCookie,
    clearCookie
};