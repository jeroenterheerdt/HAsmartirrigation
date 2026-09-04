---
layout: default
title: Usage: Events
---

# Events

> Main page: [Usage](usage.md)<br/>
> Previous: [Services](usage-services.md)<br/>
> Next: [Automations](usage-automations.md)

After installation, the following event is available:

| Event | Description|
| --- | --- |
|`smart_irrigation_start_irrigation_all_zones`|Fired when an [irrigation start trigger](configuration-general.md) is reached. Listen to it to start your irrigation. See [automations](usage-automations.md) for examples.|

## When does it fire?

The event fires when a configured **start trigger** is reached: a solar event (sunrise, sunset or solar azimuth), optionally shifted by an offset, or a fixed clock time. A fixed time suits irrigation that has to be done by a certain hour whatever the season, rather than following the sun. If you configure no triggers, the legacy default applies: it fires early enough before sunrise that watering finishes at sunrise (`sunrise - sum(duration of all enabled zones)`).

With **account for duration** on, a trigger works back from its moment so watering *finishes* then; with it off, watering *starts* then. That applies to a fixed time as well: set 06:30 with it on and an hour-long run starts at 05:30.

Each enabled trigger fires **independently**. The precipitation-skip and "days between irrigation" settings still apply: on a skip day no event is fired.

## Event data

The event carries the identity of the trigger that fired, so a single automation can react differently per trigger:

| field | meaning |
| --- | --- |
| `trigger_name` | the name you gave the trigger |
| `trigger_type` | `sunrise`, `sunset`, `solar_azimuth` or `time` |
| `at` | for a `time` trigger, the clock time it is set to |
| `offset_minutes` | the configured offset, in minutes |
| `account_for_duration` | whether timing is shifted so watering finishes at the target moment |

Example: filter on `trigger_name` to react to a specific trigger.

```yaml
trigger:
  - platform: event
    event_type: smart_irrigation_start_irrigation_all_zones
    event_data:
      trigger_name: "Morning"
```

> Main page: [Usage](usage.md)<br/>
> Previous: [Services](usage-services.md)<br/>
> Next: [Automations](usage-automations.md)