import { Dictionary } from 'lodash';
import { EmulatorClient } from 'emulator-ts';
import Preferences from './Preferences';
import Promise from 'bluebird';

export default class EmulatorHandler {
  token: string = '';
  private clients: Dictionary<EmulatorClient> = {};

  setToken(token: string) {
    this.token = token;
    return Preferences.save('emulator', { token });
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

  // TODO remove cb param
  exec(
    serial: string,
    cmd: string,
    cb?: (error: Error | null, output: string) => void
  ) {
    const internal: () => Promise<string> = () => {
      if (this.clients[serial]) {
        return this.clients[serial].write(cmd);
      } else
        return EmulatorClient.listEmulators()
          .then((ports) => {
            return Promise.map(ports, (port) => {
              if (serial.includes(port.toString())) {
                this.clients[serial] = new EmulatorClient(this.token, {
                  port,
                });
                return this.clients[serial];
              }
            });
          })
          .then(() => internal());
    };
    return internal();
  }
}
