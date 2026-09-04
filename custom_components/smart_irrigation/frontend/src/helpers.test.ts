import { describe, expect, it } from "vitest";

import {
  CONF_IMPERIAL,
  CONF_METRIC,
  MAPPING_CURRENT_PRECIPITATION,
  MAPPING_DEWPOINT,
  MAPPING_EVAPOTRANSPIRATION,
  MAPPING_HUMIDITY,
  MAPPING_PRECIPITATION,
  MAPPING_PRESSURE,
  MAPPING_SOLRAD,
  MAPPING_TEMPERATURE,
  MAPPING_WINDSPEED,
} from "./const";
import { getOptionsForMappingType } from "./helpers";

/**
 * The unit strings this panel writes are read back by the integration, which
 * keeps its own copy of them. When the two drifted apart, picking "millibar"
 * for a pressure sensor converted to nothing: the value was dropped from the
 * record and the calculation reported pressure as missing, on a sensor that
 * worked. The Python side has the matching test; this one guards the list the
 * panel offers in the first place.
 */
const EVERY_MAPPING = [
  MAPPING_TEMPERATURE,
  MAPPING_DEWPOINT,
  MAPPING_PRECIPITATION,
  MAPPING_EVAPOTRANSPIRATION,
  MAPPING_CURRENT_PRECIPITATION,
  MAPPING_HUMIDITY,
  MAPPING_PRESSURE,
  MAPPING_WINDSPEED,
  MAPPING_SOLRAD,
];

describe("getOptionsForMappingType", () => {
  it.each(EVERY_MAPPING)("offers at least one unit for %s", (mapping) => {
    expect(getOptionsForMappingType(mapping).length).toBeGreaterThan(0);
  });

  it.each(EVERY_MAPPING)("gives every unit of %s a system", (mapping) => {
    for (const option of getOptionsForMappingType(mapping)) {
      const systems = Array.isArray(option.system)
        ? option.system
        : [option.system];
      expect(systems.length).toBeGreaterThan(0);
      for (const system of systems) {
        expect([CONF_METRIC, CONF_IMPERIAL]).toContain(system);
      }
    }
  });

  it.each(EVERY_MAPPING)(
    "offers %s a unit on both metric and imperial",
    (mapping) => {
      const systems = getOptionsForMappingType(mapping).flatMap((option) =>
        Array.isArray(option.system) ? option.system : [option.system],
      );

      // A field with no unit for one system leaves that user unable to say
      // what their sensor reports.
      expect(systems).toContain(CONF_METRIC);
      expect(systems).toContain(CONF_IMPERIAL);
    },
  );

  it("offers no unit for something that is not a mapping", () => {
    expect(getOptionsForMappingType("not a mapping")).toEqual([]);
  });

  it("keeps knots available to both systems", () => {
    // A METAR reports knots whatever the user's system is set to.
    const knots = getOptionsForMappingType(MAPPING_WINDSPEED).find(
      (option) => option.unit === "knot",
    );

    expect(knots).toBeDefined();
    expect(knots!.system).toEqual([CONF_METRIC, CONF_IMPERIAL]);
  });
});
