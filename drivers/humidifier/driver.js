'use strict';

const TuyaBaseDriver = require('../tuyabasedriver');

class TuyaHumidifierDriver extends TuyaBaseDriver {

    onInit() {
        this.log('Tuya humidifier driver has been initialized');
    }

    async onPairListDevices() {
        let devices = [];
        if (!this.homey.app.isConnected()) {
            throw new Error("Please configure the app first.");
        }
        else {
            let humidifier = this.get_devices_by_type("humidifier");
            for (let tuyaDevice of Object.values(humidifier)) {
                let capabilities = [];
                let capabilitiesOptions = {};
                this.log("Add humidifier, device details:");
                this.log(tuyaDevice);
                if (tuyaDevice.status){
                    for (let i=0; i<tuyaDevice.status.length; i++){
                        switch (tuyaDevice.status[i].code){
                            case "temp_current":
                                capabilities.push("measure_temperature");
                                break;
                            case "humidity_current":
                                capabilities.push("measure_humidity");
                                break;
                            case "fault":
                                capabilities.push("humidifier_fault");
                                break;
                            default:
                                break;
                        }
                    }
                }
                if (tuyaDevice.functions){
                    for (let i=0; i<tuyaDevice.functions.length; i++){
                        let values;
                        switch (tuyaDevice.functions[i].code){
                            case "switch":
                                capabilities.push("onoff");
                                break;
                            case "humidity_set":
                                values = JSON.parse(tuyaDevice.functions[i].values);
                                capabilities.push("humidifier_target_humidity");
                                break;
                            case "level":
                                values = JSON.parse(tuyaDevice.functions[i].values);
                                capabilities.push("humidifier_level");
                                break;
                            default:
                                break;
                        }
                    }
                }
                devices.push({
                    data: {
                        id: tuyaDevice.id
                    },
                    capabilities: capabilities,
                    name: tuyaDevice.name
                });

            }
        }
        return devices.sort(TuyaBaseDriver._compareHomeyDevice);
    }
}

module.exports = TuyaHumidifierDriver;
