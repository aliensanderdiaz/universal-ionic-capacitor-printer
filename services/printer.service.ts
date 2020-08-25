import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';

@Injectable({
  providedIn: 'root'
})
export class PrinterService {

  constructor(
    private bluetoothSerial: BluetoothSerial
  ) { }

  enableBluetooth() {
    // Devuelve una promesa
    return this.bluetoothSerial.enable();
  }

  searchBluetooth() {
    // Devuelve una promesa
    return this.bluetoothSerial.list();
  }

  connectBluetooth(address) {
    // Devuelve un observable
    return this.bluetoothSerial.connect(address);
  }

  printData(data) {
    // Devuelve una promesa
    return this.bluetoothSerial.write(data);
  }

  disconnectBluetooth() {
    // Devuelve una promesa
    return this.bluetoothSerial.disconnect();
  }
}
