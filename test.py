#test.py [apikey for OWM] [Latitude] [Longitude]

import sys
import requests
import json
import pyeto
import datetime

APIKEY = ""
LAT = 0
LON = 0
ELEVATION = 0


class Smart_Irrigation_Test():

    def __init__(self):
        self.rain = 0.0  # mm
        self.rain_today = 0.0  # mm
        self.fao56 = 0.0  # mm / hour

    def get_data(self):
        url = OWM_URL.format(LAT, LON, APIKEY)
        d = None
        try:
            r = requests.get(url)
            d = json.loads(r.text)
            print("WB_IR get_data read {}".format(d))
            if d['cod'] != 200:
                print("Invalid response from Open Weather Map {}".format(d))
                return
        except Exception as e:
            print("Failed to get OWM URL {}".format(r.text))
            pass
        return d

    def rain_desc_to_mm(self, code):
        CONVERT = {500: 1.0,
                   501: 2.0,
                   502: 5.0,
                   503: 20.0,
                   504: 60.0,
                   511: 5.0,
                   520: 5.0,
                   521: 5.0,
                   522: 20.0,
                   531: 50.0}
        if code in CONVERT:
            return CONVERT[code]
        else:
            print("RAIN_DESC_TO_MM: Can't find any key in {} to map to,\
                   returning 10mm".format(code))
            return 10.0

    # estimate the current rainfall
    def update_rainfall(self, d):
        if "rain" in d:
            if "1h" in d["rain"]:
                self.rain = float(d["rain"]["1h"])
            if "3h" in d["rain"]:
                self.rain = float(d["rain"]["3h"])/3.0
            print("Rain_mm based on prediction: {}".format(self.rain))
        else:
            print("No rain predicted in next 3hrs.")
            if "weather" in d:
                w = d['weather']
                for obj in w:
                    if obj['main']=='Rain':
                        self.rain = rain_desc_to_mm(obj['id'])
        if "snow" in d:
            # not accurate, but will do for now
            self.rain += 50

        self.rain_today += self.rain
        print("RAIN_MM: {}, RAIN_TODAY: {}".format(self.rain,
                                                   self.rain_today))

    def calculate_ev_fao56_factor(self, d):
        dt = d['dt']
        factor = 0.0
        if dt > d['sys']['sunrise']:
            if dt < d['sys']['sunset']:
                factor = min(float(dt - d['sys']['sunrise'])/3600.0, 1.0)
            else:
                if dt > d['sys']['sunset']:
                    factor = (dt - d['sys']['sunrise'])/3600.0
                    if factor < 1.0:
                        factor = 1.0 - factor
            return factor

    def estimate_fao56(self, day_of_year,
                       temp_c,
                       elevation,
                       latitude,
                       rh,
                       wind_m_s,
                       atmos_pres):
        """ Estimate fao56 from weather """
        sha = pyeto.sunset_hour_angle(pyeto.deg2rad(latitude),
                                      pyeto.sol_dec(day_of_year))
        daylight_hours = pyeto.daylight_hours(sha)
        sunshine_hours = 0.8 * daylight_hours
        ird = pyeto.inv_rel_dist_earth_sun(day_of_year)
        et_rad = pyeto.et_rad(pyeto.deg2rad(latitude),
                              pyeto.sol_dec(day_of_year), sha, ird)
        sol_rad = pyeto.sol_rad_from_sun_hours(daylight_hours, sunshine_hours,
                                               et_rad)
        net_in_sol_rad = pyeto.net_in_sol_rad(sol_rad=sol_rad, albedo=0.23)
        cs_rad = pyeto.cs_rad(elevation, et_rad)
        avp = pyeto.avp_from_rhmin_rhmax(pyeto.svp_from_t(temp_c-1),
                                         pyeto.svp_from_t(temp_c), rh, rh)
        net_out_lw_rad = pyeto.net_out_lw_rad(temp_c-1, temp_c, sol_rad,
                                              cs_rad, avp)
        eto = pyeto.fao56_penman_monteith(
            net_rad=pyeto.net_rad(net_in_sol_rad, net_out_lw_rad),
            t=pyeto.convert.celsius2kelvin(temp_c),
            ws=wind_m_s,
            svp=pyeto.svp_from_t(temp_c),
            avp=pyeto.avp_from_rhmin_rhmax(pyeto.svp_from_t(temp_c-1), 
                                           pyeto.svp_from_t(temp_c), rh, rh),
            delta_svp=pyeto.delta_svp(temp_c),
            psy=pyeto.psy_const(atmos_pres))
        return eto

    def calculate_fao56(self, d):
        day_of_year = datetime.datetime.now().timetuple().tm_yday
        t = d['main']['temp']
        rh = d['main']['humidity']
        ws = d['wind']['speed']
        atmos_pres = d['main']['pressure']

        # removed this multiplication for now
        # multiply it by 2 to norm it to 300ev a day
        fao56 = self.estimate_fao56(day_of_year,
                                    t,
                                    ELEVATION,
                                    LAT,
                                    rh,
                                    ws,
                                    atmos_pres)

        return fao56

    def update_ev(self, d):
        factor = self.calculate_ev_fao56_factor(d)
        if factor > 0.0:
            self.fao56 += factor * self.calculate_fao56(d)
        print("Factor: {}, FAO56: {}".format(factor, self.fao56))

    # call this every hour
    def update(self):

        d = self.get_data()
        print(d)

        # update the rainfall
        self.update_rainfall(d)

        # update the EV FAO56 value
        self.update_ev(d)


if len(sys.argv) < 5:
    print("test.py [apikey for OWM] [Latitude] [Longitude] \
          [Elevation in meters]")
    sys.exit(0)
else:
    APIKEY = sys.argv[1]
    LAT = float(sys.argv[2])
    LON = float(sys.argv[3])
    ELEVATION = float(sys.argv[4])
    OWM_URL = "https://api.openweathermap.org/data/2.5/weather?units=metric&lat={}&lon={}&appid={}"
    sit = Smart_Irrigation_Test()
    sit.update()
