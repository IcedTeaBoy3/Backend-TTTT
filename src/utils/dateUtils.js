function toLocalStartOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}
function toLocalEndOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}
function isSameDay(date1, date2) {
    const d1 = toLocalStartOfDay(date1).getTime();
    const d2 = toLocalStartOfDay(date2).getTime();
    return d1 === d2;
}
module.exports = {
    toLocalStartOfDay,
    toLocalEndOfDay,
    isSameDay
};