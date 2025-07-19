import { CSSResultGroup, LitElement, css, html } from "lit";
import { property, customElement } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { UnsubscribeFunc } from "home-assistant-js-websocket";

import { fetchConfig, saveConfig } from "../../data/websockets";
import { SubscribeMixin } from "../../subscribe-mixin";
import { localize } from "../../../localize/localize";
import { pick, handleError, parseBoolean } from "../../helpers";
import { loadHaForm } from "../../load-ha-elements";
import { SmartIrrigationConfig, SmartIrrigationTrigger } from "../../types";
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
  CONF_CALC_TRIGGERS,
  CONF_CLEAR_TIME,
  CONF_CONTINUOUS_UPDATES,
  CONF_SENSOR_DEBOUNCE,
  DOMAIN,
  TRIGGER_AZIMUTH_VALUE,
  TRIGGER_ID,
  TRIGGER_OFFSET_AFTER,
  TRIGGER_OFFSET_BEFORE,
  TRIGGER_TYPE,
  TRIGGER_TYPE_AZIMUTH,
  TRIGGER_TYPE_SUNRISE,
  TRIGGER_TYPE_SUNSET,
  TRIGGER_TYPES,
} from "../../const";
import { mdiInformationOutline } from "@mdi/js";

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
        CONF_CALC_TRIGGERS,
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
          ${this.renderTriggersUI()}
          <div class="card-content">
            <div class="zoneline">
              <label for="calctime"
                >${localize(
                  "panels.general.cards.automatic-duration-calculation.labels.legacy-calc-time",
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
              <small class="legacy-note">
                ${localize(
                  "panels.general.cards.automatic-duration-calculation.labels.legacy-note",
                  this.hass.language,
                )}
              </small>
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

      const r = html`<ha-card
          header="${localize("panels.general.title", this.hass.language)}"
        >
          <div class="card-content">
            ${localize("panels.general.description", this.hass.language)}
          </div> </ha-card
        >${r2}${r1}${r3}${r4}`;

      return r;
    }
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

  private addTrigger(): void {
    if (!this.data) return;
    const triggers = [...(this.data.calctriggers || [])];
    const newTrigger = new SmartIrrigationTrigger(
      `trigger_${Date.now()}`,
      TRIGGER_TYPE_SUNRISE
    );
    triggers.push(newTrigger);
    this.handleConfigChange({ calctriggers: triggers });
  }

  private removeTrigger(index: number): void {
    if (!this.data) return;
    const triggers = [...(this.data.calctriggers || [])];
    triggers.splice(index, 1);
    this.handleConfigChange({ calctriggers: triggers });
  }

  private updateTrigger(index: number, changes: Partial<SmartIrrigationTrigger>): void {
    if (!this.data) return;
    const triggers = [...(this.data.calctriggers || [])];
    triggers[index] = { ...triggers[index], ...changes };
    this.handleConfigChange({ calctriggers: triggers });
  }

  private renderTriggersUI() {
    if (!this.hass || !this.data) return html``;
    const triggers = this.data.calctriggers || [];
    
    return html`
      <div class="card-content">
        <h3>${localize("panels.general.cards.automatic-duration-calculation.labels.calculation-triggers", this.hass.language)}</h3>
      </div>
      ${triggers.map((trigger, index) => this.renderSingleTrigger(trigger, index))}
      <div class="card-content">
        <div class="zoneline">
          <button 
            @click=${this.addTrigger}
            class="add-trigger-button"
          >
            ${localize("panels.general.cards.automatic-duration-calculation.labels.add-trigger", this.hass.language)}
          </button>
        </div>
      </div>
    `;
  }

  private renderSingleTrigger(trigger: SmartIrrigationTrigger, index: number) {
    if (!this.hass) return html``;
    return html`
      <div class="card-content trigger-item">
        <div class="trigger-header">
          <span>${localize("panels.general.cards.automatic-duration-calculation.labels.trigger", this.hass.language)} ${index + 1}</span>
          <button 
            @click=${() => this.removeTrigger(index)}
            class="remove-trigger-button"
          >
            ${localize("panels.general.cards.automatic-duration-calculation.labels.remove", this.hass.language)}
          </button>
        </div>
        
        <div class="zoneline">
          <label for="trigger-type-${index}">
            ${localize("panels.general.cards.automatic-duration-calculation.labels.trigger-type", this.hass.language)}:
          </label>
          <select 
            id="trigger-type-${index}"
            .value=${trigger.type}
            @change=${(e: Event) => {
              this.updateTrigger(index, { type: (e.target as HTMLSelectElement).value });
            }}
          >
            <option value="${TRIGGER_TYPE_SUNRISE}" ?selected=${trigger.type === TRIGGER_TYPE_SUNRISE}>
              ${localize("panels.general.cards.automatic-duration-calculation.options.sunrise", this.hass.language)}
            </option>
            <option value="${TRIGGER_TYPE_SUNSET}" ?selected=${trigger.type === TRIGGER_TYPE_SUNSET}>
              ${localize("panels.general.cards.automatic-duration-calculation.options.sunset", this.hass.language)}
            </option>
            <option value="${TRIGGER_TYPE_AZIMUTH}" ?selected=${trigger.type === TRIGGER_TYPE_AZIMUTH}>
              ${localize("panels.general.cards.automatic-duration-calculation.options.azimuth", this.hass.language)}
            </option>
          </select>
        </div>

        ${trigger.type === TRIGGER_TYPE_AZIMUTH ? html`
          <div class="zoneline">
            <label for="trigger-azimuth-${index}">
              ${localize("panels.general.cards.automatic-duration-calculation.labels.azimuth-value", this.hass.language)}:
            </label>
            <input
              id="trigger-azimuth-${index}"
              type="number"
              min="0"
              max="360"
              class="shortinput"
              .value=${trigger.azimuth_value}
              @input=${(e: Event) => {
                this.updateTrigger(index, { azimuth_value: parseFloat((e.target as HTMLInputElement).value) });
              }}
            />
            <span class="unit">°</span>
          </div>
        ` : ''}

        <div class="zoneline">
          <label for="trigger-offset-before-${index}">
            ${localize("panels.general.cards.automatic-duration-calculation.labels.offset-before", this.hass.language)}:
          </label>
          <input
            id="trigger-offset-before-${index}"
            type="number"
            min="0"
            class="shortinput"
            .value=${trigger.offset_before}
            @input=${(e: Event) => {
              this.updateTrigger(index, { offset_before: parseInt((e.target as HTMLInputElement).value) });
            }}
          />
          <span class="unit">${localize("panels.general.cards.automatic-duration-calculation.labels.minutes", this.hass.language)}</span>
        </div>

        <div class="zoneline">
          <label for="trigger-offset-after-${index}">
            ${localize("panels.general.cards.automatic-duration-calculation.labels.offset-after", this.hass.language)}:
          </label>
          <input
            id="trigger-offset-after-${index}"
            type="number"
            min="0"
            class="shortinput"
            .value=${trigger.offset_after}
            @input=${(e: Event) => {
              this.updateTrigger(index, { offset_after: parseInt((e.target as HTMLInputElement).value) });
            }}
          />
          <span class="unit">${localize("panels.general.cards.automatic-duration-calculation.labels.minutes", this.hass.language)}</span>
        </div>
      </div>
    `;
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
      ${globalStyle}/* View-specific styles only - most common styles are now in globalStyle */
      
      .trigger-item {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        margin: 8px 0;
        padding: 16px;
        background: var(--card-background-color);
      }
      
      .trigger-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        font-weight: bold;
      }
      
      .add-trigger-button, .remove-trigger-button {
        background: var(--primary-color);
        color: var(--text-primary-color);
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
        font-size: 14px;
      }
      
      .remove-trigger-button {
        background: var(--error-color);
      }
      
      .add-trigger-button:hover, .remove-trigger-button:hover {
        opacity: 0.8;
      }
      
      .unit {
        margin-left: 8px;
        color: var(--secondary-text-color);
      }
      
      .legacy-note {
        display: block;
        color: var(--secondary-text-color);
        font-style: italic;
        margin-top: 4px;
      }
    `;
  }
}
