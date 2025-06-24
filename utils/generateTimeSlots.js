// utils/generateTimeSlots.js
function generateTimeSlots(openTime = "09:00", closeTime = "17:00", duration) {
  const slots = [];
  let [h, m] = openTime.split(":").map(Number);
  let [ch, cm] = closeTime.split(":").map(Number);

  let start = h * 60 + m;
  const end = ch * 60 + cm;

  while (start + duration <= end) {
    const startHour = String(Math.floor(start / 60)).padStart(2, "0");
    const startMin = String(start % 60).padStart(2, "0");

    const endMinTotal = start + duration;
    const endHour = String(Math.floor(endMinTotal / 60)).padStart(2, "0");
    const endMin = String(endMinTotal % 60).padStart(2, "0");

    slots.push({
      start: `${startHour}:${startMin}`,
      end: `${endHour}:${endMin}`
    });

    start += duration;
  }

  return slots;
}

module.exports = generateTimeSlots;
