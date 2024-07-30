---
layout: default
title: Introduction
navigation_weight: 2
---
# Smart Irrigation

Ever wondered if you're watering your lawn/garden/greenhouse/plants/crops too much or too little?
Are you fed up with the guesswork? Did you just set the timer on your sprinklers to 15 minutes?
Do you have a watering system that you can control through Home Assistant (turn on / turn off)?

If so, this integration is for you!

This integration calculates the time to run your irrigation system to compensate for moisture loss by [evapotranspiration](https://en.wikipedia.org/wiki/Evapotranspiration). Using this integration you water your garden, lawn or crops precisely enough to compensate what has evaporated. It takes into account precipitation (rain, snow) and moisture loss caused by evapotranspiration and adjusts accordingly.
If it rains or snows less than the amount of moisture lost, then irrigation is required. Otherwise, no irrigation is required.
The integration can take into account weather forecasts for the coming days and also keeps track of the total moisture lost or added ('bucket').
Multiple zones are supported with each zone having it own configuration and set up.

**Sounds good? let's get started with [installation](installation.md)**.

Prefer to learn more first? Read [how it works](how-it-works.md) or watch [our official tutorial videos on Youtube (English)](https://youtube.com/playlist?list=PLUHIAUPJHMiakbda92--fgb6A0hFReAo7&si=82Xc6mHoLDwFBfCP) and [community-created tutorial in German](https://youtu.be/1AYLuIs7_Pw).
