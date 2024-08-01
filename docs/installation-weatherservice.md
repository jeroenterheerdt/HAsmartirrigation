---
layout: default
title: Installation: Configuring weather service
---
# Installation: Configuring weather service

> Main page: [Installation](installation.md)<br/>
> Previous: [Downloading the integration](installation-download.md)<br/>
> Next: []()

TODO

- API Key for Open Weather Map (optional). Only required in mode 1 and 3. See [Getting Open Weather Map API Key](https://github.com/jeroenterheerdt/HAsmartirrigation#getting-open-weather-map-api-key) below for instructions.

If you use a weather service, make sure your home zone coordinates are set correctly so the data is correct. This is especially true if you set the coordinates manually in the configuration.yaml.

## Getting Open Weather Map API Key

Go to [OpenWeatherMap](https://openweathermap.org) and create an account. You can enter any company and purpose while creating an account. After creating your account, You will need to sign up for the paid (but free for limited API calls) OneCall API 3.0 plan if you do not have a key already. Make sure to enter credit card information to get the API truly activated. Then, go to API Keys and get your key. If the key does not work right away, no worries. The email you should have received from OpenWeaterMap says it will be activated 'within the next couple of hours'. So if it does not work right away, be patient a bit. If you are worried about the cost of the API, You can put a rate limit below the paid threshold in the "Billing plans" page of your profile. If you are currently using API 2.5, move to 3.0 ASAP as API 2.5 is going to be closed in June 2024.

## Getting Pirate Weather API key
TODO

Although we recommend using Open Weather by providing an free API key, you _can_ skip it. Skipping it, however, disables any ability to forecast. If it is disabled you need to use another source, such as your own weather station, exclusively. If you turn it off, you will not be able to use forecasts. Provide an OWM API if you intent to use Open Weather Map for at least part of the weather data, including forecasting. If you enable it the API Key for Open Weather MAP can be changed also like the version you want to use (API 2.5 or 3.0).
HACS
Manually...

> Main page: [Installation](installation.md)<br/>
> Previous: [Downloading the integration](installation-download.md)<br/>
> Next: []()
