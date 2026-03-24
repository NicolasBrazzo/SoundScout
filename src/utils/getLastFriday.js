export function getLastFriday() {
  const now = new Date();
  const day = now.getDay(); // 0=dom, 5=ven
  const diff = (day + 2) % 7; // giorni da venerdì scorso (se oggi è ven => 0)
  const friday = new Date(now);
  friday.setDate(now.getDate() - diff);
  friday.setHours(0, 0, 0, 0);
  return friday;
}
