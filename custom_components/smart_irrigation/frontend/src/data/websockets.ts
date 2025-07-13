import { HomeAssistant } from "custom-card-helpers";
import {
  SmartIrrigationConfig,
  SmartIrrigationZone,
  SmartIrrigationModule,
  SmartIrrigationMapping,
} from "../types";
import { DOMAIN } from "../const";

export const fetchConfig = (
  hass: HomeAssistant,
): Promise<SmartIrrigationConfig> =>
  hass.callWS({
    type: DOMAIN + "/config",
  });

export const saveConfig = (
  hass: HomeAssistant,
  config: Partial<SmartIrrigationConfig>,
): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/config", config);
};

/*export const fetchZones = (
  hass: HomeAssistant
): Promise<Dictionary<SmartIrrigationZone>> =>*/
export const fetchZones = (
  hass: HomeAssistant,
): Promise<SmartIrrigationZone[]> =>
  hass.callWS({
    type: DOMAIN + "/zones",
  });

export const saveZone = (
  hass: HomeAssistant,
  config: Partial<SmartIrrigationZone>,
): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/zones", config);
};

export const calculateZone = (
  hass: HomeAssistant,
  zone_id: string,
): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/zones", {
    id: zone_id,
    calculate: true,
    override_cache: true,
  });
};

export const updateZone = (
  hass: HomeAssistant,
  zone_id: string,
): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/zones", {
    id: zone_id,
    update: true,
  });
};
export const calculateAllZones = (hass: HomeAssistant): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/zones", {
    calculate_all: true,
  });
};

export const updateAllZones = (hass: HomeAssistant): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/zones", {
    update_all: true,
  });
};

export const resetAllBuckets = (hass: HomeAssistant): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/zones", {
    reset_all_buckets: true,
  });
};

export const clearAllWeatherdata = (hass: HomeAssistant): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/zones", {
    clear_all_weatherdata: true,
  });
};

export const deleteZone = (
  hass: HomeAssistant,
  zone_id: string,
): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/zones", {
    id: zone_id,
    remove: true,
  });
};

export const fetchModules = (
  hass: HomeAssistant,
): Promise<SmartIrrigationModule[]> =>
  hass.callWS({
    type: DOMAIN + "/modules",
  });

export const fetchAllModules = (
  hass: HomeAssistant,
): Promise<SmartIrrigationModule[]> =>
  hass.callWS({
    type: DOMAIN + "/allmodules",
  });

export const saveModule = (
  hass: HomeAssistant,
  config: Partial<SmartIrrigationModule>,
): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/modules", config);
};

export const deleteModule = (
  hass: HomeAssistant,
  module_id: string,
): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/modules", {
    id: module_id,
    remove: true,
  });
};

export const fetchMappings = (
  hass: HomeAssistant,
): Promise<SmartIrrigationMapping[]> =>
  hass.callWS({
    type: DOMAIN + "/mappings",
  });
export const saveMapping = (
  hass: HomeAssistant,
  config: Partial<SmartIrrigationMapping>,
): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/mappings", config);
};

export const deleteMapping = (
  hass: HomeAssistant,
  mapping_id: string,
): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/mappings", {
    id: mapping_id,
    remove: true,
  });
};

// TODO: Backend API needed - Implement irrigation info endpoint
export const fetchIrrigationInfo = (hass: HomeAssistant): Promise<any> => {
  // Stub implementation - returns mock data
  // Backend should implement: GET /api/smart_irrigation/info
  return Promise.resolve({
    next_irrigation_start: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    next_irrigation_duration: 1800, // 30 minutes
    next_irrigation_zones: ["Zone 1", "Zone 3"],
    irrigation_reason: "Soil moisture levels below threshold",
    sunrise_time: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    total_irrigation_duration: 3600, // 1 hour total
    irrigation_explanation:
      "Based on weather forecast and soil moisture sensors, irrigation is scheduled to maintain optimal growing conditions.",
  });
};

// TODO: Backend API needed - Implement weather records endpoint for mapping
export const fetchMappingWeatherRecords = (
  hass: HomeAssistant,
  mapping_id: string,
  limit: number = 10,
): Promise<any[]> => {
  // Stub implementation - returns mock weather data
  // Backend should implement: GET /api/smart_irrigation/mappings/{mapping_id}/weather?limit={limit}
  const records: any[] = [];
  for (let i = 0; i < limit; i++) {
    records.push({
      timestamp: new Date(Date.now() - i * 60 * 60 * 1000), // Each hour back
      temperature: 20 + Math.random() * 10,
      humidity: 60 + Math.random() * 20,
      precipitation: Math.random() * 5,
      pressure: 1013 + Math.random() * 10,
      wind_speed: Math.random() * 15,
      retrieval_time: new Date(Date.now() - i * 60 * 60 * 1000 + 5 * 60 * 1000), // 5 min after data time
    });
  }
  return Promise.resolve(records);
};
