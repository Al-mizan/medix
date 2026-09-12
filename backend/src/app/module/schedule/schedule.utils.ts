// converts a local time to UTC time
export const convertDateTimetoUTC = async (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + offset);
}

export const buildDateTime = (date: Date, time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const d = new Date(date);
    d.setHours(hour, minute, 0, 0);
    return d;
};