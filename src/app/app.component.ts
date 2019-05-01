import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs/Observable';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = TabsPage;

  events: Observable<any[]>;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private afdb: AngularFireDatabase) {
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
    this.events = this.afdb.list('events', ref=>ref.orderByChild('endTimestamp').startAt(Date.now())).valueChanges();
    console.log(this.events);
    //update rxjs 'npm install rxjs@6.0.0 --save' to make it run
    this.events.subscribe(event => {
      console.log(event);
    });
  }


  startBgGeolocation() {
    // this.events.subscribe(event=>{
    //   console.log(event);
    // })
    // this.events.forEach(event=>{
    //   console.log(event);
    // })      
  }
}
