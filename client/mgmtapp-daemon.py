# Copyright (c) 2019 - 2020, FHNW, Switzerland. All rights reserved.
# Licensed under MIT License, see LICENSE for details.

import time
import requests
import sys
import json
import hmac
import hashlib
import os
import sqlite3
import datetime
import jwt
import string
import random
import re

from datetime import datetime, timezone

from selenium import webdriver
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from uuid import getnode as get_mac

from dotenv import load_dotenv

#in database
g_device = None
g_device_id = None
g_registrationkey = None
g_status = None
g_device_name = None
g_device_apikey = None

#in memory
g_cfg_reloadtime = None
g_cfg_cycletime = None
g_cfg_urls = None

#set default values
G_CFG_FETCHINTERVAL = 20
G_CFG_STATUSINTERVAL = 5


g_rt_last_index = None
g_rt_last_reload = None
g_rt_last_status = None
g_rt_last_cycle = None
g_rt_last_fetch = None
g_rt_snapshot = None
g_rt_timestamp = None
g_rt_errors = []

g_driver = None

options = Options()
#TODO false in production
options.headless = False
options.add_argument("--no-sandbox") # Bypass OS security model
options.add_experimental_option('useAutomationExtension', False)
options.add_argument("--disable-dev-shm-usage") # overcome limited resource problems
options.add_argument("disable-infobars") # disabling infobars
options.add_argument('--disable-extensions')
options.add_experimental_option("excludeSwitches", ['enable-automation']);
options.add_argument("--kiosk")

#options.add_argument("--log-level=3")
#options.add_argument("--start-maximized")



#TODO add flag in production

#options.add_experimental_option("excludeSwitches", ["enable-automation"])
#options.add_argument("start-maximized") # open Browser in maximized mode
# options.add_argument("--disable-extensions") # disabling extensions
# options.add_argument("--disable-gpu") # applicable to windows os only
# options.add_argument('--headless')

#default host, set this in the .env file
host = "http://localhost:1337"
register_url = host + "/api/ext/register"
approval_url = host + "/api/ext/awaitapprove/"
status_url = host + "/api/ext/status/"
get_cfg_url = host + "/api/ext/configuration/"

def get_status():
    if g_status is None:
        conn = sqlite3.connect('device.db')
        c = conn.cursor()
        c.execute('''SELECT status FROM device''')
        conn.commit()

        status = str(c.fetchone()[0])
        conn.close()
        return status
    else:
        return g_status

def get_registrationkey():
    if g_registrationkey is None:
        conn = sqlite3.connect('device.db')
        c = conn.cursor()
        c.execute('''SELECT registrationkey FROM device''')
        conn.commit()
        registrationkey = str(c.fetchone()[0])
        conn.close()
        return registrationkey
    else:
        return g_registrationkey

def fetch_device_name():
    global g_device_name
    if g_device_name is None:
        conn = sqlite3.connect('device.db')
        c = conn.cursor()
        c.execute('''SELECT name FROM device''')
        conn.commit()
        device_name = str(c.fetchone()[0])
        conn.close()
        g_device_name = device_name
        return device_name
    else:
        return g_device_name

def fetch_device_id():
    global g_device_id
    if g_device_id is None:
        conn = sqlite3.connect('device.db')
        c = conn.cursor()
        c.execute('''SELECT name FROM device''')
        conn.commit()
        device_name = str(c.fetchone()[0])
        device_id = device_name.partition("-")[0]
        g_device_id = device_id
        conn.close()
        return device_id
    else:
        return g_device_id

def fetch_device_apikey():
    global g_device_apikey
    if g_device_apikey is None:
        conn = sqlite3.connect('device.db')
        c = conn.cursor()
        c.execute('''SELECT apikey FROM device''')
        conn.commit()
        g_device_apikey = str(c.fetchone()[0])
        conn.close()
        return g_device_apikey
    else:
        return g_device_apikey

def generate_devicename():
    mac = get_mac()
    readable_mac = ':'.join(("%012X" % mac)[i:i + 2] for i in range(0, 12, 2))
    return "device-" + readable_mac

def rnd_string(string_length):
    return "-"+ ''.join(random.choice(string.ascii_lowercase) for i in range(string_length))

def register():
    # make backend request to register with newly generated name
    try:
        device_name_generated = generate_devicename() + rnd_string(5)
        h = hmac.new(bytes.fromhex(get_registrationkey()), "data".encode('utf-8'), hashlib.sha256)
        heads = {'authorization': h.hexdigest(), 'content-type': 'application/json'}
        print("NEW DEVICENAME: "+device_name_generated)
        #TODO CHANGE NAME
        r = requests.post(register_url, data=json.dumps({'name': device_name_generated}), headers=heads)
        r.raise_for_status()
        if r.status_code == requests.codes['ok']:
            fetched_device = r.json()['device']

            device_id = fetched_device['id']
            print("fetched id from server:")
            print(fetched_device['id'])

            conn = sqlite3.connect('device.db')
            c = conn.cursor()
            c.execute("UPDATE device SET name = '" + str(device_id) + "-" + device_name_generated + "', status = 'REGISTERED' WHERE ROWID = 1")
            conn.commit()
            global g_device, g_device_name, g_device_id
            g_device = fetched_device
            g_device_name = device_name_generated
            g_device_id = device_id

            conn.close()
            print("saved id on device")
    except requests.exceptions.HTTPError as err:
        error(err)
        show_falbackpage()
    except requests.exceptions.RequestException as err:
        error(err)
        show_falbackpage()
def await_approval(par_device_id):
    # make backend request to check if the device has been approved
    global g_device_apikey
    try:
        h = hmac.new(bytes.fromhex(get_registrationkey()), "data".encode('utf-8'), hashlib.sha256)
        heads = {'authorization': h.hexdigest(), 'content-type': 'application/json'}

        r = requests.get(approval_url+str(par_device_id), headers=heads)
        r.raise_for_status()
        #TODO change to correct code
        if r.status_code == requests.codes['ok']:
            print("device approved")
            print(r.json())
            fetched_apikey = r.json()['jwt']
            print(fetched_apikey)
            conn = sqlite3.connect('device.db')
            c = conn.cursor()
            c.execute("UPDATE device SET name = '" + str(par_device_id) + "-" +fetch_device_name() + "',apikey = '"+fetched_apikey+"', status = 'APPROVED' WHERE ROWID = 1")
            conn.commit()
            g_device_apikey = fetched_apikey
            conn.close()
            print("saved id on device")
        elif r.status_code == requests.codes['accepted']:
            print("device still waiting for approval")

    except requests.exceptions.HTTPError as err:
        error(err)
        show_falbackpage()
    except requests.exceptions.RequestException as err:
        error(err)
        show_falbackpage()
        
def send_fatal():
    global g_rt_timestamp, g_rt_snapshot, g_rt_errors
    jsonStatus = json.dumps({'id': fetch_device_id(),
                             'errors_array': g_rt_errors,
                             'snapshot_timestamp': g_rt_timestamp,
                             'snapshot_base64': g_rt_snapshot})

    r = requests.post(status_url, data=jsonStatus,
                      headers={'content-type': 'application/json', 'bearer': fetch_device_apikey()})
    r.raise_for_status()
    if r.status_code == requests.codes['ok']:
        print("successfully sent status to server")

def handle_status():
    # make backend request to sends status and fetch maybe new cfg
    #print("device id: "+fetch_device_id())
    try:

        global g_rt_timestamp, g_rt_snapshot, g_rt_errors, g_rt_last_status
        if g_rt_last_status is None or delta(istime(g_rt_last_status)) > G_CFG_STATUSINTERVAL:
            g_rt_last_status = time_now()

            jsonStatus = json.dumps({'id': fetch_device_id(),
                                     'errors_array': g_rt_errors,
                                     'snapshot_timestamp': g_rt_timestamp,
                                     'snapshot_base64':g_rt_snapshot})

            r = requests.post(status_url, data=jsonStatus, headers={'content-type': 'application/json', 'bearer': fetch_device_apikey()})
            r.raise_for_status()
            if r.status_code == requests.codes['ok']:
                print("successfully sent status to server")


        global g_rt_last_fetch, G_CFG_FETCHINTERVAL
        if g_rt_last_fetch is None or delta(istime(g_rt_last_fetch)) > G_CFG_FETCHINTERVAL:
            g_rt_last_fetch = time_now()
            fetch_cfg()

    except requests.exceptions.HTTPError as err:
        error(err)
        show_fallbackpage()
    except requests.exceptions.RequestException as err:
        error(err)
        show_fallbackpage()

def show_fallbackpage():
    set_selenium_driver()
    fallbackpage = "file://" + os.getcwd() + "/fallback" + "/demo.html"
    g_driver.get(fallbackpage)
    
def istime(time_var):
    return time_var if time_var is not None else time_now()
def delta(time_var):
    return time_now() - time_var
def error(err):
    err_str = str(err)
    print(err_str)

    global g_rt_errors
    if len(g_rt_errors) > 30:
        del g_rt_errors[0]
        del g_rt_errors[0]
    errortmp = err_str + "-timestamp-" + datetime.now(timezone.utc).astimezone().isoformat()
    g_rt_errors.append(errortmp)


def show_url():
    global g_rt_last_index, g_rt_last_reload, g_rt_last_cycle

    if g_cfg_urls is not None and g_cfg_reloadtime is not None and g_cfg_cycletime is not None:
        #print("assuming valid cfg, checking if url need to be shown or refreshed")
        global options, g_driver

        if g_rt_last_index is None or g_rt_last_index >= (len(g_cfg_urls)-1):
            g_rt_last_index = 0
        if g_rt_last_reload is None:
            g_rt_last_reload = time_now()
        if g_rt_last_cycle is None:
            g_rt_last_cycle = time_now()

        #print("timestamp: " + (str(round(time.time()))))
        #print("timestamp: " + str(g_rt_last_reload))
        if time_now() - g_rt_last_cycle > int(g_cfg_cycletime) and not len(g_cfg_urls) == 1:
            g_rt_last_index += 1
            g_rt_last_cycle = time_now()
        if time_now() - g_rt_last_reload > int(g_cfg_reloadtime) and len(g_cfg_urls) > 0:

            print("checking URL with rt index:" + str(g_rt_last_index))
            set_selenium_driver()
            if check_url(g_cfg_urls[g_rt_last_index]):
                print("good: regex url: " + g_cfg_urls[g_rt_last_index])

                #print("good: status url: " + g_cfg_urls[g_rt_last_index])
                if check_url_status():
                    try:
                        g_driver.get(g_cfg_urls[g_rt_last_index])
                    except ConnectionError:
                        error("no connection to backend")
                        show_fallbackpage()
                else:
                    show_fallbackpage()

            time.sleep(2)
            global g_rt_snapshot, g_rt_timestamp
            g_rt_snapshot = g_driver.get_screenshot_as_base64()
            g_rt_timestamp = datetime.now(timezone.utc).astimezone().isoformat()
            g_rt_last_reload = time_now()

def time_now():
    return int(round(time.time()))

def fetch_cfg():
    try:
        global g_rt_last_fetch
        rC = requests.get(get_cfg_url + str(fetch_device_id()),
                          headers={'content-type': 'application/json',
                                   'bearer': fetch_device_apikey()})
        #TODO check if useful
        rC.raise_for_status()
        if rC.status_code == requests.codes['ok']:
            json_data = rC.json()
            global g_cfg_cycletime, g_cfg_reloadtime, g_cfg_urls
            print("CFG:")
            print(json_data)
            if json_data.get('configuration', None) is not None:
                if 'cycletime' in json_data['configuration']:
                    g_cfg_cycletime = str(json_data['configuration']['cycletime'])
                if 'reloadtime' in json_data['configuration']:
                    g_cfg_reloadtime = str(json_data['configuration']['reloadtime'])
                if 'urls' in json_data['configuration']:
                    array = json_data['configuration']['urls']
                    g_cfg_urls = list(map(lambda x: x['url'], array))
            print("successfully fetched config from server")
        else:
            error("Failure fetching config from backend")
    except BaseException as e:
        error("Failure fetching config from backend")

def check_url(url):
    regex = re.compile(
        r'^(?:http|ftp)s?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    res = re.match(regex, url) is not None
    if not res:
        error("URL " + url + " is not a valid url")
    return res

def check_url_status():
    global g_cfg_urls, g_rt_last_index
    try:
        r = requests.get(g_cfg_urls[g_rt_last_index])
        if r.status_code != requests.codes['ok']:
            error("URL "+g_cfg_urls[g_rt_last_index]+" is not responding with status 200")
            return False
        else:
            return True
    except:
        error("Error while checking status of a given url, maybe not reachable: "+g_cfg_urls[g_rt_last_index])
        return False


def set_selenium_driver():
    global g_driver
    # check if windows or unix system
    if os.name == 'nt':
        print('detected windows')
        if g_driver is None:
            g_driver = webdriver.Chrome(options=options)
    else:
        if g_driver is None:
            print('detected anything else than windows')
            # g_driver = webdriver.Chrome(options=options)
            g_driver = webdriver.Chrome(executable_path='/usr/bin/chromedriver', options=options)

def operate():
    status = get_status()
    print("status of device: "+status)

    if "NOTHING" in status:
        register()
    elif "REGISTERED" in status:
        await_approval(fetch_device_id())
    elif "APPROVED" in status:
        handle_status()
        show_url()

def init_db():
    if not os.path.isfile("device.db"):
        conn = sqlite3.connect('device.db')
        c = conn.cursor()
        c.execute('''CREATE TABLE device (serverid text, name text, registrationkey text, status text, apikey text)''')
        c.execute('''INSERT INTO device (registrationkey, status) VALUES ('cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e', 'NOTHING')''')
        c.execute('''SELECT * FROM device''')
        #print(c.fetchone())
        conn.commit()
        print("created new database")
        conn.close()

def read_env():
    if os.getenv('MGMTAPP_HOST') is None or os.getenv('MGMTAPP_PORT') is None or os.getenv('MGMTAPP_ENV') is None:
        error("FATAL ERROR: reading .env file failed!")
    if os.getenv('MGMTAPP_ENV') == "production":
        global host, register_url, approval_url, status_url, get_cfg_url
        host = os.getenv('MGMTAPP_HOST') + ":" + os.getenv('MGMTAPP_PORT')
        register_url = host + "/api/ext/register"
        approval_url = host + "/api/ext/awaitapprove/"
        status_url = host + "/api/ext/status/"
        get_cfg_url = host + "/api/ext/configuration/"

def main():
    try:
        print("script started")
        load_dotenv()
        read_env()
        init_db()

        while True:
            print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S"), " operating...")
            operate()
            time.sleep(1)
    except Exception as e:
        error("FATAL ERROR: Program quit, will hopefully be restarted by systemd")
        error(str(e))
        send_fatal()
        global g_driver
        #logger.exception(e)
        g_driver.close()
        g_driver.quit()
        sys.exit(1)

if __name__ == "__main__": main()


#registrationkey = "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e"

#OS          Expected Location of Chrome
# -------------------------------------
# Linux          /usr/bin/google-chrome
# Mac            /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
# Windows XP     %HOMEPATH%\Local Settings\Application Data\Google\Chrome\Application\chrome.exe
# Windows Vista  C:\Users\%USERNAME%\AppData\Local\Google\Chrome\Application\chrome.exe

# Create table
#c.execute('''CREATE TABLE device (name text, registrationkey text, status text)''')

#storage['registrationkey'] = "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e"

#json_data = json.dumps(dataJ)