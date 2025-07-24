import { CSSResultGroup, LitElement, css, html } from "lit";
import { property, customElement } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { UnsubscribeFunc } from "home-assistant-js-websocket";

import { fetchConfig, saveConfig } from "../../data/websockets";
import { SubscribeMixin } from "../../subscribe-mixin";
import { localize } from "../../../localize/localize";
import { output_unit, pick, handleError, parseBoolean } from "../../helpers";
import { loadHaForm } from "../../load-ha-elements";
import "../../dialogs/trigger-dialog";
import { SmartIrrigationConfig, IrrigationStartTrigger } from "../../types";
import { globalStyle } from "../../styles/global-style";
import { Path } from "../../common/navigation";
import {
  AUTO_UPDATE_SCHEDULE_DAILY,
  AUTO_UPDATE_SCHEDULE_HOURLY,
  AUTO_UPDATE_SCHEDULE_MINUTELY,
  CONF_AUTO_CALC_ENABLED,
  CONF_AUTO_CLEAR_ENABLED,
  CONF_AUTO_UPDATE_ENABLED,
  CONF_AUTO_UPDATE_INTERVAL,
  CONF_AUTO_UPDATE_SCHEDULE,
  CONF_AUTO_UPDATE_TIME,
  CONF_CALC_TIME,
  CONF_CLEAR_TIME,
  CONF_CONTINUOUS_UPDATES,
  CONF_SENSOR_DEBOUNCE,
  CONF_IRRIGATION_START_TRIGGERS,
  CONF_SKIP_IRRIGATION_ON_PRECIPITATION,
  CONF_PRECIPITATION_THRESHOLD_MM,
  TRIGGER_TYPE_SUNRISE,
  TRIGGER_TYPE_SUNSET,
  TRIGGER_TYPE_SOLAR_AZIMUTH,
  DOMAIN,
} from "../../const";
import { mdiInformationOutline, mdiPlus, mdiPencil, mdiDelete } from "@mdi/js";

@customElement("smart-irrigation-view-general")
export class SmartIrrigationViewGeneral extends SubscribeMixin(LitElement) {
  hass?: HomeAssistant;
  @property() narrow!: boolean;
  @property() path!: Path;

  @property() data?: Partial<SmartIrrigationConfig>;
  @property() config?: SmartIrrigationConfig;

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

  // Debounced save operation for better performance
  private debouncedSave = (() => {
    let timeoutId: number | null = null;
    return (changes: Partial<SmartIrrigationConfig>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        this.saveData(changes);
        timeoutId = null;
      }, 500); // 500ms debounce
    };
  })();

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

    this.isLoading = true;
    this._scheduleUpdate();

    try {
      this.config = await fetchConfig(this.hass);
      this.data = pick(this.config, [
        CONF_CALC_TIME,
        CONF_AUTO_CALC_ENABLED,
        CONF_AUTO_UPDATE_ENABLED,
        CONF_AUTO_UPDATE_SCHEDULE,
        CONF_AUTO_UPDATE_TIME,
        CONF_AUTO_UPDATE_INTERVAL,
        CONF_AUTO_CLEAR_ENABLED,
        CONF_CLEAR_TIME,
        CONF_CONTINUOUS_UPDATES,
        CONF_SENSOR_DEBOUNCE,
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Handle error gracefully - keep existing data if fetch fails
    } finally {
      this.isLoading = false;
      this._scheduleUpdate();
    }
  }

  firstUpdated() {
    // Load HA form elements in background without blocking UI
    loadHaForm().catch((error) => {
      console.error("Failed to load HA form:", error);
    });
  }

  render() {
    if (!this.hass || !this.config || !this.data) {
      return html`<div class="loading-indicator">
        ${localize(
          "common.loading-messages.configuration",
          this.hass?.language ?? "en",
        )}
      </div>`;
    }

    if (this.isLoading) {
      return html`<div class="loading-indicator">
        ${localize("common.loading-messages.general", this.hass.language)}
      </div>`;
    } else {
      let r1 = html` <div class="card-content">
          <svg
            style="width:24px;height:24px"
            viewBox="0 0 24 24"
            id="showautocalcdescription"
            @click="${() => this.toggleInformation("autocalcdescription")}"
          >
            >
            <title>
              ${localize(
                "panels.zones.actions.information",
                this.hass.language,
              )}
            </title>
            <path fill="#404040" d="${mdiInformationOutline}" />
          </svg>
        </div>

        <div class="card-content">
          <label class="hidden" id="autocalcdescription">
            ${localize(
              "panels.general.cards.automatic-duration-calculation.description",
              this.hass.language,
            )}
          </label>
        </div>
        <div class="card-content">
          <div class="zoneline">
            <label for="autocalcenabled"
              >${localize(
                "panels.general.cards.automatic-duration-calculation.labels.auto-calc-enabled",
                this.hass.language,
              )}:</label
            >
            <div>
              <input
                type="radio"
                id="autocalcon"
                name="autocalcenabled"
                value="True"
                ?checked="${this.config.autocalcenabled}"
                @change="${(e: Event) => {
                  this.handleConfigChange({
                    autocalcenabled: parseBoolean(
                      (e.target as HTMLInputElement).value,
                    ),
                  });
                }}"
              /><label for="autocalcon"
                >${localize("common.labels.yes", this.hass.language)}</label
              >
              <input
                type="radio"
                id="autocalcoff"
                name="autocalcenabled"
                value="False"
                ?checked="${!this.config.autocalcenabled}"
                @change="${(e: Event) => {
                  this.handleConfigChange({
                    autocalcenabled: parseBoolean(
                      (e.target as HTMLInputElement).value,
                    ),
                  });
                }}"
              /><label for="autocalcoff"
                >${localize("common.labels.no", this.hass.language)}</label
              >
            </div>
          </div>
        </div>`;
      if (this.data.autocalcenabled) {
        r1 = html`${r1}
          <div class="card-content">
            <div class="zoneline">
              <label for="calctime"
                >${localize(
                  "panels.general.cards.automatic-duration-calculation.labels.calc-time",
                  this.hass.language,
                )}:</label
              >
              <input
                id="calctime"
                type="text"
                class="shortinput"
                .value="${this.config.calctime}"
                @input=${(e: Event) => {
                  this.handleConfigChange({
                    calctime: (e.target as HTMLInputElement).value,
                  });
                }}
              />
            </div>
          </div>`;
      }
      r1 = html`<ha-card
        header="${localize(
          "panels.general.cards.automatic-duration-calculation.header",
          this.hass.language,
        )}"
      >
        ${r1}</ha-card
      >`;
      let r2 = html` <div class="card-content">
          <svg
            style="width:24px;height:24px"
            viewBox="0 0 24 24"
            id="showautoupdatedescription"
            @click="${() => this.toggleInformation("autoupdatedescription")}"
          >
            >
            <title>
              ${localize(
                "panels.zones.actions.information",
                this.hass.language,
              )}
            </title>
            <path fill="#404040" d="${mdiInformationOutline}" />
          </svg>
        </div>
        <div class="card-content">
          <label class="hidden" id="autoupdatedescription">
            ${localize(
              "panels.general.cards.automatic-update.description",
              this.hass.language,
            )}
          </label>
        </div>
        <div class="card-content">
          <div class="zoneline">
            <label for="autoupdateenabled"
              >${localize(
                "panels.general.cards.automatic-update.labels.auto-update-enabled",
                this.hass.language,
              )}:</label
            >
            <div>
              <input
                type="radio"
                id="autoupdateon"
                name="autoupdateenabled"
                value="True"
                ?checked="${this.config.autoupdateenabled}"
                @change="${(e: Event) => {
                  this.saveData({
                    autoupdateenabled: parseBoolean(
                      (e.target as HTMLInputElement).value,
                    ),
                  });
                }}"
              /><label for="autoupdateon"
                >${localize("common.labels.yes", this.hass.language)}</label
              >
              <input
                type="radio"
                id="autoupdateoff"
                name="autoupdateenabled"
                value="False"
                ?checked="${!this.config.autoupdateenabled}"
                @change="${(e: Event) => {
                  this.saveData({
                    autoupdateenabled: parseBoolean(
                      (e.target as HTMLInputElement).value,
                    ),
                  });
                }}"
              /><label for="autoupdateoff"
                >${localize("common.labels.no", this.hass.language)}</label
              >
            </div>
          </div>
        </div>`;
      if (this.data.autoupdateenabled) {
        r2 = html`${r2}
          <div class="card-content">
            <div class="zoneline">
              <label for="autoupdateinterval"
                >${localize(
                  "panels.general.cards.automatic-update.labels.auto-update-interval",
                  this.hass.language,
                )}:</label
              >
              <div style="display: flex; gap: 8px; align-items: center;">
                <input
                  name="autoupdateinterval"
                  class="shortinput"
                  type="number"
                  value="${this.data.autoupdateinterval}"
                  @input="${(e: Event) => {
                    this.saveData({
                      autoupdateinterval: parseInt(
                        (e.target as HTMLInputElement).value,
                      ),
                    });
                  }}"
                />
                <select
                  type="text"
                  id="autoupdateschedule"
                  @change="${(e: Event) => {
                    this.saveData({
                      autoupdateschedule: (e.target as HTMLInputElement).value,
                    });
                  }}"
                >
                  <option
                    value="${AUTO_UPDATE_SCHEDULE_MINUTELY}"
                    ?selected="${this.data.autoupdateschedule ===
                    AUTO_UPDATE_SCHEDULE_MINUTELY}"
                  >
                    ${localize(
                      "panels.general.cards.automatic-update.options.minutes",
                      this.hass.language,
                    )}
                  </option>
                  <option
                    value="${AUTO_UPDATE_SCHEDULE_HOURLY}"
                    ?selected="${this.data.autoupdateschedule ===
                    AUTO_UPDATE_SCHEDULE_HOURLY}"
                  >
                    ${localize(
                      "panels.general.cards.automatic-update.options.hours",
                      this.hass.language,
                    )}
                  </option>
                  <option
                    value="${AUTO_UPDATE_SCHEDULE_DAILY}"
                    ?selected="${this.data.autoupdateschedule ===
                    AUTO_UPDATE_SCHEDULE_DAILY}"
                  >
                    ${localize(
                      "panels.general.cards.automatic-update.options.days",
                      this.hass.language,
                    )}
                  </option>
                </select>
              </div>
            </div>
          </div>`;
      }
      if (this.data.autoupdateenabled) {
        r2 = html`${r2}
          <div class="card-content">
            <div class="zoneline">
              <label for="updatedelay"
                >${localize(
                  "panels.general.cards.automatic-update.labels.auto-update-delay",
                  this.hass.language,
                )}
                (s):</label
              >
              <input
                id="updatedelay"
                type="text"
                class="shortinput"
                .value="${this.config.autoupdatedelay}"
                @input=${(e: Event) => {
                  this.saveData({
                    autoupdatedelay: parseInt(
                      (e.target as HTMLInputElement).value,
                    ),
                  });
                }}
              />
            </div>
          </div>`;
      }

      r2 = html`<ha-card header="${localize(
        "panels.general.cards.automatic-update.header",
        this.hass.language,
      )}",
      this.hass.language)}">${r2}</ha-card>`;

      let r3 = html` <div class="card-content">
          <svg
            style="width:24px;height:24px"
            viewBox="0 0 24 24"
            id="showautocleardescription"
            @click="${() => this.toggleInformation("autocleardescription")}"
          >
            <title>
              ${localize(
                "panels.zones.actions.information",
                this.hass.language,
              )}
            </title>

            <path fill="#404040" d="${mdiInformationOutline}" />
          </svg>
        </div>
        <div class="card-content">
          <label class="hidden" id="autocleardescription">
            ${localize(
              "panels.general.cards.automatic-clear.description",
              this.hass.language,
            )}
          </label>
        </div>
        <div class="card-content">
          <div class="zoneline">
            <label for="autoclearenabled"
              >${localize(
                "panels.general.cards.automatic-clear.labels.automatic-clear-enabled",
                this.hass.language,
              )}:</label
            >
            <div>
              <input
                type="radio"
                id="autoclearon"
                name="autoclearenabled"
                value="True"
                ?checked="${this.config.autoclearenabled}"
                @change="${(e: Event) => {
                  this.handleConfigChange({
                    autoclearenabled: parseBoolean(
                      (e.target as HTMLInputElement).value,
                    ),
                  });
                }}"
              /><label for="autoclearon"
                >${localize("common.labels.yes", this.hass.language)}</label
              >
              <input
                type="radio"
                id="autoclearoff"
                name="autoclearenabled"
                value="False"
                ?checked="${!this.config.autoclearenabled}"
                @change="${(e: Event) => {
                  this.handleConfigChange({
                    autoclearenabled: parseBoolean(
                      (e.target as HTMLInputElement).value,
                    ),
                  });
                }}"
              /><label for="autoclearoff"
                >${localize("common.labels.no", this.hass.language)}</label
              >
            </div>
          </div>
        </div>`;
      if (this.data.autoclearenabled) {
        r3 = html`${r3}
          <div class="card-content">
            <div class="zoneline">
              <label for="calctime"
                >${localize(
                  "panels.general.cards.automatic-clear.labels.automatic-clear-time",
                  this.hass.language,
                )}:</label
              >
              <input
                id="cleardatatime"
                type="text"
                class="shortinput"
                .value="${this.config.cleardatatime}"
                @input=${(e: Event) => {
                  this.handleConfigChange({
                    cleardatatime: (e.target as HTMLInputElement).value,
                  });
                }}
              />
            </div>
          </div>`;
      }
      r3 = html`<ha-card
        header="${localize(
          "panels.general.cards.automatic-clear.header",
          this.hass.language,
        )}"
        >${r3}</ha-card
      >`;

      let r4 = html`<div class="card-content">
          <svg
            style="width:24px;height:24px"
            viewBox="0 0 24 24"
            id="showcontinuousupdatesdescription"
            @click="${() =>
              this.toggleInformation("continuousupdatesdescription")}"
          >
            >
            <title>
              ${localize(
                "panels.zones.actions.information",
                this.hass.language,
              )}
            </title>
            <path fill="#404040" d="${mdiInformationOutline}" />
          </svg>
        </div>
        <div class="card-content">
          <label class="hidden" id="continuousupdatesdescription">
            ${localize(
              "panels.general.cards.continuousupdates.description",
              this.hass.language,
            )}
          </label>
        </div>
        <div class="card-content">
          <div class="zoneline">
            <label for="continuousupdates"
              >${localize(
                "panels.general.cards.continuousupdates.labels.continuousupdates",
                this.hass.language,
              )}:</label
            >
            <div>
              <input
                type="radio"
                id="continuousupdateson"
                name="continuousupdates"
                value="True"
                ?checked="${this.config.continuousupdates}"
                @change="${(e: Event) => {
                  this.handleConfigChange({
                    continuousupdates: parseBoolean(
                      (e.target as HTMLInputElement).value,
                    ),
                  });
                }}"
              /><label for="continuousupdateson"
                >${localize("common.labels.yes", this.hass.language)}</label
              >
              <input
                type="radio"
                id="continuousupdatesoff"
                name="continuousupdates"
                value="False"
                ?checked="${!this.config.continuousupdates}"
                @change="${(e: Event) => {
                  this.handleConfigChange({
                    continuousupdates: parseBoolean(
                      (e.target as HTMLInputElement).value,
                    ),
                  });
                }}"
              /><label for="continuousupdatesoff"
                >${localize("common.labels.no", this.hass.language)}</label
              >
            </div>
          </div>
        </div>`;
      if (this.data.continuousupdates) {
        r4 = html`${r4}
          <div class="card-content">
            <div class="zoneline">
              <label for="sensor_debounce"
                >${localize(
                  "panels.general.cards.continuousupdates.labels.sensor_debounce",
                  this.hass.language,
                )}
                (ms):</label
              >
              <input
                id="sensor_debounce"
                type="text"
                class="shortinput"
                .value="${this.config.sensor_debounce}"
                @input=${(e: Event) => {
                  this.handleConfigChange({
                    sensor_debounce: parseInt(
                      (e.target as HTMLInputElement).value,
                    ),
                  });
                }}
              />
            </div>
          </div>`;
      }
      r4 = html`<ha-card
        header="${localize(
          "panels.general.cards.continuousupdates.header",
          this.hass.language,
        )}"
        >${r4}</ha-card
      > `;

      // Irrigation Start Triggers Card
      const r5 = this.renderTriggersCard();

      // Weather-based Skip Card
      const r6 = this.renderWeatherSkipCard();

      const r = html`<ha-card
          header="${localize("panels.general.title", this.hass.language)}"
        >
          <div class="card-content">
            ${localize("panels.general.description", this.hass.language)}
          </div> </ha-card
        >${r2}${r1}${r3}${r4}${r5}${r6}`;

      return r;
    }
  }

  renderTriggersCard() {
    if (!this.config || !this.data || !this.hass) return html``;

    const triggers = this.config.irrigation_start_triggers || [];

    return html`
      <ha-card
        header="${localize(
          "irrigation_start_triggers.title",
          this.hass.language,
        )}"
      >
        <div class="card-content">
          <svg
            style="width:24px;height:24px"
            viewBox="0 0 24 24"
            id="showtriggersdescription"
            @click="${() => this.toggleInformation("triggersdescription")}"
          >
            <title>
              ${localize(
                "panels.zones.actions.information",
                this.hass.language,
              )}
            </title>
            <path fill="#404040" d="${mdiInformationOutline}" />
          </svg>
        </div>

        <div class="card-content">
          <label class="hidden" id="triggersdescription">
            ${localize(
              "irrigation_start_triggers.description",
              this.hass.language,
            )}
          </label>
        </div>

        <div class="card-content">
          <div class="triggers-list">
            ${triggers.length === 0
              ? html`
                  <div class="no-triggers">
                    ${localize(
                      "irrigation_start_triggers.no_triggers",
                      this.hass.language,
                    )}
                  </div>
                `
              : triggers.map((trigger, index) =>
                  this.renderTriggerItem(trigger, index),
                )}
          </div>

          <div class="add-trigger-section">
            <ha-button @click="${this._addTrigger}">
              <ha-icon .path="${mdiPlus}"></ha-icon>
              ${localize(
                "irrigation_start_triggers.add_trigger",
                this.hass.language,
              )}
            </ha-button>
          </div>
        </div>
      </ha-card>
    `;
  }

  renderTriggerItem(trigger: IrrigationStartTrigger, index: number) {
    if (!this.hass) return html``;

    const triggerTypeLabel = localize(
      `irrigation_start_triggers.trigger_types.${trigger.type}`,
      this.hass.language,
    );

    let offsetText = "";
    if (trigger.type === TRIGGER_TYPE_SUNRISE && trigger.offset_minutes === 0) {
      offsetText = localize(
        "irrigation_start_triggers.offset_auto",
        this.hass.language,
      );
    } else {
      const minutes = Math.abs(trigger.offset_minutes);
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const direction =
        trigger.offset_minutes < 0
          ? localize("common.labels.before", this.hass.language)
          : localize("common.labels.after", this.hass.language);

      if (hours > 0) {
        offsetText = `${hours}h ${mins}m ${direction}`;
      } else {
        offsetText = `${mins}m ${direction}`;
      }
    }

    let additionalInfo = "";
    if (
      trigger.type === TRIGGER_TYPE_SOLAR_AZIMUTH &&
      trigger.azimuth_angle !== undefined
    ) {
      additionalInfo = ` (${trigger.azimuth_angle}°)`;
    }

    return html`
      <div class="trigger-item ${trigger.enabled ? "enabled" : "disabled"}">
        <div class="trigger-main">
          <div class="trigger-info">
            <div class="trigger-name">${trigger.name}</div>
            <div class="trigger-details">
              ${triggerTypeLabel}${additionalInfo} - ${offsetText}
            </div>
          </div>
          <div class="trigger-status">
            ${trigger.enabled
              ? localize("common.labels.enabled", this.hass.language)
              : localize("common.labels.disabled", this.hass.language)}
          </div>
        </div>
        <div class="trigger-actions">
          <ha-icon-button
            .path="${mdiPencil}"
            @click="${() => this._editTrigger(index)}"
            title="${localize(
              "irrigation_start_triggers.edit_trigger",
              this.hass.language,
            )}"
          ></ha-icon-button>
          <ha-icon-button
            .path="${mdiDelete}"
            @click="${() => this._deleteTrigger(index)}"
            title="${localize(
              "irrigation_start_triggers.delete_trigger",
              this.hass.language,
            )}"
          ></ha-icon-button>
        </div>
      </div>
    `;
  }

  private _addTrigger() {
    this._showTriggerDialog({ createTrigger: true });
  }

  private _editTrigger(index: number) {
    const trigger = this.config?.irrigation_start_triggers?.[index];
    if (trigger) {
      this._showTriggerDialog({
        trigger: trigger,
        triggerIndex: index,
      });
    }
  }

  private _deleteTrigger(index: number) {
    if (!this.config?.irrigation_start_triggers || !this.hass) return;

    const triggerName =
      this.config.irrigation_start_triggers[index]?.name || "Unknown";
    if (
      confirm(
        localize(
          "irrigation_start_triggers.confirm_delete",
          this.hass.language,
        ).replace("{name}", triggerName),
      )
    ) {
      const triggers = [...this.config.irrigation_start_triggers];
      triggers.splice(index, 1);
      this.handleConfigChange({ [CONF_IRRIGATION_START_TRIGGERS]: triggers });
    }
  }

  private _showTriggerDialog(params: any) {
    if (!this.hass) return;

    const dialog = document.createElement("trigger-dialog") as any;
    dialog.hass = this.hass;

    dialog.addEventListener("trigger-save", (event: any) => {
      this._handleTriggerSave(event.detail);
    });

    dialog.addEventListener("trigger-delete", (event: any) => {
      this._handleTriggerDelete(event.detail);
    });

    // Add to DOM and show dialog
    document.body.appendChild(dialog);
    dialog.showDialog(params);

    // Clean up when dialog closes
    dialog.addEventListener("closed", () => {
      document.body.removeChild(dialog);
    });
  }

  private _handleTriggerSave(detail: any) {
    if (!this.config) return;

    const triggers = this.config.irrigation_start_triggers
      ? [...this.config.irrigation_start_triggers]
      : [];

    if (detail.isNew) {
      triggers.push(detail.trigger);
    } else if (detail.index !== undefined) {
      triggers[detail.index] = detail.trigger;
    }

    this.handleConfigChange({ [CONF_IRRIGATION_START_TRIGGERS]: triggers });
  }

  private _handleTriggerDelete(detail: any) {
    if (!this.config?.irrigation_start_triggers || detail.index === undefined)
      return;

    const triggers = [...this.config.irrigation_start_triggers];
    triggers.splice(detail.index, 1);
    this.handleConfigChange({ [CONF_IRRIGATION_START_TRIGGERS]: triggers });
  }

  renderWeatherSkipCard() {
    if (!this.config || !this.data || !this.hass) return html``;

    return html`
      <ha-card header="${localize("weather_skip.title", this.hass.language)}">
        <div class="card-content">
          <div class="zoneline">
            <div style="margin-bottom: 16px;">
              ${localize("weather_skip.description", this.hass.language)}
            </div>

            <div class="switch-container" style="margin-bottom: 16px;">
              <input
                type="radio"
                id="weatherskipon"
                name="skip_irrigation_on_precipitation"
                value="true"
                ?checked="${this.config.skip_irrigation_on_precipitation}"
                @change=${() => {
                  this.handleConfigChange({
                    skip_irrigation_on_precipitation: true,
                  });
                }}
              /><label for="weatherskipon"
                >${localize("common.labels.yes", this.hass.language)}</label
              >
              <input
                type="radio"
                id="weatherskipoff"
                name="skip_irrigation_on_precipitation"
                value="false"
                ?checked="${!this.config.skip_irrigation_on_precipitation}"
                @change=${() => {
                  this.handleConfigChange({
                    skip_irrigation_on_precipitation: false,
                  });
                }}
              /><label for="weatherskipoff"
                >${localize("common.labels.no", this.hass.language)}</label
              >
            </div>

            ${this.config.skip_irrigation_on_precipitation
              ? html`
                  <div class="zoneline">
                    <label for="precipitation_threshold_mm"
                      >${localize(
                        "weather_skip.threshold_label",
                        this.hass.language,
                      )}
                      (${output_unit(
                        this.config,
                        CONF_PRECIPITATION_THRESHOLD_MM,
                      )}):</label
                    >
                    <input
                      id="precipitation_threshold_mm"
                      type="number"
                      class="shortinput"
                      min="0"
                      step="0.1"
                      .value="${this.config.precipitation_threshold_mm}"
                      @input=${(e: Event) => {
                        this.handleConfigChange({
                          precipitation_threshold_mm: parseFloat(
                            (e.target as HTMLInputElement).value,
                          ),
                        });
                      }}
                    />
                  </div>
                `
              : ""}
          </div>
        </div>
      </ha-card>
    `;
  }

  private async saveData(
    changes: Partial<SmartIrrigationConfig>,
  ): Promise<void> {
    if (!this.hass || !this.data) return;

    this.isSaving = true;
    this._scheduleUpdate();

    try {
      // Optimistic update for responsive UI
      this.data = {
        ...this.data,
        ...changes,
      };
      this._scheduleUpdate();

      await saveConfig(this.hass, this.data);
    } catch (error) {
      console.error("Error saving config:", error);
      handleError(
        error,
        this.shadowRoot!.querySelector("ha-card") as HTMLElement,
      );
      // Rollback optimistic update on error
      await this._fetchData();
    } finally {
      this.isSaving = false;
      this._scheduleUpdate();
    }
  }

  private handleConfigChange(changes: Partial<SmartIrrigationConfig>): void {
    // Use debounced save for better performance
    this.debouncedSave(changes);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Clean up debounce timer
    // The debounced function may have pending timeouts, but we can't directly access them
    // Let them complete naturally or be garbage collected
  }

  toggleInformation(item: string) {
    const el = this.shadowRoot?.querySelector("#" + item);

    //const bt = this.shadowRoot?.querySelector("#showcalcresults" + index);
    //if (!el || !bt) {
    if (!el) {
      return;
    } else {
      if (el.className != "hidden") {
        el.className = "hidden";
        //bt.textContent = "Show calculation explanation";
      } else {
        el.className = "information";
        //bt.textContent = "Hide explanation";
      }
    }
  }
  static get styles(): CSSResultGroup {
    return css`
      ${globalStyle} /* View-specific styles only - most common styles are now in globalStyle */

      /* Irrigation triggers styles */
      .triggers-list {
        margin: 16px 0;
      }

      .no-triggers {
        text-align: center;
        padding: 32px 16px;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      .trigger-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        margin: 8px 0;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
      }

      .trigger-item.disabled {
        opacity: 0.6;
      }

      .trigger-main {
        display: flex;
        align-items: center;
        flex: 1;
        gap: 16px;
      }

      .trigger-info {
        flex: 1;
      }

      .trigger-name {
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 4px;
      }

      .trigger-details {
        font-size: 0.875rem;
        color: var(--secondary-text-color);
      }

      .trigger-status {
        font-size: 0.875rem;
        padding: 4px 8px;
        border-radius: 4px;
        background: var(--primary-color);
        color: var(--text-primary-color);
        min-width: 60px;
        text-align: center;
      }

      .trigger-item.disabled .trigger-status {
        background: var(--disabled-text-color);
      }

      .trigger-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .add-trigger-section {
        margin-top: 16px;
        text-align: center;
      }

      .add-trigger-section ha-button {
        --mdc-theme-primary: var(--primary-color);
      }

      .add-trigger-section ha-icon {
        margin-right: 8px;
      }
    `;
  }
}
