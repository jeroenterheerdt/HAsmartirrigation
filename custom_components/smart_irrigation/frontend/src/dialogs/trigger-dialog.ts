import { LitElement, html, css, CSSResultGroup } from "lit";
import { property, customElement, state } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { mdiClose } from "@mdi/js";
import { localize } from "../../localize/localize";
import { IrrigationStartTrigger, TriggerType } from "../types";
import { dialogStyle } from "../styles/global-style";
import {
  TRIGGER_TYPE_SUNRISE,
  TRIGGER_TYPE_SUNSET,
  TRIGGER_TYPE_SOLAR_AZIMUTH,
  TRIGGER_CONF_TYPE,
  TRIGGER_CONF_NAME,
  TRIGGER_CONF_ENABLED,
  TRIGGER_CONF_OFFSET_MINUTES,
  TRIGGER_CONF_AZIMUTH_ANGLE,
  TRIGGER_CONF_ACCOUNT_FOR_DURATION,
} from "../const";

export interface TriggerDialogParams {
  trigger?: IrrigationStartTrigger;
  createTrigger?: boolean;
  triggerIndex?: number;
}

@customElement("trigger-dialog")
export class TriggerDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _params?: TriggerDialogParams;
  @state() private _trigger?: IrrigationStartTrigger;

  public async showDialog(params: TriggerDialogParams): Promise<void> {
    this._params = params;

    // Initialize trigger data
    if (params.createTrigger) {
      this._trigger = {
        type: TRIGGER_TYPE_SUNRISE,
        name: "",
        enabled: true,
        offset_minutes: 0,
        azimuth_angle: 90,
        account_for_duration: true,
      };
    } else if (params.trigger) {
      this._trigger = { ...params.trigger };
    }

    await this.updateComplete;
  }

  private _closeDialog() {
    this._params = undefined;
    this._trigger = undefined;
  }

  private _saveTrigger() {
    if (!this._trigger || !this._params) return;

    // Validate trigger data
    if (!this._trigger.name?.trim()) {
      alert(
        localize(
          "irrigation_start_triggers.validation.name_required",
          this.hass.language,
        ),
      );
      return;
    }

    if (this._trigger.type === TRIGGER_TYPE_SOLAR_AZIMUTH) {
      if (
        this._trigger.azimuth_angle === undefined ||
        isNaN(this._trigger.azimuth_angle)
      ) {
        alert(
          localize(
            "irrigation_start_triggers.validation.azimuth_invalid",
            this.hass.language,
          ),
        );
        return;
      }
      // Normalize azimuth angle to 0-360 range for display purposes
      this._trigger.azimuth_angle = this._trigger.azimuth_angle % 360;
      if (this._trigger.azimuth_angle < 0) {
        this._trigger.azimuth_angle += 360;
      }
    }

    // Dispatch save event
    this.dispatchEvent(
      new CustomEvent("trigger-save", {
        detail: {
          trigger: this._trigger,
          isNew: this._params.createTrigger,
          index: this._params.triggerIndex,
        },
      }),
    );

    this._closeDialog();
  }

  private _deleteTrigger() {
    if (!this._params || this._params.createTrigger) return;

    // Dispatch delete event
    this.dispatchEvent(
      new CustomEvent("trigger-delete", {
        detail: {
          index: this._params.triggerIndex,
        },
      }),
    );

    this._closeDialog();
  }

  private _updateTrigger(changes: Partial<IrrigationStartTrigger>) {
    if (!this._trigger) return;
    this._trigger = { ...this._trigger, ...changes };
    this.requestUpdate();
  }

  render() {
    if (!this._params || !this._trigger) return html``;

    const isCreate = this._params.createTrigger;
    const title = isCreate
      ? localize(
          "irrigation_start_triggers.dialog.add_title",
          this.hass.language,
        )
      : localize(
          "irrigation_start_triggers.dialog.edit_title",
          this.hass.language,
        );

    return html`
      <ha-dialog
        open
        .heading=${true}
        @closed=${this._closeDialog}
        @close-dialog=${this._closeDialog}
      >
        <div slot="heading">
          <ha-header-bar>
            <ha-icon-button
              slot="navigationIcon"
              dialogAction="cancel"
              .path=${mdiClose}
            ></ha-icon-button>
            <span class="dialog-header" slot="title">${title}</span>
          </ha-header-bar>
        </div>

        <div class="wrapper">
          <div class="form-group">
            <ha-textfield
              .label=${localize(
                "irrigation_start_triggers.fields.name.name",
                this.hass.language,
              )}
              .value=${this._trigger.name || ""}
              @input=${this._nameChanged}
              required
            ></ha-textfield>
          </div>

          <div class="form-group">
            <ha-select
              .label=${localize(
                "irrigation_start_triggers.fields.type.name",
                this.hass.language,
              )}
              .value=${this._trigger.type}
              @selected=${this._typeChanged}
            >
              <mwc-list-item value=${TRIGGER_TYPE_SUNRISE}>
                ${localize(
                  "irrigation_start_triggers.trigger_types.sunrise",
                  this.hass.language,
                )}
              </mwc-list-item>
              <mwc-list-item value=${TRIGGER_TYPE_SUNSET}>
                ${localize(
                  "irrigation_start_triggers.trigger_types.sunset",
                  this.hass.language,
                )}
              </mwc-list-item>
              <mwc-list-item value=${TRIGGER_TYPE_SOLAR_AZIMUTH}>
                ${localize(
                  "irrigation_start_triggers.trigger_types.solar_azimuth",
                  this.hass.language,
                )}
              </mwc-list-item>
            </ha-select>
          </div>

          <div class="form-group">
            <ha-formfield
              .label=${localize(
                "irrigation_start_triggers.fields.enabled.name",
                this.hass.language,
              )}
            >
              <ha-switch
                .checked=${this._trigger.enabled}
                @change=${this._enabledChanged}
              ></ha-switch>
            </ha-formfield>
          </div>

          <div class="form-group">
            <ha-textfield
              type="number"
              .label=${localize(
                "irrigation_start_triggers.fields.offset_minutes.name",
                this.hass.language,
              )}
              .value=${this._trigger.offset_minutes?.toString() || "0"}
              min="-1440"
              max="1440"
              step="1"
              suffix="min"
              @input=${this._offsetChanged}
            ></ha-textfield>
          </div>

          <div class="form-group">
            <ha-formfield
              .label=${localize(
                "irrigation_start_triggers.fields.account_for_duration.name",
                this.hass.language,
              )}
            >
              <ha-switch
                .checked=${this._trigger.account_for_duration}
                @change=${this._accountForDurationChanged}
              ></ha-switch>
            </ha-formfield>
          </div>

          ${this._trigger.type === TRIGGER_TYPE_SOLAR_AZIMUTH
            ? html`
                <div class="form-group">
                  <ha-textfield
                    type="number"
                    .label=${localize(
                      "irrigation_start_triggers.fields.azimuth_angle.name",
                      this.hass.language,
                    )}
                    .value=${this._trigger.azimuth_angle?.toString() || "90"}
                    min="0"
                    max="359"
                    step="1"
                    suffix="°"
                    @input=${this._azimuthChanged}
                  ></ha-textfield>
                </div>
              `
            : ""}
        </div>

        <div slot="primaryAction">
          <mwc-button @click=${this._saveTrigger}>
            ${localize(
              "irrigation_start_triggers.dialog.save",
              this.hass.language,
            )}
          </mwc-button>
        </div>

        <div slot="secondaryAction">
          <mwc-button @click=${this._closeDialog}>
            ${localize(
              "irrigation_start_triggers.dialog.cancel",
              this.hass.language,
            )}
          </mwc-button>
          ${!isCreate
            ? html`
                <mwc-button @click=${this._deleteTrigger} class="warning">
                  ${localize(
                    "irrigation_start_triggers.dialog.delete",
                    this.hass.language,
                  )}
                </mwc-button>
              `
            : ""}
        </div>
      </ha-dialog>
    `;
  }

  private _nameChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    this._updateTrigger({ name: target.value });
  }

  private _typeChanged(event: CustomEvent) {
    this._updateTrigger({ type: event.detail.value as TriggerType });
  }

  private _enabledChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    this._updateTrigger({ enabled: target.checked });
  }

  private _offsetChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    this._updateTrigger({ offset_minutes: parseInt(target.value) || 0 });
  }

  private _accountForDurationChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    this._updateTrigger({ account_for_duration: target.checked });
  }

  private _azimuthChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    this._updateTrigger({ azimuth_angle: parseInt(target.value) || 90 });
  }

  static get styles(): CSSResultGroup {
    return [
      dialogStyle,
      css`
        .wrapper {
          color: var(--primary-text-color);
        }

        .warning {
          --mdc-theme-primary: var(--error-color);
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        ha-textfield,
        ha-select {
          width: 100%;
        }

        ha-formfield {
          width: 100%;
        }
      `,
    ];
  }
}
