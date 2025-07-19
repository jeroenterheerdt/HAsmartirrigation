import { LitElement, html, css, CSSResultGroup } from "lit";
import { property, customElement, state } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { mdiClose } from "@mdi/js";
import { localize } from "../../localize/localize";
import { IrrigationStartTrigger, TriggerType } from "../types";
import {
  TRIGGER_TYPE_SUNRISE,
  TRIGGER_TYPE_SUNSET,
  TRIGGER_TYPE_SOLAR_AZIMUTH,
  TRIGGER_CONF_TYPE,
  TRIGGER_CONF_NAME,
  TRIGGER_CONF_ENABLED,
  TRIGGER_CONF_OFFSET_MINUTES,
  TRIGGER_CONF_AZIMUTH_ANGLE,
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
        this._trigger.azimuth_angle < 0 ||
        this._trigger.azimuth_angle > 360
      ) {
        alert(
          localize(
            "irrigation_start_triggers.validation.azimuth_invalid",
            this.hass.language,
          ),
        );
        return;
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
            <span slot="title">${title}</span>
          </ha-header-bar>
        </div>

        <div class="content">
          <ha-form
            .data=${this._trigger}
            .schema=${this._getFormSchema()}
            .computeLabel=${this._computeLabel}
            @value-changed=${this._valueChanged}
          ></ha-form>
        </div>

        <div slot="primaryAction">
          <ha-button @click=${this._saveTrigger}>
            ${localize(
              "irrigation_start_triggers.dialog.save",
              this.hass.language,
            )}
          </ha-button>
        </div>

        <div slot="secondaryAction">
          <ha-button @click=${this._closeDialog}>
            ${localize(
              "irrigation_start_triggers.dialog.cancel",
              this.hass.language,
            )}
          </ha-button>
          ${!isCreate
            ? html`
                <ha-button @click=${this._deleteTrigger} class="warning">
                  ${localize(
                    "irrigation_start_triggers.dialog.delete",
                    this.hass.language,
                  )}
                </ha-button>
              `
            : ""}
        </div>
      </ha-dialog>
    `;
  }

  private _getFormSchema() {
    const schema = [
      {
        name: TRIGGER_CONF_NAME,
        selector: { text: {} },
      },
      {
        name: TRIGGER_CONF_TYPE,
        selector: {
          select: {
            options: [
              {
                value: TRIGGER_TYPE_SUNRISE,
                label: localize(
                  "irrigation_start_triggers.trigger_types.sunrise",
                  this.hass.language,
                ),
              },
              {
                value: TRIGGER_TYPE_SUNSET,
                label: localize(
                  "irrigation_start_triggers.trigger_types.sunset",
                  this.hass.language,
                ),
              },
              {
                value: TRIGGER_TYPE_SOLAR_AZIMUTH,
                label: localize(
                  "irrigation_start_triggers.trigger_types.solar_azimuth",
                  this.hass.language,
                ),
              },
            ],
          },
        },
      },
      {
        name: TRIGGER_CONF_ENABLED,
        selector: { boolean: {} },
      },
      {
        name: TRIGGER_CONF_OFFSET_MINUTES,
        selector: {
          number: {
            min: -1440, // -24 hours
            max: 1440, // +24 hours
            step: 1,
            mode: "box",
          },
        },
      },
    ];

    // Add azimuth field for solar azimuth triggers
    if (this._trigger?.type === TRIGGER_TYPE_SOLAR_AZIMUTH) {
      schema.push({
        name: TRIGGER_CONF_AZIMUTH_ANGLE,
        selector: {
          number: {
            min: 0,
            max: 360,
            step: 1,
            mode: "box",
          },
        },
      });
    }

    return schema;
  }

  private _computeLabel = (schema: any) => {
    return localize(
      `irrigation_start_triggers.fields.${schema.name}.name`,
      this.hass.language,
    );
  };

  private _valueChanged(event: CustomEvent) {
    const changes = event.detail.value;
    this._updateTrigger(changes);
  }

  static get styles(): CSSResultGroup {
    return css`
      .content {
        padding: 20px;
        max-width: 500px;
      }

      .warning {
        --mdc-theme-primary: var(--error-color);
      }

      ha-form {
        width: 100%;
      }
    `;
  }
}
