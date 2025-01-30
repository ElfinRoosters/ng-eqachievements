import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConsoleLogService {
  log(...data:any[]) {
    const a0 = '[' + new Date().toISOString().slice(11, -1) + '] ' + data[0];

    return console.log.apply(
      console,
      [a0].concat(Array.prototype.slice.call(data, 1))
    );
  };
}
