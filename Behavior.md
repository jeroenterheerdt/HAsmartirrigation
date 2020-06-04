This page provides insight into how this component should behave in certain weather conditions. With this you should be able to do a sanity check against your configuration and make sure everything is working correctly.

The scenario is as follows - we will look at several days, the precipitation and evapotranspiration for those days, the effects on the various calculations that this component makes and whether or not irrigation should be triggered. Note the values for precipitation and evapotranspiration are made up and are not representative of any real-life situation.

## Initialization
Initially, the `bucket=0`, so the `daily adjusted run time (ART)=0` as well.

|Day|Weather type|Precipitation|Evapotranspiration|Netto Precipitation (=`precipitation` - `evapotranspiration`)|Bucket during the day|Daily Adjusted Run Time during the day|Bucket after update (11 PM by default) (=`bucket` during the day + `netto precipitation`|Daily Adjusted Run Time after update (11 PM by default)|Irrigation required|
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|1|![Partly Cloudy](https://github.com/jeroenterheerdt/HAsmartirrigation/blob/master/images/partlycloudy.png)|`0.5`|`0.1`|`0.5 - 0.1 = 0.4`|`0`|`0`|`0 + 0.4 = 0.4`|`0`|No|
|2|![Sunny](https://github.com/jeroenterheerdt/HAsmartirrigation/blob/master/images/sunny.png)|`0`|`0.6`|`0 - 0.6 = -0.6`|`0.40`|`0`|`0.4 + -0.6 =- 0.2`|`180` seconds (3 minutes)|Yes - bucket should be reset afterwards|
|3|![Rainy](https://github.com/jeroenterheerdt/HAsmartirrigation/blob/master/images/rainy.png)|`1`|`0.2`|`1 - 0.2 = 0.8`|`0` (reset after irrigation the day before)|`0`|`0 + 0.8 = 0.8`|`0`|No|
|4|![Partly Cloudy](https://github.com/jeroenterheerdt/HAsmartirrigation/blob/master/images/partlycloudy.png)|`0.2`|`0.4`|`0.2 - 0.4= -0.2`|`0.8`|`0`|`-0.8 + -0.2 = 0.6`|`0`|No|
|5|![Sunny](https://github.com/jeroenterheerdt/HAsmartirrigation/blob/master/images/sunny.png)|`0`|`1.5`|`0 - 1.5 = -1.5`|`0.6`|`0`|`0.6 + -1.5 = -0.9`|`600` seconds (10 minutes)|Yes - bucket should be reset afterwards|
|6|![Sunny](https://github.com/jeroenterheerdt/HAsmartirrigation/blob/master/images/sunny.png)|`0`|`0.4`|`0 - 0.4 = -0.4`|`0` (reset after irrigation the day before)|`0`|`0 + -0.4 = -0.4`|`300` seconds (5 minutes)|Yes - bucket should be reset afterwards|
|7|![Partly Cloudy](https://github.com/jeroenterheerdt/HAsmartirrigation/blob/master/images/partlycloudy.png)|`0.5`|`0.2`|`0.5 - 0.2 = 0.3`|`0` (reset after irrigation the day before)|`0`|`0 + 0.3 = 0.3`|`0`|No|
