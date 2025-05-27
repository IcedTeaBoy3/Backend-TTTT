function generateTimeSlots(start, end, duration = 30) {
  const slots = [];
  let [startHour, startMin] = start.split(':').map(Number);
  let [endHour, endMin] = end.split(':').map(Number);
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;

  for (let time = startTime; time + duration <= endTime; time += duration) {
    const h = Math.floor(time / 60);
    const m = time % 60;
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
  }
  return slots;
}
const addMinutesToTime = (timeStr, minutesToAdd)  => {
  if (typeof timeStr !== "string" || !timeStr.includes(":")) {
    return "00:00";
  }
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date(0, 0, 0, hours, minutes);
  date.setMinutes(date.getMinutes() + minutesToAdd);

  const resultHours = String(date.getHours()).padStart(2, "0");
  const resultMinutes = String(date.getMinutes()).padStart(2, "0");
  return `${resultHours}:${resultMinutes}`;
}
module.exports = {
  generateTimeSlots,
  addMinutesToTime,
};