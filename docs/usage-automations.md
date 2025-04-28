---
layout: default
title: Usage: Entities
---
# Automations

> Main page: [Usage](usage.md)<br/>
> Previous: [Events](usage-events.md)<br/>
> Next: [Troubleshooting](usage-troubleshooting.md)

Since this integration does not interface with your irrigation system directly, you will need to use the data it outputs to create an automation that will start and stop your irrigation system for you. This way you can use this custom integration with any irrigation system you might have, regardless of how that interfaces with Home Assistant. In order for this to work correctly, you should base your automation on the value of `sensor.smart_irrigation_[zone_name]` as long as you run your automation after it was updated (e.g. 11:00 PM/23:00 hours local time). If that value is above `0` it is time to irrigate. Note that the value is the run time in seconds. Also, after irrigation, you need to call the `smart_irrigation.reset_bucket` service to reset the net irrigation tracking (`bucket`) to 0.

> **The last step in any automation is very important, since you will need to let the integration know you have finished irrigating and the evaporation counter can be reset by calling the `smart_irrigation.reset_bucket` service**

Experts say you should water deeply but infrequently to avoid overwatering and encourage deep rooting. It might be a good idea to create an automation that starts early enough to finish before sunrise (using the [`smart_irrigation_start_irrigation_all_zones` event](usage-events.md)) and only once per week if duration is `0` or whenever the `bucket < -25 mm`. Adjust to your specific needs.

The examples on this page don't use a timer - see [this discussion](https://github.com/jeroenterheerdt/HAsmartirrigation/discussions/361) for an example of using a timer for extra safety.

Also, check out the [blueprints we provide](https://github.com/jeroenterheerdt/HAsmartirrigation/tree/master/blueprints).

### Example 1: one valve, once per week irrigation if duration < 0 or if the bucket < - 25 mm:

This example automation runs daily and checks `sensor.smart_irrigation_[zone_name]`. It checks if the `buckets` is `< -25mm (~1")` or if's a monday and duration is above `0`. This follows the expert recommendation mentioned above.
<!-- raw -->
```yaml
description: ""
mode: single
trigger:
  - platform: numeric_state
    entity_id:
      - sensor.smart_irrigation_[zone_name]
    attribute: bucket
    below: -25
  - platform: time
    at: "05:00:00"
condition:
  - condition: or
    conditions:
      - condition: numeric_state
        entity_id: sensor.smart_irrigation_[zone_name]
        below: "-25"
        attribute: bucket
      - condition: and
        conditions:
          - condition: numeric_state
            entity_id: sensor.smart_irrigation_[zone_name]
            above: 0
          - condition: template
            value_template: "{{ now().isoweekday() == 1 }}"
action:
  - service: switch.turn_on
      data: {}
      entity_id: switch.irrigation_tap1
  - delay:
    seconds: '{{states("sensor.[zone_name"])}}'
  - service: switch.turn_off
    data: {}
    entity_id: switch.irrigation_tap1
  - service: smart_irrigation.reset_bucket
    data: {}
    entity_id: sensor.smart_irrigation_[zone_name]
```
<!-- endraw -->
### Example 2: one valve, potentially daily irrigation

Here is an example automation that runs when the `smart_irrigation_start_irrigation_all_zones` event is fired. It checks if `sensor.smart_irrigation_[zone_name]` is above 0 and if it is it turns on `switch.irrigation_tap1`, waits the number of seconds as indicated by `sensor.smart_irrigation_[zone_name]` and then turns off `switch.irrigation_tap1`. Finally, it resets the bucket by calling the `smart_irrigation.reset_bucket` service. If you have multiple instances you will need to adjust the event, entities and service names accordingly.

```yaml
- alias: Smart Irrigation
  description: 'Start Smart Irrigation based on event and run it only if the `sensor.smart_irrigation_[zone_name]` is >0 and run it for precisely that many seconds'
trigger:
  - platform: event
    event_type: smart_irrigation_start_irrigation_all_zones
condition:
  - condition: numeric_state
    entity_id: sensor.smart_irrigation_[zone_name]
    above: 0
action:
  - service: switch.turn_on
    data: {}
    entity_id: switch.irrigation_tap1
  - delay:
      seconds: '{{states("sensor.[zone_name"])}}'
  - service: switch.turn_off
    data: {}
    entity_id: switch.irrigation_tap1
  - service: smart_irrigation.reset_bucket
    data: {}
    entity_id: sensor.smart_irrigation_[zone_name]
```

## Example 3: one valve, irrigation depending on work day sensor
Here is an example automation that runs at 5 AM local time, but only on set days of the week indicated by `binary_sensor.workday_sensor`). As above, it checks if `sensor.smart_irrigation_[zone_name]` is above 0 and if it is it turns on `switch.irrigation_tap1`, waits the number of seconds as indicated by `sensor.smart_irrigation_[zone_name]` and then turns off `switch.irrigation_tap1`. Finally, it resets the bucket by calling the `smart_irrigation.reset_bucket` service.
This automation depends on the [workday binary sensor](https://www.home-assistant.io/integrations/workday/) which you will have to set up separately. Alternatively you could use a condition such as:
```
condition:
  condition: time
  weekday:
  - mon
  - thu
```


```
- alias: Smart Irrigation
  description: 'Start Smart Irrigation at 05:00 when the workday sensor is on and run it only if the adjusted_run_time is >0 and run it for precisely that many seconds'
  trigger:
  - at: 05:00
    platform: time
  condition:
    condition: and
    conditions:
    - condition: state
      entity_id: 'binary_sensor.workday_sensor'
      state: 'on'
    - above: '0'
      condition: numeric_state
      entity_id: sensor.smart_irrigation_[zone_name]
  action:
  - data: {}
    entity_id: switch.irrigation_tap1
    service: switch.turn_on
  - delay:
      seconds: '{{states("sensor.smart_irrigation_[zone_name]")}}'
  - data: {}
    entity_id: switch.irrigation_tap1
    service: switch.turn_off
  - data: {}
    service: smart_irrigation.reset_bucket
    target:
      entity_id: sensor.smart_irrigation_[zone_name]
```

### Example 4: two valves, irrigation depending on work day sensor
Here is an example automation that runs at 4 AM local time, but only on set days of the week indicated by `binary_sensor.workday_sensor`). As above, it checks if `sensor.smart_irrigation_[zone_name]` is above 0 and if it is it turns on `switch.irrigation_tap1`, waits the number of seconds as indicated by `sensor.smart_irrigation_[zone_name]` and then turns off `switch.irrigation_tap1`. Then it turns on `switch.irrigation_tap2`, waits the number of seconds as indicated by `sensor.smart_irrigation_[zone_name]` and then turns off `switch.irrigation_tap2`. Finally, it resets the bucket by calling the `smart_irrigation.reset_bucket` service.
This automation depends on the [workday binary sensor](https://www.home-assistant.io/integrations/workday/) which you will have to set up separately. Alternatively you could use a condition such as:
```
condition:
  condition: time
  weekday:
  - mon
  - thu
```


```
- alias: Smart Irrigation
  description: 'Start Smart Irrigation at 04:00 when the workday sensor is on and run it only if the adjusted_run_time is >0 and run it for precisely that many seconds'
  trigger:
  - at: 04:00
    platform: time
  condition:
    condition: and
    conditions:
    - condition: state
      entity_id: 'binary_sensor.workday_sensor'
      state: 'on'
    - above: '0'
      condition: numeric_state
      entity_id: sensor.smart_irrigation_[zone_name]
  action:
  - data: {}
    entity_id: switch.irrigation_tap1
    service: switch.turn_on
  - delay:
      seconds: '{{states("sensor.smart_irrigation_[zone_name]")}}'
  - data: {}
    entity_id: switch.irrigation_tap1
    service: switch.turn_off
  - data: {}
    entity_id: switch.irrigation_tap2
    service: switch.turn_on
  - delay:
      seconds: '{{states("sensor.smart_irrigation_[zone_name]")}}'
  - data: {}
    entity_id: switch.irrigation_tap2
    service: switch.turn_off
  - data: {}
    service: smart_irrigation.reset_bucket
    target:
      entity_id: sensor.smart_irrigation_[zone_name]
```

## Example 5: Advanced multi-tap example
This example handles multiple taps for a six-zone system controlled by [ESPHome](https://esphome.io/components/sprinkler.html). This is the automation the creator of this integration uses themselves (ignoring the expert advice above...).

```yaml
alias: Smart Irrigation
trigger:
  - platform: event
    event_type: smart_irrigation_start_irrigation_all_zones
  - platform: sun
    event: sunrise
    offset: "01:00:00"
    enabled: true
  - platform: time
    at: "00:00:00"
    id: midnight
    enabled: true
  - platform: time
    at: "18:00:00"
    enabled: false
condition:
  - condition: state
    entity_id: input_boolean.irrigation_enabled
    state: "on"
action:
  - if:
      - condition: trigger
        id:
          - midnight
    then:
      - service: input_boolean.turn_off
        data: {}
        target:
          entity_id: input_boolean.irrigation_automation_ran_today
    else:
      - if:
          - condition: state
            entity_id: input_boolean.irrigation_automation_ran_today
            state: "off"
        then:
          - if:
              - condition: template
                value_template: >-
                  {{states('input_number.number_of_days_since_last_irrigation')<states('input_number.irrigate_every')}}
            then:
              - service: input_number.increment
                data: {}
                target:
                  entity_id: input_number.number_of_days_since_last_irrigation
            else:
              - service: input_number.set_value
                target:
                  entity_id: input_number.smart_irrigation_number_of_zones_enabled
                data:
                  value: 0
              - repeat:
                  for_each:
                    - sensor: sensor.smart_irrigation_lawn_main_deck
                      vid: 0
                      zid: 1
                    - sensor: sensor.smart_irrigation_lawn_tree
                      vid: 1
                      zid: 2
                    - sensor: sensor.smart_irrigation_lawn_office
                      vid: 2
                      zid: 3
                    - sensor: sensor.smart_irrigation_herbs
                      vid: 3
                      zid: 4
                    - sensor: sensor.smart_irrigation_greenhouse
                      vid: 4
                      zid: 5
                    - sensor: sensor.smart_irrigation_side_house
                      vid: 5
                      zid: 6
                  sequence:
                    - if:
                        - condition: template
                          value_template: >-
                            {{state_attr(repeat.item.sensor,'State')=='disabled'
                            or states(repeat.item.sensor)|int(default=0)==0}}
                      then:
                        - service: switch.turn_off
                          target:
                            entity_id: >-
                              {{'switch.sprinklercontroller_enable_zone_'+repeat.item.zid|string()}}
                          data: {}
                      else:
                        - service: switch.turn_on
                          target:
                            entity_id: >-
                              {{'switch.sprinklercontroller_enable_zone_'+repeat.item.zid|string()}}
                          data: {}
                        - service: input_number.increment
                          target:
                            entity_id: >-
                              input_number.smart_irrigation_number_of_zones_enabled
                          data: {}
                        - service: esphome.sprinklercontroller_set_valve_run_duration
                          data:
                            duration: "{{states(repeat.item.sensor)|int(default=0)}}"
                            valve: "{{repeat.item.vid}}"
              - if:
                  - condition: template
                    value_template: >-
                      {{states('input_number.smart_irrigation_number_of_zones_enabled')|int(default=0)>0}}
                then:
                  - alias: >-
                      Run zone 0 for a couple seconds to build up pressure
                      before starting full cycle
                    service: esphome.sprinklercontroller_start_single_valve
                    metadata: {}
                    data:
                      valve: 0
                      duration: 30
                    enabled: true
                  - delay:
                      hours: 0
                      minutes: 1
                      seconds: 0
                      milliseconds: 0
                    enabled: true
                  - service: switch.turn_on
                    metadata: {}
                    data: {}
                    target:
                      entity_id: switch.sprinklercontroller_sprinklers_auto_advance
                    enabled: true
                  - service: esphome.sprinklercontroller_start_full_cycle
                    data: {}
                    enabled: true
                  - service: notify.mobile_app_xyz
                    data:
                      message: Irrigation started!
                      title: Smart Irrigation
                  - repeat:
                      for_each:
                        - sensor: sensor.smart_irrigation_lawn_main_deck
                          vid: 0
                          zid: 1
                        - sensor: sensor.smart_irrigation_lawn_tree
                          vid: 1
                          zid: 2
                        - sensor: sensor.smart_irrigation_lawn_office
                          vid: 2
                          zid: 3
                        - sensor: sensor.smart_irrigation_herbs
                          vid: 3
                          zid: 4
                        - sensor: sensor.smart_irrigation_greenhouse
                          vid: 4
                          zid: 5
                        - sensor: sensor.smart_irrigation_side_house
                          vid: 5
                          zid: 6
                      sequence:
                        - if:
                            - condition: template
                              value_template: >-
                                {{states('switch.sprinklercontroller_enable_zone_'+repeat.item.zid|string()
                                == 'on')}}
                          then:
                            - service: smart_irrigation.reset_bucket
                              target:
                                entity_id: "{{repeat.item.sensor}}"
                              data: {}
                  - service: smart_irrigation.reset_all_buckets
                    data: {}
                    enabled: false
                  - service: input_number.set_value
                    data:
                      value: 0
                    target:
                      entity_id: input_number.number_of_days_since_last_irrigation
          - service: input_boolean.turn_on
            data: {}
            target:
              entity_id: input_boolean.irrigation_automation_ran_today
mode: single

```
> Main page: [Usage](usage.md)<br/>
> Previous: [Events](usage-events.md)<br/>
> Next: [Troubleshooting](usage-troubleshooting.md)
