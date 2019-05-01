import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs/Observable';
import { BackgroundGeolocationEvents, BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = TabsPage;

  events: Observable<any[]>;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private afdb: AngularFireDatabase,
    private backgroundGeolocation: BackgroundGeolocation) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      this.loadFirebase();
      this.startBgGeolocation();
    });
  }

  loadFirebase() {
    // var self = this;

    // var eventRef = this.afdb.database.ref('event/');
    // eventRef.orderByChild("endTimestamp").startAt(Date.now()).on('value', function (snapshot) {
    //   self.events = snapshot;
    // });
    this.events = this.afdb.list('events/').valueChanges();
    console.log(this.events);
    //update rxjs 'npm install rxjs@6.0.0 --save' to make it run
    // this.events.subscribe(event => {
    //   console.log(event);
    // });
  }

  startBgGeolocation() {
    // this.events.subscribe(event=>{
    //   console.log(event);
    // })
    this.events.forEach(event => {
      console.log(event);
    });

    const config: BackgroundGeolocationConfig = {
      desiredAccuracy: 0,
      stationaryRadius: 1,
      distanceFilter: 1,
      debug: true, //  enable this hear sounds for background-geolocation life-cycle.
      stopOnTerminate: false, // enable this to clear background location settings when the app terminates
      interval: 1000,
      fastestInterval: 1000,
      activitiesInterval: 1000,
    };

    this.backgroundGeolocation.configure(config)
      .then(() => {

        this.backgroundGeolocation.on(BackgroundGeolocationEvents.location).subscribe((location: BackgroundGeolocationResponse) => {

          console.log(location.latitude);
          console.log(location.longitude);


          // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
          // and the background-task may be completed.  You must do this regardless if your operations are successful or not.
          // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
          this.backgroundGeolocation.finish(); // FOR IOS ONLY
        });

      });

    // start recording location
    this.backgroundGeolocation.start();

  }
}
