// export function sumDurations(durations: string[]): string {
//   let totalSeconds = 0;

//   for (const duration of durations) {
//     const parts = duration.split(":").map(Number);
//     if (parts.length === 3) {
//       const [hours, minutes, seconds] = parts;
//       totalSeconds += hours * 3600 + minutes * 60 + seconds;
//     }
//   }

//   const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
//   const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
//   const s = (totalSeconds % 60).toString().padStart(2, "0");
//   return `${h}:${m}:${s}`;
// }
