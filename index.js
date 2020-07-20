'use strict';

var Service, Characteristic;

module.exports = (api) => {
    Service = api.hap.Service;
    Characteristic = api.hap.Characteristic;
    api.registerAccessory('homebridge-sr-201-relay', 'SR-201-Relay', SR_201_Relay);
    
}

class SR_201_Relay {
    constructor (log, config) {
        
        log.debug('called switchHandler');

        this.informationService = new Service.AccessoryInformation()
            .setCharacteristic(Characteristic.Name, config.name)
            .setCharacteristic(Characteristic.Manufacturer, 'China')
            .setCharacteristic(Characteristic.Model, 'SR-201 Relay');
            
        this.switchService = new Service.Switch(config.name);
        this.switchService.getCharacteristic(Characteristic.On)
            .on('get', (callback) => {
            var s = require('net').Socket();
            s.connect(6722, config.ip);
            s.write('0' + config.relayIndex);

            s.on('data', function(d){
                const isOn = d.toString()[config.relayIndex - 1] == '1';      
                s.destroy();

                callback(null, isOn);
            });
            
            log.debug('called get');
        })
            .on('set', (newVal, callback) => {
            var s = require('net').Socket();
            s.connect(6722, config.ip);
            s.write((newVal ? '1' : '2') + config.relayIndex);
            s.on('data', function(d){
                s.destroy();
                log.debug('called set ' + newVal + ' with ' + (newVal ? '1' : '2') + config.relayIndex);
                
                callback(null);
            });
        });
        
        log.debug('finished initializing');
    }
    
    getServices () {
        return [this.informationService, this.switchService];
    }
    
}
