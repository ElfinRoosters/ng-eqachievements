import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConsoleLogService {
  log(...argv:any[]) {
    return console.log.apply(
      console,
      ['[' + new Date().toISOString().slice(11, -1) + ']'].concat(Array.prototype.slice.call(argv))
    );
  };
}
