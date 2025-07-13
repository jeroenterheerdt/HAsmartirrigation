import { TemplateResult, LitElement, html, CSSResultGroup, css } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { query } from "lit/decorators.js";
import { property, customElement } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { loadHaForm } from "../../load-ha-elements";
import { UnsubscribeFunc } from "home-assistant-js-websocket";
import {
  mdiInformationOutline,
  mdiDelete,
  mdiCalculator,
  mdiUpdate,
  mdiPailRemove,
  mdiCloudOutline,
} from "@mdi/js";
import {
  deleteZone,
  fetchConfig,
  fetchZones,
  saveZone,
  calculateZone,
  updateZone,
  fetchModules,
  fetchMappings,
  calculateAllZones,
  updateAllZones,
  resetAllBuckets,
  clearAllWeatherdata,
  fetchWateringCalendar,
  fetchMappingWeatherRecords,
} from "../../data/websockets";
import { SubscribeMixin } from "../../subscribe-mixin";

import {
  SmartIrrigationConfig,
  SmartIrrigationZone,
  SmartIrrigationZoneState,
  SmartIrrigationModule,
  SmartIrrigationMapping,
  WeatherRecord,
} from "../../types";
import { output_unit } from "../../helpers";
import { commonStyle } from "../../styles";
import { localize } from "../../../localize/localize";
import {
  DOMAIN,
  UNIT_SECONDS,
  ZONE_BUCKET,
  ZONE_DRAINAGE_RATE,
  ZONE_DURATION,
  ZONE_LEAD_TIME,
  ZONE_MAPPING,
  ZONE_MAXIMUM_BUCKET,
  ZONE_MAXIMUM_DURATION,
  ZONE_MODULE,
  ZONE_MULTIPLIER,
  ZONE_NAME,
  ZONE_SIZE,
  ZONE_STATE,
  ZONE_THROUGHPUT,
} from "../../const";
import moment, { Moment } from "moment";

@customElement("smart-irrigation-view-zones")
class SmartIrrigationViewZones extends SubscribeMixin(LitElement) {
  hass?: HomeAssistant;
  @property() config?: SmartIrrigationConfig;

  @property({ type: Array })
  private zones: SmartIrrigationZone[] = [];
  @property({ type: Array })
  private modules: SmartIrrigationModule[] = [];
  @property({ type: Array })
  private mappings: SmartIrrigationMapping[] = [];

  @property({ type: Map })
  private wateringCalendars = new Map<number, any>();

  @property({ type: Map })
  private weatherRecords = new Map<number, WeatherRecord[]>();

  @property({ type: Boolean })
  private isLoading = true;

  @property({ type: Boolean })
  private isSaving = false;

  // Prevent excessive re-renders
  private _updateScheduled = false;
  private _scheduleUpdate() {
    if (this._updateScheduled) return;
    this._updateScheduled = true;
    requestAnimationFrame(() => {
      this._updateScheduled = false;
      this.requestUpdate();
    });
  }

  // Global debounce timer for better performance
  private globalDebounceTimer: number | null = null;

  // Cache for rendered zone cards
  private zoneCache = new Map<string, TemplateResult>();

  @query("#nameInput")
  private nameInput!: HTMLInputElement;

  @query("#sizeInput")
  private sizeInput!: HTMLInputElement;

  @query("#throughputInput")
  private throughputInput!: HTMLInputElement;

  /*constructor() {
    super();
    this._fetchData();
  }*/
  firstUpdated() {
    loadHaForm().catch((error) => {
      console.error("Failed to load HA form:", error);
    });
    //this._fetchData();
  }

  public hassSubscribe(): Promise<UnsubscribeFunc>[] {
    // Initial data fetch for UI setup with proper error handling
    this._fetchData().catch((error) => {
      console.error("Failed to fetch initial data:", error);
    });

    return [
      this.hass!.connection.subscribeMessage(
        () => {
          // Update data when notified of changes with proper error handling
          this._fetchData().catch((error) => {
            console.error("Failed to fetch data on config update:", error);
          });
        },
        {
          type: DOMAIN + "_config_updated",
        },
      ),
    ];
  }

  private async _fetchData(): Promise<void> {
    if (!this.hass) {
      return;
    }

    try {
      this.isLoading = true;

      // Fetch all data concurrently to reduce total wait time
      const [config, zones, modules, mappings] = await Promise.all([
        fetchConfig(this.hass),
        fetchZones(this.hass),
        fetchModules(this.hass),
        fetchMappings(this.hass),
      ]);

      this.config = config;
      this.zones = zones;
      this.modules = modules;
      this.mappings = mappings;

      // Fetch watering calendars for each zone
      this._fetchWateringCalendars();

      // Fetch weather records for each zone that has a mapping
      this._fetchWeatherRecords();

      // Clear the cache when new data is loaded
      this.zoneCache.clear();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      this.isLoading = false;
      // Trigger a re-render to ensure UI updates
      this._scheduleUpdate();
    }
  }

  private handleCalculateAllZones(): void {
    if (!this.hass) {
      return;
    }
    this.isSaving = true;
    calculateAllZones(this.hass)
      .catch((error) => {
        console.error("Failed to calculate all zones:", error);
      })
      .finally(() => {
        this.isSaving = false;
        this._scheduleUpdate();
      });
  }

  private handleUpdateAllZones(): void {
    if (!this.hass) {
      return;
    }
    this.isSaving = true;
    updateAllZones(this.hass)
      .catch((error) => {
        console.error("Failed to update all zones:", error);
      })
      .finally(() => {
        this.isSaving = false;
        this._scheduleUpdate();
      });
  }

  private handleResetAllBuckets(): void {
    if (!this.hass) {
      return;
    }
    this.isSaving = true;
    resetAllBuckets(this.hass)
      .catch((error) => {
        console.error("Failed to reset all buckets:", error);
      })
      .finally(() => {
        this.isSaving = false;
        this._scheduleUpdate();
      });
  }

  private handleClearAllWeatherdata(): void {
    if (!this.hass) {
      return;
    }
    this.isSaving = true;
    clearAllWeatherdata(this.hass)
      .catch((error) => {
        console.error("Failed to clear all weather data:", error);
      })
      .finally(() => {
        this.isSaving = false;
        this._scheduleUpdate();
      });
  }

  private handleAddZone(): void {
    if (!this.nameInput.value.trim()) {
      return; // Don't add empty zones
    }

    const newZone: SmartIrrigationZone = {
      //id: this.zones.length + 1, //new zone will have ID that is equal to current zone length + 1
      name: this.nameInput.value.trim(),
      size: parseFloat(this.sizeInput.value) || 0,
      throughput: parseFloat(this.throughputInput.value) || 0,
      state: SmartIrrigationZoneState.Automatic,
      duration: 0,
      bucket: 0,
      module: undefined,
      old_bucket: 0,
      delta: 0,
      explanation: "",
      multiplier: 1,
      mapping: undefined,
      lead_time: 0,
      maximum_duration: undefined,
      maximum_bucket: undefined,
      drainage_rate: undefined,
      current_drainage: 0,
    };

    // Optimistically update the UI
    this.zones = [...this.zones, newZone];
    this.isSaving = true;

    // Save zone with proper error handling
    this.saveToHA(newZone)
      .then(() => {
        // Clear the input fields on successful save
        this.nameInput.value = "";
        this.sizeInput.value = "";
        this.throughputInput.value = "";
        // Refresh data to get the server-assigned ID
        return this._fetchData();
      })
      .catch((error) => {
        console.error("Failed to add zone:", error);
        // Revert optimistic update on error
        this.zones = this.zones.slice(0, -1);
      })
      .finally(() => {
        this.isSaving = false;
        this._scheduleUpdate();
      });
  }

  private handleEditZone(
    index: number,
    updatedZone: SmartIrrigationZone,
  ): void {
    if (!this.hass) {
      return;
    }

    // Use direct array assignment for better performance
    this.zones[index] = updatedZone;

    // Invalidate cache for this zone
    if (updatedZone.id) {
      this.zoneCache.delete(updatedZone.id.toString());
    }

    // Use global debounce to reduce timer overhead
    if (this.globalDebounceTimer) {
      clearTimeout(this.globalDebounceTimer);
    }

    // Debounce saving to avoid excessive API calls during rapid editing
    this.globalDebounceTimer = window.setTimeout(() => {
      this.isSaving = true;
      this.saveToHA(updatedZone)
        .catch((error) => {
          console.error("Failed to save zone:", error);
        })
        .finally(() => {
          this.isSaving = false;
          this._scheduleUpdate();
        });
      this.globalDebounceTimer = null;
    }, 500);

    // Trigger minimal re-render
    this._scheduleUpdate();
  }

  private handleRemoveZone(ev: Event, index: number): void {
    if (!this.hass) {
      return;
    }
    /*showConfirmationDialog(
      ev,
      "Are you sure you want to delete this zone?",
      index
    );*/
    //const dialog = new ConfirmationDialog();
    //dialog.showDialog("{'message':'Test!'}");
    const zoneid = this.zones[index].id;
    const zone = Object.values(this.zones).at(index);
    if (!zone || zoneid == undefined) {
      return;
    }

    // Store original for potential rollback
    const originalZones = [...this.zones];

    // Optimistically update UI
    this.zones = this.zones.filter((_, i) => i !== index);

    // Clear cache for this zone
    this.zoneCache.delete(zoneid.toString());

    this.isSaving = true;

    // Delete zone from HA with proper error handling
    deleteZone(this.hass, zoneid.toString())
      .catch((error) => {
        console.error("Failed to delete zone:", error);
        // Revert the local change if deletion failed
        this.zones = originalZones;
        this._fetchData().catch((fetchError) => {
          console.error(
            "Failed to refresh data after delete error:",
            fetchError,
          );
        });
      })
      .finally(() => {
        this.isSaving = false;
        this._scheduleUpdate();
      });
  }

  private handleCalculateZone(index: number): void {
    const zone = Object.values(this.zones).at(index);
    if (!zone || zone.id == undefined) {
      return;
    }
    if (!this.hass) {
      return;
    }
    //call the calculate method of the module for the zone
    // Fire-and-forget: trigger zone calculation in background
    void calculateZone(this.hass, zone.id.toString());
  }

  private handleUpdateZone(index: number): void {
    const zone = Object.values(this.zones).at(index);
    if (!zone || zone.id == undefined) {
      return;
    }
    if (!this.hass) {
      return;
    }
    // Fire-and-forget: trigger zone update in background
    void updateZone(this.hass, zone.id.toString());
  }

  private handleViewWeatherInfo(index: number): void {
    const zone = Object.values(this.zones).at(index);
    if (!zone || zone.mapping == undefined) {
      return;
    }
    
    // Toggle weather data display by updating the zone's weather visibility state
    // For now, we'll use a simple approach to show the weather data
    const weatherSection = this.shadowRoot?.querySelector(`#weather-section-${zone.id}`);
    if (weatherSection) {
      const isHidden = weatherSection.hasAttribute('hidden');
      if (isHidden) {
        weatherSection.removeAttribute('hidden');
      } else {
        weatherSection.setAttribute('hidden', '');
      }
    }
  }

  private async _fetchWeatherRecords(): Promise<void> {
    if (!this.hass) {
      return;
    }

    // Fetch weather records for each zone that has a mapping
    for (const zone of this.zones) {
      if (zone.id !== undefined && zone.mapping !== undefined) {
        try {
          const records = await fetchMappingWeatherRecords(this.hass, zone.mapping.toString(), 10);
          this.weatherRecords.set(zone.id, records);
        } catch (error) {
          console.error(`Failed to fetch weather records for zone ${zone.id} (mapping ${zone.mapping}):`, error);
        }
      }
    }
    this._scheduleUpdate();
  }

  private async _fetchWateringCalendars(): Promise<void> {
    if (!this.hass) {
      return;
    }

    // Fetch watering calendar for each zone
    for (const zone of this.zones) {
      if (zone.id !== undefined) {
        try {
          const calendar = await fetchWateringCalendar(this.hass, zone.id.toString());
          this.wateringCalendars.set(zone.id, calendar);
        } catch (error) {
          console.error(`Failed to fetch watering calendar for zone ${zone.id}:`, error);
        }
      }
    }
    this._scheduleUpdate();
  }

  private renderWeatherRecords(zone: SmartIrrigationZone): TemplateResult {
    if (!this.hass || !zone.id) {
      return html``;
    }

    const records = this.weatherRecords.get(zone.id) || [];
    
    return html`
      <div class="weather-records">
        <h4>${localize("panels.mappings.weather-records.title", this.hass.language)}</h4>
        ${records.length === 0 
          ? html`
            <div class="weather-note">
              ${localize("panels.mappings.weather-records.no-data", this.hass.language)}
            </div>
          `
          : html`
            <div class="weather-table">
              <div class="weather-header">
                <span>${localize("panels.mappings.weather-records.timestamp", this.hass.language)}</span>
                <span>${localize("panels.mappings.weather-records.temperature", this.hass.language)}</span>
                <span>${localize("panels.mappings.weather-records.humidity", this.hass.language)}</span>
                <span>${localize("panels.mappings.weather-records.precipitation", this.hass.language)}</span>
                <span>${localize("panels.mappings.weather-records.retrieval-time", this.hass.language)}</span>
              </div>
              ${records.slice(0, 10).map(record => html`
                <div class="weather-row">
                  <span>${moment(record.timestamp).format("MM-DD HH:mm")}</span>
                  <span>${record.temperature ? record.temperature.toFixed(1) + "°C" : "-"}</span>
                  <span>${record.humidity ? record.humidity.toFixed(1) + "%" : "-"}</span>
                  <span>${record.precipitation ? record.precipitation.toFixed(1) + "mm" : "-"}</span>
                  <span>${record.retrieval_time ? moment(record.retrieval_time).format("MM-DD HH:mm") : "-"}</span>
                </div>
              `)}
            </div>
          `
        }
      </div>
    `;
  }

  private renderWateringCalendar(zone: SmartIrrigationZone): TemplateResult {
    if (!this.hass || !zone.id) {
      return html``;
    }

    const calendarData = this.wateringCalendars.get(zone.id);
    const zoneCalendar = calendarData && zone.id in calendarData ? calendarData[zone.id] : null;
    const monthlyEstimates = zoneCalendar?.monthly_estimates || [];
    
    return html`
      <div class="watering-calendar">
        <h4>Watering Calendar (12-Month Estimates)</h4>
        ${monthlyEstimates.length === 0 
          ? html`
            <div class="calendar-note">
              ${zoneCalendar?.error ? 
                `Error generating calendar: ${zoneCalendar.error}` :
                "No watering calendar data available for this zone"
              }
            </div>
          `
          : html`
            <div class="calendar-table">
              <div class="calendar-header">
                <span>Month</span>
                <span>ET (mm)</span>
                <span>Precipitation (mm)</span>
                <span>Watering (L)</span>
                <span>Avg Temp (°C)</span>
              </div>
              ${monthlyEstimates.map(estimate => html`
                <div class="calendar-row">
                  <span>${estimate.month_name || `Month ${estimate.month}` || "-"}</span>
                  <span>${estimate.estimated_et_mm ? estimate.estimated_et_mm.toFixed(1) : "-"}</span>
                  <span>${estimate.average_precipitation_mm ? estimate.average_precipitation_mm.toFixed(1) : "-"}</span>
                  <span>${estimate.estimated_watering_volume_liters ? estimate.estimated_watering_volume_liters.toFixed(0) : "-"}</span>
                  <span>${estimate.average_temperature_c ? estimate.average_temperature_c.toFixed(1) : "-"}</span>
                </div>
              `)}
            </div>
            ${zoneCalendar?.calculation_method ? html`
              <div class="calendar-info">
                Method: ${zoneCalendar.calculation_method}
              </div>
            ` : ''}
          `
        }
      </div>
    `;
  }

  private async saveToHA(zone: SmartIrrigationZone): Promise<void> {
    if (!this.hass) {
      throw new Error("Home Assistant connection not available");
    }
    // Save zone to HA backend with proper error handling
    await saveZone(this.hass, zone);
  }

  private renderTheOptions(thelist: object, selected?: number): TemplateResult {
    if (!this.hass) {
      return html``;
    } else {
      let r = html`<option value="" ?selected=${
        selected === undefined
      }">---${localize(
        "common.labels.select",
        this.hass.language,
      )}---</option>`;
      Object.entries(thelist).map(
        ([key, value]) =>
          /*html`<option value="${value["id"]}" ?selected="${
          zone.module === value["id"]
        }>
          ${value["id"]}: ${value["name"]}
        </option>`*/
          (r = html`${r}
            <option
              value="${value["id"]}"
              ?selected="${selected === value["id"]}"
            >
              ${value["id"]}: ${value["name"]}
            </option>`),
      );
      return r;
    }
  }

  private renderZone(zone: SmartIrrigationZone, index: number): TemplateResult {
    if (!this.hass) {
      return html``;
    } else {
      let explanation_svg_to_show;
      if (zone.explanation != null && zone.explanation.length > 0) {
        explanation_svg_to_show = html`<svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          id="showcalcresults${index}"
          @click="${() => this.toggleExplanation(index)}"
        >
          <title>
            ${localize("panels.zones.actions.information", this.hass.language)}
          </title>
          <path fill="#404040" d="${mdiInformationOutline}" />
        </svg>`;
      }
      let calculation_svg_to_show;
      if (zone.state === SmartIrrigationZoneState.Automatic) {
        calculation_svg_to_show = html` <svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          @click="${() => this.handleCalculateZone(index)}"
        >
          <title>
            ${localize("panels.zones.actions.calculate", this.hass.language)}
          </title>
          <path fill="#404040" d="${mdiCalculator}" />
        </svg>`;
      }
      let update_svg_to_show;
      if (zone.state === SmartIrrigationZoneState.Automatic) {
        update_svg_to_show = html` <svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          @click="${() => this.handleUpdateZone(index)}"
        >
          <title>
            ${localize("panels.zones.actions.update", this.hass.language)}
          </title>
          <path fill="#404040" d="${mdiUpdate}" />
        </svg>`;
      }
      const reset_bucket_svg_to_show = html` <svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          @click="${() =>
            this.handleEditZone(index, {
              ...zone,
              [ZONE_BUCKET]: 0.0,
            })}"}"
        >
          <title>
            ${localize("panels.zones.actions.reset-bucket", this.hass.language)}
          </title>
          <path fill="#404040" d="${mdiPailRemove}" />
        </svg>`;

      let weather_info_svg_to_show;
      if (zone.mapping != undefined) {
        weather_info_svg_to_show = html` <svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          @click="${() => this.handleViewWeatherInfo(index)}"
        >
          <title>
            ${localize("panels.zones.actions.view-weather-info", this.hass.language)}
          </title>
          <path fill="#404040" d="${mdiCloudOutline}" />
        </svg>`;
      }

      //get mapping last updated and datapoints
      let the_mapping;
      const mapping_last_updated = "-";
      const mapping_number_of_datapoints = 0;
      if (zone.mapping != undefined) {
        the_mapping = this.mappings.filter((o) => o.id === zone.mapping)[0];
        if (the_mapping != undefined) {
          if (the_mapping.data_last_updated != undefined) {
            zone.last_updated = the_mapping.data_last_updated;
            if (the_mapping.data != undefined) {
              zone.number_of_data_points = the_mapping.data.length;
            }
          }
        }
      }
      return html`
        <ha-card header="${zone.name}">
          <div class="card-content">
            <label for="last_calculated${index}"
              >${localize(
                "panels.zones.labels.last_calculated",
                this.hass.language,
              )}:
              ${
                zone.last_calculated
                  ? moment(zone.last_calculated).format("YYYY-MM-DD HH:mm:ss")
                  : "-"
              }</label
            >
          </div>
          <div class="card-content">
            <label for="last_updated${index}"
              >${localize(
                "panels.zones.labels.data-last-updated",
                this.hass.language,
              )}:
              ${
                zone.last_updated
                  ? moment(zone.last_updated).format("YYYY-MM-DD HH:mm:ss")
                  : "-"
              }</label
            >
          </div>
          <div class="card-content">
            <label for="last_updated${index}"
              >${localize(
                "panels.zones.labels.data-number-of-data-points",
                this.hass.language,
              )}:
              ${zone.number_of_data_points}</label
            >
          </div>
          <div class="card-content">
            <label for="name${index}"
              >${localize(
                "panels.zones.labels.name",
                this.hass.language,
              )}:</label
            >
            <input
              id="name${index}"
              type="text"
              .value="${zone.name}"
              @input="${(e: Event) =>
                this.handleEditZone(index, {
                  ...zone,
                  [ZONE_NAME]: (e.target as HTMLInputElement).value,
                })}"
            />
            <div class="zoneline">
              <label for="size${index}"
                >${localize("panels.zones.labels.size", this.hass.language)}
                (${output_unit(this.config, ZONE_SIZE)}):</label
              >
              <input class="shortinput" id="size${index}" type="number""
              .value="${zone.size}"
              @input="${(e: Event) =>
                this.handleEditZone(index, {
                  ...zone,
                  [ZONE_SIZE]: parseFloat((e.target as HTMLInputElement).value),
                })}"
              />
            </div>
            <div class="zoneline">
              <label for="throughput${index}"
                >${localize(
                  "panels.zones.labels.throughput",
                  this.hass.language,
                )}
                (${output_unit(this.config, ZONE_THROUGHPUT)}):</label
              >
              <input
                class="shortinput"
                id="throughput${index}"
                type="number"
                .value="${zone.throughput}"
                @input="${(e: Event) =>
                  this.handleEditZone(index, {
                    ...zone,
                    [ZONE_THROUGHPUT]: parseFloat(
                      (e.target as HTMLInputElement).value,
                    ),
                  })}"
              />
            </div>
            <div class="zoneline">
              <label for="drainage_rate${index}"
                >${localize(
                  "panels.zones.labels.drainage_rate",
                  this.hass.language,
                )}
                (${output_unit(this.config, ZONE_DRAINAGE_RATE)}):</label
              >
              <input
                class="shortinput"
                id="drainage_rate${index}"
                type="number"
                .value="${zone.drainage_rate}"
                @input="${(e: Event) =>
                  this.handleEditZone(index, {
                    ...zone,
                    [ZONE_DRAINAGE_RATE]: parseFloat(
                      (e.target as HTMLInputElement).value,
                    ),
                  })}"
              />
            </div>
            <div class="zoneline">
              <label for="state${index}"
                >${localize(
                  "panels.zones.labels.state",
                  this.hass.language,
                )}:</label
              >
              <select
                required
                id="state${index}"
                @change="${(e: Event) =>
                  this.handleEditZone(index, {
                    ...zone,
                    [ZONE_STATE]: (e.target as HTMLSelectElement)
                      .value as SmartIrrigationZoneState,
                    [ZONE_DURATION]: 0,
                  })}"
              >
                <option
                  value="${SmartIrrigationZoneState.Automatic}"
                  ?selected="${
                    zone.state === SmartIrrigationZoneState.Automatic
                  }"
                >
                  ${localize(
                    "panels.zones.labels.states.automatic",
                    this.hass.language,
                  )}
                </option>
                <option
                  value="${SmartIrrigationZoneState.Disabled}"
                  ?selected="${
                    zone.state === SmartIrrigationZoneState.Disabled
                  }"
                >
                  ${localize(
                    "panels.zones.labels.states.disabled",
                    this.hass.language,
                  )}
                </option>
                <option
                  value="${SmartIrrigationZoneState.Manual}"
                  ?selected="${zone.state === SmartIrrigationZoneState.Manual}"
                >
                  ${localize(
                    "panels.zones.labels.states.manual",
                    this.hass.language,
                  )}
                </option>
              </select>
              <label for="module${index}"
                >${localize("common.labels.module", this.hass.language)}:</label
              >

              <select
                id="module${index}"
                @change="${(e: Event) =>
                  this.handleEditZone(index, {
                    ...zone,
                    [ZONE_MODULE]: parseInt(
                      (e.target as HTMLSelectElement).value,
                    ),
                  })}"
              >
                ${this.renderTheOptions(this.modules, zone.module)}
              </select>
              <label for="module${index}"
                >${localize(
                  "panels.zones.labels.mapping",
                  this.hass.language,
                )}:</label
              >

              <select
                id="mapping${index}"
                @change="${(e: Event) =>
                  this.handleEditZone(index, {
                    ...zone,
                    [ZONE_MAPPING]: parseInt(
                      (e.target as HTMLSelectElement).value,
                    ),
                  })}"
              >
                ${this.renderTheOptions(this.mappings, zone.mapping)}
              </select>
            </div>
            <div class="zoneline">
              <label for="bucket${index}"
                >${localize("panels.zones.labels.bucket", this.hass.language)}
                (${output_unit(this.config, ZONE_BUCKET)}):</label
              >
              <input
                class="shortinput"
                id="bucket${index}"
                type="number"
                .value="${Number(zone.bucket).toFixed(1)}"
                @input="${(e: Event) =>
                  this.handleEditZone(index, {
                    ...zone,
                    [ZONE_BUCKET]: parseFloat(
                      (e.target as HTMLInputElement).value,
                    ),
                  })}"
              />
              <label for="maximum-bucket${index}"
                >${localize(
                  "panels.zones.labels.maximum-bucket",
                  this.hass.language,
                )}
                (${output_unit(this.config, ZONE_BUCKET)}):</label
              >
              <input
                class="shortinput"
                id="maximum-bucket${index}"
                type="number"
                .value="${Number(zone.maximum_bucket).toFixed(1)}"
                @input="${(e: Event) =>
                  this.handleEditZone(index, {
                    ...zone,
                    [ZONE_MAXIMUM_BUCKET]: parseFloat(
                      (e.target as HTMLInputElement).value,
                    ),
                  })}"
              />
              <br />
              <label for="lead_time${index}"
                >${localize(
                  "panels.zones.labels.lead-time",
                  this.hass.language,
                )}
                (s):</label
              >
              <input
                class="shortinput"
                id="lead_time${index}"
                type="number"
                .value="${zone.lead_time}"
                @input="${(e: Event) =>
                  this.handleEditZone(index, {
                    ...zone,
                    [ZONE_LEAD_TIME]: parseInt(
                      (e.target as HTMLInputElement).value,
                      10,
                    ),
                  })}"
              />
              <label for="maximum-duration${index}"
                >${localize(
                  "panels.zones.labels.maximum-duration",
                  this.hass.language,
                )}
                (s):</label
              >
              <input
                class="shortinput"
                id="maximum-duration${index}"
                type="number"
                .value="${zone.maximum_duration}"
                @input="${(e: Event) =>
                  this.handleEditZone(index, {
                    ...zone,
                    [ZONE_MAXIMUM_DURATION]: parseInt(
                      (e.target as HTMLInputElement).value,
                      10,
                    ),
                  })}"
              />
            </div>
            <div class="zoneline">
              <label for="multiplier${index}"
                >${localize(
                  "panels.zones.labels.multiplier",
                  this.hass.language,
                )}:</label
              >
              <input
                class="shortinput"
                id="multiplier${index}"
                type="number"
                .value="${zone.multiplier}"
                @input="${(e: Event) =>
                  this.handleEditZone(index, {
                    ...zone,
                    [ZONE_MULTIPLIER]: parseFloat(
                      (e.target as HTMLInputElement).value,
                    ),
                  })}"
              />
              <label for="duration${index}"
                >${localize("panels.zones.labels.duration", this.hass.language)}
                (${UNIT_SECONDS}):</label
              >
              <input
                class="shortinput"
                id="duration${index}"
                type="number"
                .value="${zone.duration}"
                ?readonly="${
                  zone.state === SmartIrrigationZoneState.Disabled ||
                  zone.state === SmartIrrigationZoneState.Automatic
                }"
                @input="${(e: Event) =>
                  this.handleEditZone(index, {
                    ...zone,
                    [ZONE_DURATION]: parseInt(
                      (e.target as HTMLInputElement).value,
                      10,
                    ),
                  })}"
              />
            </div>
            <div class="zoneline">
              ${update_svg_to_show} ${calculation_svg_to_show}
              ${explanation_svg_to_show} ${reset_bucket_svg_to_show}
              ${weather_info_svg_to_show}
              <svg
                style="width:24px;height:24px"
                viewBox="0 0 24 24"
                id="deleteZone${index}"
                @click="${(e: Event) => this.handleRemoveZone(e, index)}"
              >
                <title>
                  ${localize("common.actions.delete", this.hass.language)}
                </title>
                <path fill="#404040" d="${mdiDelete}" />
              </svg>
            </div>
            <div class="zoneline">
              <div>
                <label class="hidden" id="calcresults${index}"
                  >${unsafeHTML("<br/>" + zone.explanation)}</label
                >
              </div>
            </div>
            ${this.renderWateringCalendar(zone)}
            <div id="weather-section-${zone.id}" hidden>
              ${this.renderWeatherRecords(zone)}
            </div>
          </div>
        </ha-card>
      `;
    }
  }

  toggleExplanation(index: number) {
    const el = this.shadowRoot?.querySelector("#calcresults" + index);
    //const bt = this.shadowRoot?.querySelector("#showcalcresults" + index);
    //if (!el || !bt) {
    if (!el) {
      return;
    } else {
      if (el.className != "hidden") {
        el.className = "hidden";
        //bt.textContent = "Show calculation explanation";
      } else {
        el.className = "explanation";
        //bt.textContent = "Hide explanation";
      }
    }
  }

  render(): TemplateResult {
    if (!this.hass) {
      return html``;
    }

    if (this.isLoading) {
      return html`
        <ha-card header="${localize("panels.zones.title", this.hass.language)}">
          <div class="card-content">
            ${localize("common.loading", this.hass.language)}...
          </div>
        </ha-card>
      `;
    }

    if (!this.config) {
      return html`
        <ha-card header="${localize("panels.zones.title", this.hass.language)}">
          <div class="card-content">Configuration not available.</div>
        </ha-card>
      `;
    }

    return html`
      <ha-card header="${localize("panels.zones.title", this.hass.language)}">
        <div class="card-content">
          ${localize("panels.zones.description", this.hass.language)}
          ${this.isSaving
            ? html`<div class="saving-indicator">
                ${localize("common.saving", this.hass.language)}...
              </div>`
            : ""}
        </div>
      </ha-card>
      <ha-card
        header="${localize(
          "panels.zones.cards.add-zone.header",
          this.hass.language,
        )}"
      >
        <div class="card-content">
          <div class="zoneline">
            <label for="nameInput"
              >${localize(
                "panels.zones.labels.name",
                this.hass.language,
              )}:</label
            >
            <input id="nameInput" type="text" ?disabled="${this.isSaving}" />
          </div>
          <div class="zoneline">
            <input
              class="shortinput"
              id="sizeInput"
              type="number"
              ?disabled="${this.isSaving}"
            />
            (${output_unit(this.config, ZONE_SIZE)})
          </div>
          <div class="zoneline">
            <label for="throughputInput"
              >${localize("panels.zones.labels.throughput", this.hass.language)}
              (${output_unit(this.config, ZONE_THROUGHPUT)}):</label
            >
            <input
              id="throughputInput"
              class="shortinput"
              type="number"
              ?disabled="${this.isSaving}"
            />
          </div>
          <div class="zoneline">
            <button @click="${this.handleAddZone}" ?disabled="${this.isSaving}">
              ${localize(
                "panels.zones.cards.add-zone.actions.add",
                this.hass.language,
              )}
            </button>
          </div>
        </div>
      </ha-card>
      <ha-card
        header="${localize(
          "panels.zones.cards.zone-actions.header",
          this.hass.language,
        )}"
      >
        <div class="card-content">
          <button
            @click="${this.handleUpdateAllZones}"
            ?disabled="${this.isSaving}"
          >
            ${localize(
              "panels.zones.cards.zone-actions.actions.update-all",
              this.hass.language,
            )}
          </button>
          <button
            @click="${this.handleCalculateAllZones}"
            ?disabled="${this.isSaving}"
          >
            ${localize(
              "panels.zones.cards.zone-actions.actions.calculate-all",
              this.hass.language,
            )}
          </button>
          <button
            @click="${this.handleResetAllBuckets}"
            ?disabled="${this.isSaving}"
          >
            ${localize(
              "panels.zones.cards.zone-actions.actions.reset-all-buckets",
              this.hass.language,
            )}
          </button>
          <button
            @click="${this.handleClearAllWeatherdata}"
            ?disabled="${this.isSaving}"
          >
            ${localize(
              "panels.zones.cards.zone-actions.actions.clear-all-weatherdata",
              this.hass.language,
            )}
          </button>
        </div>
      </ha-card>

      ${Object.entries(this.zones).map(([key, value]) =>
        this.renderZone(value, parseInt(key)),
      )}
    `;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up global debounce timer
    if (this.globalDebounceTimer) {
      clearTimeout(this.globalDebounceTimer);
      this.globalDebounceTimer = null;
    }

    // Clear the zone cache
    this.zoneCache.clear();
  }

  /*
  ${Object.entries(this.zones).map(([key, value]) =>
            this.renderZone(value, value["id"])
          )}
          */

  static get styles(): CSSResultGroup {
    return css`
      ${commonStyle}
      .zone {
        margin-top: 25px;
        margin-bottom: 25px;
      }
      .hidden {
        display: none;
      }
      .shortinput {
        width: 50px;
      }
      .zoneline {
        margin-left: 20px;
        margin-top: 5px;
      }
      .saving-indicator {
        color: var(--primary-color);
        font-style: italic;
        margin-top: 8px;
        font-size: 0.9em;
      }
      
      .watering-calendar {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }
      
      .watering-calendar h4 {
        margin: 0 0 12px 0;
        font-size: 1em;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      
      .calendar-table {
        display: grid;
        grid-template-columns: 1fr 0.8fr 1fr 0.8fr 0.8fr;
        gap: 8px;
        font-size: 0.85em;
      }
      
      .calendar-header {
        display: contents;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      
      .calendar-header span {
        padding: 4px;
        background: var(--card-background-color);
        border-bottom: 2px solid var(--primary-color);
      }
      
      .calendar-row {
        display: contents;
        color: var(--secondary-text-color);
      }
      
      .calendar-row span {
        padding: 4px;
        border-bottom: 1px solid var(--divider-color);
      }
      
      .calendar-note {
        padding: 8px;
        background: var(--secondary-background-color);
        color: var(--secondary-text-color);
        border-radius: 4px;
        font-size: 0.9em;
        font-style: italic;
      }
      
      .calendar-info {
        margin-top: 8px;
        padding: 4px 8px;
        background: var(--info-color, var(--primary-color));
        color: white;
        border-radius: 4px;
        font-size: 0.8em;
      }

      .weather-records {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }
      
      .weather-records h4 {
        margin: 0 0 12px 0;
        font-size: 1em;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      
      .weather-table {
        display: grid;
        grid-template-columns: 1fr 0.8fr 0.8fr 0.8fr 1fr;
        gap: 8px;
        font-size: 0.85em;
      }
      
      .weather-header {
        display: contents;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      
      .weather-header span {
        padding: 4px;
        background: var(--card-background-color);
        border-bottom: 2px solid var(--primary-color);
      }
      
      .weather-row {
        display: contents;
        color: var(--secondary-text-color);
      }
      
      .weather-row span {
        padding: 4px;
        border-bottom: 1px solid var(--divider-color);
      }
      
      .weather-note {
        padding: 8px;
        background: var(--secondary-background-color);
        color: var(--secondary-text-color);
        border-radius: 4px;
        font-size: 0.9em;
        font-style: italic;
      }
    `;
  }
}
