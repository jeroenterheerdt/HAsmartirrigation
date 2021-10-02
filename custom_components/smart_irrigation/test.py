#test.py [apikey for OWM] [Latitude] [Longitude]

import sys
import requests
import json
import pyeto
import datetime
import math
from OWMClient import OWMClient

APIKEY = ""
LAT = 0.0
LON = 0.0
ELEVATION = 0.0

#METRIC TO IMPERIAL (US) FACTORS

MM_TO_INCH_FACTOR = 0.03937008
LITER_TO_GALLON_FACTOR = 0.26417205
M2_TO_SQ_FT_FACTOR = 10.7639104
M_TO_FT_FACTOR = 3.2808399

class Smart_Irrigation_Test():

    def __init__(self):
        self.rain = 0.0  # mm
        self.snow = 0.0 # mm
        self.rain_day = 0.0  # mm
        self.snow_day = 0.0 # mm
        self.fao56 = 0.0  # mm in a day (value needs to be / by hours)
        self.fao56_day = 0.0 # mm in day
        self.bucketDelta = 0.0 #mm / day

        # store non-peak ETs in mm / day
        if MODE == "metric":
            self.non_peak_ET = MONTHLY_ET
        else:
            self.non_peak_ET = [x / MM_TO_INCH_FACTOR for x in MONTHLY_ET]

        # find peak ET
        self.peak_ET = max(self.non_peak_ET)
        #self.peak_ET_month = self.non_peak_ET.index(self.peak_ET)

        # set up OWM client
        self.client = OWMClient(APIKEY, LAT, LON)

        # calculate throughput (liter per minute)
        if MODE == "metric":
            self.throughput = NUM_SPRINKLERS * FLOW
        else:
            self.throughput = NUM_SPRINKLERS * (FLOW / LITER_TO_GALLON_FACTOR)

        # store area (m2)
        if MODE == "metric":
            self.area = AREA
        else:
            self.area = AREA / M2_TO_SQ_FT_FACTOR

        # store elevation (m)
        if MODE == "metric":
            self.elevation = ELEVATION
        else:
            self.elevation = ELEVATION / M_TO_FT_FACTOR

        # calculate precipitation rate (mm / hour)
        self.precipitation_rate = (self.throughput*60) / self.area

        # calculate base schedule index (minutes)
        self.base_schedule_index = self.peak_ET / self.precipitation_rate * 60

        
    def get_data(self):
        try:
            data = self.client.get_data()
            return data
        except Exception as e:
            raise e

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

    # estimate the current precipitation
    def update_precipitation_current(self, d):
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
            if "1h" in d["snow"]:
                self.snow = float(d["snow"]["1h"])
                print("Snow predicted in the next hour: {}".format(self.snow))

        print("RAIN_MM: {}".format(self.rain))
        print("SNOW_MM: {}".format(self.snow))

    # get rainfall from todays forecast
    def calculate_precipitation(self, d):
        if "rain" in d:
            self.rain_day = float(d["rain"])
        if "snow" in d:
            self.snow_day = float(d["snow"])

    # def calculate_ev_fao56_factor(self, d):
        dt = d['dt']
        factor = 0.0
        if dt > d['sunrise']:
            if dt < d['sunset']:
                factor = min(float(dt - d['sunrise'])/3600.0, 1.0)
            else:
                if dt > d['sunset']:
                    factor = (dt - d['sunrise'])/3600.0
                    if factor < 1.0:
                        factor = 1.0 - factor
            return factor

    #def estimate_fao56_hourly(self, day_of_year, temp_c, tdew, elevation, latitude, rh, wind_m_s, atmos_pres):
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
        avp = pyeto.avp_from_tdew(tdew)
        #not sure if I trust this net_out_lw_rad calculation here!
        net_out_lw_rad = pyeto.net_out_lw_rad(temp_c-1, temp_c, sol_rad,
                                              cs_rad, avp)
        net_rad = pyeto.net_rad(net_in_sol_rad, net_out_lw_rad)
        eto = pyeto.fao56_penman_monteith(
            net_rad=net_rad,
            t=pyeto.convert.celsius2kelvin(temp_c),
            ws=wind_m_s,
            svp=pyeto.svp_from_t(temp_c),
            avp=avp,
            delta_svp=pyeto.delta_svp(temp_c),
            psy=pyeto.psy_const(atmos_pres))
        return eto

    #def calculate_fao56_hourly(self, d):
        day_of_year = datetime.datetime.now().timetuple().tm_yday
        T_hr = d['temp']
        t_dew = float(d["dew_point"])
        pressure = d['pressure']
        RH_hr = d['humidity']
        u_2 = d['wind_speed']
        #print("CALCULATE_FAO56:")
        #print("T_hr: {}".format(T_hr))
        #print("t_dew: {}".format(t_dew))
        #print("RH_hr: {}".format(RH_hr))
        #print("u_2: {}".format(u_2))
        #print("pressure: {}".format(pressure))
        fao56 = self.estimate_fao56_hourly(day_of_year,
                                    T_hr,
                                    t_dew,
                                    self.elevation,
                                    LAT,
                                    RH_hr,
                                    u_2,
                                    pressure)

        return fao56

    def estimate_fao56_daily(self, day_of_year,
                       temp_c,
                       temp_c_min,
                       temp_c_max,
                       tdew,
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
        avp = pyeto.avp_from_tdew(tdew)
        net_out_lw_rad = pyeto.net_out_lw_rad(pyeto.convert.celsius2kelvin(
                                                  temp_c_min),
                                              pyeto.convert.celsius2kelvin(
                                                  temp_c_max),
                                              sol_rad,
                                              cs_rad,
                                              avp
                                              )
        net_rad = pyeto.net_rad(net_in_sol_rad, net_out_lw_rad)
        eto = pyeto.fao56_penman_monteith(
            net_rad=net_rad,
            t=pyeto.convert.celsius2kelvin(temp_c),
            ws=wind_m_s,
            svp=pyeto.svp_from_t(temp_c),
            avp=avp,
            delta_svp=pyeto.delta_svp(temp_c),
            psy=pyeto.psy_const(atmos_pres))
        return eto

    def calculate_fao56_daily(self, d):
        day_of_year = datetime.datetime.now().timetuple().tm_yday
        t_day = d['temp']["day"]
        t_min = d['temp']['min']
        t_max = d['temp']['max']
        t_dew = float(d["dew_point"])
        pressure = d['pressure']
        RH_hr = d['humidity']
        u_2 = d['wind_speed']
        #print("CALCULATE_FAO56:")
        #print("t_day: {}".format(t_day))
        #print("t_min: {}".format(t_min))
        #print("t_max: {}".format(t_max))
        #print("t_dew: {}".format(t_dew))
        #print("RH_hr: {}".format(RH_hr))
        #print("u_2: {}".format(u_2))
        #print("pressure: {}".format(pressure))
        fao56 = self.estimate_fao56_daily(day_of_year,
                                           t_day,
                                           t_min,
                                           t_max,
                                           t_dew,
                                           self.elevation,
                                           LAT,
                                           RH_hr,
                                           u_2,
                                           pressure)

        return fao56
   
    def update_ev(self, d):
        factor = self.calculate_ev_fao56_factor(d)
        if factor > 0.0:
            self.fao56 += factor * self.calculate_fao56_hourly(d)
        print("Factor: {}, FAO56: {}".format(factor, self.fao56))

    def calculate_ev(self, d):
        self.fao56_day = self.calculate_fao56_daily(d)

    def show_value(self, value, entity):
        if MODE == "metric":
            return value
        else:
            if entity == "mm":
                return value * MM_TO_INCH_FACTOR
            else:
                return null

    def update(self):

        d = self.get_data()
        if d is not None and d["daily"] is not None:
            print("OWM daily data: {0}".format(d["daily"][0]))

            #hour-based
            #print("HOUR-BASED")
            # update the precipitation based on current situation
            #self.update_precipitation_current(d["current"])

            # update the EV FAO56 value
            # divide by # hours to get the average value for the day
            #self.update_ev(d["current"])
            #print("END OF HOUR BASED")

            # calculations on day-basis
            #print("DAY BASED")
            self.calculate_precipitation(d["daily"][0])
            self.calculate_ev(d["daily"][0])
            #print("END OF DAY BASED")

            #test hargreaves equation
            #lat_rad = pyeto.deg2rad(LAT)
            #day_of_year = datetime.datetime.now().timetuple().tm_yday
            #sol_dec = pyeto.sol_dec(day_of_year)
            #sha = pyeto.sunset_hour_angle(lat_rad, sol_dec)
            #ird = pyeto.inv_rel_dist_earth_sun(day_of_year)
            #et_rad = pyeto.et_rad(lat_rad, sol_dec, sha, ird)
            #t_min = d["daily"][0]["temp"]["min"]
            #t_max = d["daily"][0]["temp"]["max"]
            #t_mean = (t_min+t_max)/2.0
            #et_hargreaves = pyeto.hargreaves(t_min, t_max, t_mean, et_rad)
            #print("hargreaves: {}".format(et_hargreaves))

            #test thornthwaite equation
            #lat_rad = pyeto.deg2rad(LAT)
            #current_year = datetime.datetime.now().year
            #mmdlh = pyeto.monthly_mean_daylight_hours(lat_rad, current_year)
            #monthly_t = [4.5,5.5,7.5,9.5,13.0,15.5,17.5,18.5,15.0,11.0,6.5,4.0]
            #et_thornthwaite = pyeto.thornthwaite(monthly_t, mmdlh)
            #print("thornthwaite: {}".format(et_thornthwaite))

            self.bucketDelta = self.rain_day + self.snow_day - self.fao56_day

            # calculate adjusted run time (minutes per day)
            #self.adjusted_run_time = [round(x * self.base_schedule_index) for x in self.water_budgets]

            print("FAO56_day: {}".format(self.show_value(self.fao56_day, "mm")))
            print("RAIN TODAY: {}".format(self.show_value(self.rain_day, "mm")))
            print("SNOW TODAY: {}".format(self.show_value(self.snow_day, "mm")))
            print("Bucket Delta: {}".format(self.show_value(self.bucketDelta,
                                                            "mm")))
            if(self.bucketDelta >= 0):
                #no need to irrigate
                print("BucketDelta >= 0, no need to irrigate")
            else:

                # calculate water budget for today (%)
                self.water_budget = abs(self.bucketDelta) / self.peak_ET
                # calculate the adjusted run time for today (minutes)
                self.adjusted_run_time = round(self.water_budget * self.base_schedule_index)
                print("BucketDelta < 0, irrigating for {} minutes!".format(self.adjusted_run_time))

                #open the irrigation valve for self.adjusted_run_time minutes.

if len(sys.argv) < 10:
    print("test.py [apikey for OpenWeatherMap] [Latitude] [Longitude] [Elevation] [metric|US] [JAN_ET,FEB_ET,MAR_ET,APR_ET,MAY_ET,JUN_ET,JUL_ET,AUG_ET,SEP_ET,OCT_ET,NOV_ET,DEC_ET] [number of sprinklers] [flow per sprinkler (gallon or liter per minute] [area (m2 or sq ft)]")
    print("To get the monthly ET values use http://www.rainmaster.com/historicET.aspx, http://wcatlas.iwmi.org/results.asp or another source.")
    print("Refer to documentation on your sprinklers to get flow per sprinkler.")
    sys.exit(0)
else:
    APIKEY = sys.argv[1]
    LAT = float(sys.argv[2])
    LON = float(sys.argv[3])
    ELEVATION = float(sys.argv[4])
    MODE = sys.argv[5].lower()
    MONTHLY_ET = [float(x) for x in sys.argv[6].split(',')]
    NUM_SPRINKLERS = int(sys.argv[7])
    FLOW = float(sys.argv[8])
    AREA = float(sys.argv[9])
    #OWM_URL = "https://api.openweathermap.org/data/2.5/weather?units=metric&lat={}&lon={}&appid={}"
    OWM_URL = "https://api.openweathermap.org/data/2.5/onecall?units=metric&lat={}&lon={}&appid={}"
    
    sit = Smart_Irrigation_Test()
    sit.update()
