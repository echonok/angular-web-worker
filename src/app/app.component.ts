import { Component, OnInit } from '@angular/core';
import { TestWorker } from './test-webworker.worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';

  runWorker() {
    let result = 0;
    const worker = new TestWorker(() => {
      // START OF WORKER THREAD CODE
      console.log('Start worker thread, wait for postMessage: ');

      const calculateCountOfPrimeNumbers = (limit: any) => {

        const isPrime = (num: any) => {
          for (let i = 2; i < num; i++) {
            if (num % i === 0) {
              return false;
            }
          }
          return num > 1;
        };

        let countPrimeNumbers = 0;

        while (limit >= 0) {
          if (isPrime(limit)) {
            countPrimeNumbers += 1;
          }
          limit--;
        }

        // this is from DedicatedWorkerGlobalScope ( because of that we have postMessage and onmessage methods )
        // and it can't see methods of this class
        // @ts-ignore
        this.postMessage({
          primeNumbers: countPrimeNumbers
        });
      };

      // @ts-ignore
      this.onmessage = (evt) => {
        console.log({ myData: evt.data.myData })
        console.log('Calculation started: ' + new Date());
        calculateCountOfPrimeNumbers(evt.data.limit);
      };
      // END OF WORKER THREAD CODE
    });

    worker.postMessage({ limit: 300000, myData: '123 - evt' });

    worker.onmessage().subscribe((data) => {
      console.log('Calculation done: ', new Date() + ' ', data.data);
      result = data.data.primeNumbers;
      worker.terminate();
    });

    worker.onerror().subscribe((data) => {
      console.log({ data });
    });
  }


  ngOnInit(): void {
    this.runWorker();
  }
}
