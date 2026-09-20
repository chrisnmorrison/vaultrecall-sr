import { addLocalDays, localDateString } from "./date";

export interface ScheduleResult {
	due: string;
	interval: number;
	ease: number;
}

export class SRScheduler {
	/**
	 * SM-2 scheduling.
	 * quality: 0=Again, 3=Hard, 4=Good, 5=Easy
	 * prevInterval: days (0 = first review)
	 * prevEase: ease factor (default 2.5)
	 */
	static schedule(
		quality: number,
		prevInterval: number,
		prevEase: number
	): ScheduleResult {
		const ease = Math.max(
			1.3,
			prevEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
		);

		let interval: number;
		if (quality < 3) {
			interval = 1;
		} else if (prevInterval === 0) {
			interval = 1;
		} else if (quality === 3) {
			// Hard: grow slowly with a fixed 1.2x multiplier (Anki-style),
			// rather than compounding the full ease factor.
			interval = Math.max(1, Math.round(prevInterval * 1.2));
		} else {
			interval = Math.max(1, Math.round(prevInterval * ease));
		}

		return {
			due: localDateString(addLocalDays(interval)),
			interval,
			ease: parseFloat(ease.toFixed(4)),
		};
	}
}
