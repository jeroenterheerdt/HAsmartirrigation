---
layout: default
title: Configuration: Zones
---
# Zone configuration

> Main page: [Configuration](configuration.md)<br/>
> Previous: [General configuration](configuration-general.md)<br/>
> Next: [Module configuration](configurations-modules.md)

Specify one or more irrigation zones here. The integration calculates irrigation duration per zone, depending on size, throughput, state, module and sensor group. A zone can be:
* **disabled**: The zone is then not calculated and duration will be set to 0.
* **automatic**: The zones duration is automatically calculated.
* **manual**: You can specify the zones duration yourself.

> When entering any values in the configuration of this integration, take notice of the labels provided so you enter values in the correct units.

## Multi-zone support
For irrigation systems that have multiple zones which you want to run in series or independent you need to create multiple zones. The configuration should be done for each zone, including the area the zone covers and the corresponding settings.

## Adding a zone
You need to specify the following to add a zone:

- **Name**: The name of your zone, e.g. 'garden'
- **Size**: The size of this zone (m<sup>2</sup> or sq ft)
- **Throughput**: The flow of this zone (liter/minute or gallon/minute)

After adding a zone, make sure to further configure your new zone.

## Actions on all automatic Zones
You can perform the following actions on all automatic zones: 
- Update automatic zones with weather data from sensors.
- Calculate irrigation duration for automatic zones. This will also delete weather data after calculation.

## Configuring a zone
You can change the following settings on a zone:

- **Name**: change the name of a zone
- **Size**: change the size of a zone
- **Throughput**: change the throughput of a zone
- **State**:
  - _Automatic_: Automatic updating and calculation of that zone. Module and sensor group is mandatory.
  - _Manual_: Only manual updating and calculation of that zone. No module and sensor group is required.
  - _Disabled_: The zone is disabled. No updating and calculation of that zone. Setting a module and sensor group on the zone is optional.
- **Module**: Choose the [calculation module](configuration-modules.md) that should be used to calculate irrigation for the zone.
- **Sensor group**: Choose the [sensor group](configuration-sensor-groups.md) that provides the weather data for this zone.
- **Bucket**: Either calculated or manually set. If `bucket >= 0` then no irrigation is necesarry, if `bucket < 0` irrigation is necessary. See [automations](automations.md) for examples on how to use this value to decide to irrigate.
- **Maximum bucket**: You can manually set a maximum bucket size. The maximum recommended bucket size is based on the type of soil:
    - clay soil: 30 mm (1.18")
    - sandy soil: 12 mm (0.47"). 
This recommendation is based on the soil water holding capacity. See [this discussion for more details](https://github.com/jeroenterheerdt/HAsmartirrigation/discussions/448).

- **Lead time**: Time needed to warm up your irrigation system (in seconds), e.g. time to establish a connection, start a pump, build pressure, etc. After the duration is calculated, the lead time is added but only if the duration is > 0.
- **Maximum duration**: The maximum duration of the irrigation, to avoid flooding, wasting water, etc.
- **Multiplier**: Multiplies / divides the duration of the irrigation. For lawns, it is recommended to set the multiplier depending on your grass type (See [this discussion for more details](https://github.com/jeroenterheerdt/HAsmartirrigation/discussions/448)):
    * Cool-reason grasses (such as fescue, bluegrass) should be set to `0.8`
    * Warm-season grasses (such as bermuda, zoysia) should be set to `0.7`.
    
    
- *Duration*: Irrigation duration in seconds. Either calculated or manually set.

### Buttons per zone

TODO: add image

Below each zone there are some buttons to update with weather data, calculate irrigation duration or to delete that zone. Note that if you calculate irrigation duration using the buttons per zone, the weather data for that zone is deleted. 
After a calculation there is also a button to get some information how duration was calculated, which gives insight into how the bucket was updated, and how the lead time and multiplier influenced the calculated duration.

> Main page: [Configuration](configuration.md)<br/>
> Previous: [General configuration](configuration-general.md)<br/>
> Next: [Modules configuration](configurations-modules.md)