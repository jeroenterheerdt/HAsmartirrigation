import { TemplateResult, LitElement, html, CSSResultGroup, css } from "lit";
import { property, customElement } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { loadHaForm } from "../../load-ha-elements";
import { UnsubscribeFunc } from "home-assistant-js-websocket";
import {
  fetchConfig,
  fetchIrrigationInfo,
} from "../../data/websockets";
import { SubscribeMixin } from "../../subscribe-mixin";

import {
  SmartIrrigationConfig,
  SmartIrrigationInfo,
} from "../../types";
import { commonStyle } from "../../styles";
import { localize } from "../../../localize/localize";
import { DOMAIN } from "../../const";
import moment from "moment";

@customElement("smart-irrigation-view-info")
class SmartIrrigationViewInfo extends SubscribeMixin(LitElement) {
  hass?: HomeAssistant;
  @property() config?: SmartIrrigationConfig;

  @property({ type: Object })
  private info?: SmartIrrigationInfo;

  @property({ type: Boolean })
  private isLoading = true;

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

  firstUpdated() {
    loadHaForm().catch((error) => {
      console.error("Failed to load HA form:", error);
    });
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

      // Fetch config and irrigation info concurrently
      const [config, info] = await Promise.all([
        fetchConfig(this.hass),
        fetchIrrigationInfo(this.hass),
      ]);

      this.config = config;
      this.info = info;
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      this.isLoading = false;
      // Trigger a re-render to ensure UI updates
      this._scheduleUpdate();
    }
  }

  render(): TemplateResult {
    if (!this.hass) {
      return html``;
    }

    if (this.isLoading) {
      return html`
        <ha-card header="${localize("panels.info.title", this.hass.language)}">
          <div class="card-content">
            ${localize("common.loading", this.hass.language)}...
          </div>
        </ha-card>
      `;
    }

    if (!this.config) {
      return html`
        <ha-card header="${localize("panels.info.title", this.hass.language)}">
          <div class="card-content">Configuration not available.</div>
        </ha-card>
      `;
    }

    return html`
      <ha-card header="${localize("panels.info.title", this.hass.language)}">
        <div class="card-content">
          ${localize("panels.info.description", this.hass.language)}
        </div>
      </ha-card>
      
      ${this.renderNextIrrigationCard()}
      ${this.renderIrrigationReasonCard()}
    `;
  }

  private renderNextIrrigationCard(): TemplateResult {
    if (!this.hass || !this.info) {
      return html`
        <ha-card header="${localize("panels.info.cards.next-irrigation.title", this.hass?.language ?? "en")}">
          <div class="card-content">
            <div class="info-item">
              <label>${localize("panels.info.cards.next-irrigation.labels.next-start", this.hass?.language ?? "en")}:</label>
              <span class="value">
                ${localize("panels.info.cards.next-irrigation.no-data", this.hass?.language ?? "en")}
              </span>
            </div>
            <div class="info-note">
              ${localize("panels.info.cards.next-irrigation.backend-todo", this.hass?.language ?? "en")}
            </div>
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card header="${localize("panels.info.cards.next-irrigation.title", this.hass.language)}">
        <div class="card-content">
          <div class="info-item">
            <label>${localize("panels.info.cards.next-irrigation.labels.next-start", this.hass.language)}:</label>
            <span class="value">
              ${this.info.next_irrigation_start 
                ? moment(this.info.next_irrigation_start).format("YYYY-MM-DD HH:mm:ss")
                : localize("panels.info.cards.next-irrigation.no-data", this.hass.language)
              }
            </span>
          </div>
          
          ${this.info.next_irrigation_duration 
            ? html`
              <div class="info-item">
                <label>${localize("panels.info.cards.next-irrigation.labels.duration", this.hass.language)}:</label>
                <span class="value">${this.info.next_irrigation_duration} ${localize("common.units.seconds", this.hass.language)}</span>
              </div>
            `
            : ""
          }
          
          ${this.info.next_irrigation_zones && this.info.next_irrigation_zones.length > 0
            ? html`
              <div class="info-item">
                <label>${localize("panels.info.cards.next-irrigation.labels.zones", this.hass.language)}:</label>
                <span class="value">${this.info.next_irrigation_zones.join(", ")}</span>
              </div>
            `
            : ""
          }
        </div>
      </ha-card>
    `;
  }

  private renderIrrigationReasonCard(): TemplateResult {
    if (!this.hass || !this.info) {
      return html`
        <ha-card header="${localize("panels.info.cards.irrigation-reason.title", this.hass?.language ?? "en")}">
          <div class="card-content">
            <div class="info-item">
              <label>${localize("panels.info.cards.irrigation-reason.labels.reason", this.hass?.language ?? "en")}:</label>
              <span class="value">
                ${localize("panels.info.cards.irrigation-reason.no-data", this.hass?.language ?? "en")}
              </span>
            </div>
            <div class="info-note">
              ${localize("panels.info.cards.irrigation-reason.backend-todo", this.hass?.language ?? "en")}
            </div>
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card header="${localize("panels.info.cards.irrigation-reason.title", this.hass.language)}">
        <div class="card-content">
          <div class="info-item">
            <label>${localize("panels.info.cards.irrigation-reason.labels.reason", this.hass.language)}:</label>
            <span class="value">
              ${this.info.irrigation_reason || localize("panels.info.cards.irrigation-reason.no-data", this.hass.language)}
            </span>
          </div>
          
          ${this.info.sunrise_time
            ? html`
              <div class="info-item">
                <label>${localize("panels.info.cards.irrigation-reason.labels.sunrise", this.hass.language)}:</label>
                <span class="value">${moment(this.info.sunrise_time).format("HH:mm:ss")}</span>
              </div>
            `
            : ""
          }
          
          ${this.info.total_irrigation_duration !== undefined
            ? html`
              <div class="info-item">
                <label>${localize("panels.info.cards.irrigation-reason.labels.total-duration", this.hass.language)}:</label>
                <span class="value">${this.info.total_irrigation_duration} ${localize("common.units.seconds", this.hass.language)}</span>
              </div>
            `
            : ""
          }
          
          ${this.info.irrigation_explanation
            ? html`
              <div class="info-item explanation">
                <label>${localize("panels.info.cards.irrigation-reason.labels.explanation", this.hass.language)}:</label>
                <div class="explanation-text">${this.info.irrigation_explanation}</div>
              </div>
            `
            : ""
          }
        </div>
      </ha-card>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      ${commonStyle}
      .info-item {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        align-items: center;
        margin-bottom: 8px;
        padding: 6px 8px;
        border-bottom: 1px solid var(--divider-color);
        font-size: 0.9em;
      }
      
      .info-item label {
        font-weight: 500;
        min-width: 120px;
        color: var(--primary-text-color);
      }
      
      .info-item .value {
        color: var(--secondary-text-color);
        font-family: monospace;
        text-align: right;
        justify-self: end;
      }
      
      .info-item.explanation {
        grid-template-columns: 1fr;
        align-items: flex-start;
      }
      
      .explanation-text {
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 8px;
        font-size: 0.9em;
        line-height: 1.4;
        white-space: pre-wrap;
        margin-top: 4px;
        width: 100%;
        box-sizing: border-box;
      }
      
      .info-note {
        margin-top: 16px;
        padding: 8px;
        background: var(--warning-color);
        color: var(--text-primary-color);
        border-radius: 4px;
        font-size: 0.9em;
        font-style: italic;
      }
    `;
  }
}