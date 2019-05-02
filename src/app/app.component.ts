import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs/Observable';
import { BackgroundGeolocationEvents, BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';
import { AlertController } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = TabsPage;

  events: Observable<any[]>;
  eventsArray: any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private afdb: AngularFireDatabase,
    private backgroundGeolocation: BackgroundGeolocation, private alertCtrl: AlertController, private localNotifications: LocalNotifications) {
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
    this.events = this.afdb.list('events', ref=>ref.orderByChild('endTimestamp').startAt(Date.now())).valueChanges();

    //update rxjs 'npm install rxjs@6.0.0 --save' to make subscribe work
    this.events.subscribe(ea => {
      this.eventsArray = ea;
    });
  }

  startBgGeolocation() {
    var self = this;
    var preDis = {};
    const config: BackgroundGeolocationConfig = {
      desiredAccuracy: 0,
      stationaryRadius: 1,
      distanceFilter: 1,
      debug: false,
      interval: 2000,
      fastestInterval: 2000,
      activitiesInterval: 2000
    };

    this.backgroundGeolocation.configure(config).then(() => {
        this.backgroundGeolocation.on(BackgroundGeolocationEvents.location).subscribe((location: BackgroundGeolocationResponse) => {
          if (this.eventsArray != null && this.eventsArray != undefined) {
            this.eventsArray.forEach(function (event) {
                let distance = self.calculateDistance(event.latitude, location.latitude, event.longitude, location.longitude);
                if (preDis[event.id] == null) {
                  preDis[event.id] = event.proximity;
                }
                if (distance < event.proximity && preDis[event.id] >= event.proximity) {
                  self.sendNotification(event.name, event.startDate);
                }
                preDis[event.id] = distance;
            })
          }

          // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
          // and the background-task may be completed.  You must do this regardless if your operations are successful or not.
          // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
          this.backgroundGeolocation.finish(); // FOR IOS ONLY
        });
      });
    this.backgroundGeolocation.start();
  }
  
  calculateDistance(lat1, lat2, lng1, lng2) {
    let p = 0.017453292519943295;    // Math.PI / 180
    let c = Math.cos;
    let a = 0.5 - c((lat1 - lat2) * p) / 2 + c(lat2 * p) * c((lat1) * p) * (1 - c(((lng1 - lng2) * p))) / 2;
    let dis = (12742 * Math.asin(Math.sqrt(a))); // 2 * R; R = 6371 km

    return dis * 1000;
  }

  sendNotification(place, startDate) {
    this.localNotifications.schedule({
      text: 'Event nearby on ' + startDate + '. Join?'
    });

    this.localNotifications.on('click').subscribe(() => {
      let alert = this.alertCtrl.create({
        title: 'Great!',
        subTitle: 'Looking forward to see you!',
        buttons: ['Dismiss']
      });
      alert.present();
    })
  }
}
