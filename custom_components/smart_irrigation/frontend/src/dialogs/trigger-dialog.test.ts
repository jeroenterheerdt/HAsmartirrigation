import { describe, expect, it } from "vitest";

import {
  TRIGGER_TYPE_SOLAR_AZIMUTH,
  TRIGGER_TYPE_SUNRISE,
  TRIGGER_TYPE_TIME,
} from "../const";
import { triggerForEditing } from "./trigger-dialog";

/**
 * Reopening a trigger to edit it must not lose the field that type depends on.
 *
 * A fixed-time trigger reported by a user always came back at 06:00: the edit
 * path rebuilt the trigger without its `at`, the input fell back to the
 * default, and saving wrote that default back. The hour could be set once and
 * never changed.
 */
describe("triggerForEditing", () => {
  it("keeps the hour of a fixed-time trigger", () => {
    const edited = triggerForEditing({
      type: TRIGGER_TYPE_TIME,
      name: "Evening",
      enabled: true,
      at: "19:00",
    } as any);

    expect((edited as any).at).toBe("19:00");
  });

  it("falls back to 06:00 only when no hour was ever set", () => {
    const edited = triggerForEditing({
      type: TRIGGER_TYPE_TIME,
      name: "Evening",
    } as any);

    expect((edited as any).at).toBe("06:00");
  });

  it("keeps the angle of a solar azimuth trigger", () => {
    const edited = triggerForEditing({
      type: TRIGGER_TYPE_SOLAR_AZIMUTH,
      name: "Low sun",
      azimuth_angle: 250,
    } as any);

    expect((edited as any).azimuth_angle).toBe(250);
  });

  it("gives each type only the field it uses", () => {
    const time = triggerForEditing({
      type: TRIGGER_TYPE_TIME,
      at: "19:00",
      azimuth_angle: 250,
    } as any);
    const azimuth = triggerForEditing({
      type: TRIGGER_TYPE_SOLAR_AZIMUTH,
      at: "19:00",
      azimuth_angle: 250,
    } as any);

    // A stale value from the other type would be saved back and confuse the
    // backend about which trigger this actually is.
    expect("azimuth_angle" in time).toBe(false);
    expect("at" in azimuth).toBe(false);
  });

  it("carries the common fields for a sun trigger", () => {
    const edited = triggerForEditing({
      type: TRIGGER_TYPE_SUNRISE,
      name: "Dawn",
      enabled: false,
      offset_minutes: -30,
      account_for_duration: false,
    } as any);

    expect(edited).toEqual({
      type: TRIGGER_TYPE_SUNRISE,
      name: "Dawn",
      enabled: false,
      offset_minutes: -30,
      account_for_duration: false,
    });
  });
});
