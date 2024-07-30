# How it works

![](images/smart_irrigation_diagram.png?raw=true)

1. Snow and rain fall on the ground add moisture. This is tracked/predicted depending on the [operation mode](https://github.com/jeroenterheerdt/HAsmartirrigation#operation-modes) by the `rain` and `snow` attributes Together, this makes up the `precipitation`.

2. Sunshine, temperature, wind speed, place on earth and other factors influence the amount of moisture lost from the ground(`evapotranspiration`). This is tracked/predicted depending on the [operation mode](https://github.com/jeroenterheerdt/HAsmartirrigation#operation-modes).

3. The difference between `precipitation` and `evapotranspiration` is the `netto precipitation`: negative values mean more moisture is lost than gets added by rain/snow, while positive values mean more moisture is added by rain/snow than what evaporates.

4. Once a day (time is configurable) the `netto precipitation` is added/substracted from the `bucket,` which starts as empty. If the `bucket` is below zero, irrigation is required.

5. Irrigation should be run for `sensor.smart_irrigation_[zone_name]`, which is 0 if `bucket`  >=0. Afterwards, the `bucket` needs to be reset (using `reset_bucket`). It's up to the user of the integration to build the automation for this final step. See [Example automation](https://github.com/jeroenterheerdt/HAsmartirrigation#step-4-creating-automations)

There are many more options available, see below. To understand how `precipitation`, `netto precipitation`, the `bucket` and irrigation interact, see [example behavior on the Wiki](https://github.com/jeroenterheerdt/HAsmartirrigation/wiki/Example-behavior-in-a-week).



