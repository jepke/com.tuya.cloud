'use strict';

const TuyaBaseDevice = require('../tuyabasedevice');
const DataUtil = require("../../util/datautil");

const CAPABILITIES_SET_DEBOUNCE = 1000;

class TuyaHumidifierDevice extends TuyaBaseDevice {
    onInit() {
        this.scale = this.getStoreValue('scale');
        if (this.scale == undefined){
            this.scale = 5;
        }
        this.initDevice(this.getData().id);
        this.updateCapabilities(this.get_deviceConfig().status);
        this.registerMultipleCapabilityListener(this.getCapabilities(), async (values, options) => {
            return this._onMultipleCapabilityListener(values, options); }, CAPABILITIES_SET_DEBOUNCE);
        this.log(`Tuya humidifier ${this.getName()} has been initialized`);
    }
    _onMultipleCapabilityListener(valueObj, optsObj) {
        this.log("Humidifier capabilities changed by Homey: " + JSON.stringify(valueObj));
        try {
            if (valueObj.onoff != null) {
                this.set_on_off(valueObj.onoff === true || valueObj.onoff === 1);
            }
        } catch (ex) {
            this.homey.app.logToHomey(ex);
        }
    }
    async onSettings({ oldSettings, newSettings, changedKeys }) {
        let changedSettings = Object.fromEntries(Object.entries(newSettings).filter(([key, value]) => changedKeys.includes(key)));
        this.log("Update humidifier device settings: " + JSON.stringify(changedSettings));
        Object.entries(changedSettings).forEach(entry => {
            const [key, value] = entry;
            this.sendCommand(key, value);
        })
    }
    //init Or refresh AccessoryService
    updateCapabilities(statusArr) {
        this.log("Update humidifier capabilities from Tuya: " + JSON.stringify(statusArr));
        statusArr.forEach(status => {
            switch (status.code) {
                case 'switch':
                    this.normalAsync('onoff', status.value);
                    break;
            }
        });
    }

    normalAsync(name, hbValue) {
        this.log("Set humidifier Capability " + name + " with " + hbValue);
        this.setCapabilityValue(name, hbValue)
            .catch(error => console.error(error));
    }

    sendCommand(code, value) {
        var param = {
            "commands": [
                {
                    "code": code,
                    "value": value
                }
            ]
        }
        this.homey.app.tuyaOpenApi.sendCommand(this.id, param).catch((error) => {
            this.error('[SET][%s] capabilities Error: %s', this.id, error);
            throw new Error(`Error sending command: ${error}`);
        });
    }

    set_on_off(onoff) {
        this.sendCommand("switch", onoff);
    }
}

module.exports = TuyaHumidifierDevice;
