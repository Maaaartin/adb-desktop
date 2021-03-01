import { EmulatorClient } from "emulator-ts";
import Promise from 'bluebird';
import Preferences from "./Preferences";
import { Dictionary } from "lodash";

export default class EmulatorHandler {
  token: string = '';
  private clients: Dictionary<EmulatorClient> = {};

  setToken(token: string) {
    Preferences.save('emulator', { token });
    this.token = token;
  }

  getToken(cb: (token: string) => void) {
    const token = Preferences.get('emulator').token;
    if (token) {
      this.token = token;
      cb(token);
    } else {
      EmulatorClient.readToken((err, token) => {
        this.token = token;
        Preferences.save('emulator', { token });
        cb(token);
      });
    }
  }

  exec(serial: string, cmd: string, cb: (error: Error | null, output: string) => void) {
    if (this.clients[serial]) {
      this.clients[serial].write(cmd, (err, value) => {
        if (err) cb(err, '');
        else cb(null, value);
      });
    }
    else EmulatorClient.listEmulators((err, ports) => {
      Promise.map(ports, (port) => {
        if (serial.includes(port.toString())) {
          this.clients[serial] = new EmulatorClient(this.token, { port });
          this.exec(serial, cmd, cb);
        }
      });
    });
  }
}
