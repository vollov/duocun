import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../shared/shared.service';

import { environment } from '../../../environments/environment';
// import { LocationService } from '../../shared/location/location.service';
import { RestaurantService } from '../restaurant.service';
import { Restaurant, GeoPoint } from '../../lb-sdk';
import { PageActions } from '../../page/page.actions';
import { NgRedux } from '@angular-redux/store';
import { LocationService } from '../../location/location.service';
import { ILatLng } from '../../location/location.model';
import { RSA_NO_PADDING } from 'constants';
import { Observable } from '../../../../node_modules/rxjs';

const APP = environment.APP;

@Component({
  // providers: [LocationService],
  selector: 'app-restaurant-grid',
  templateUrl: './restaurant-grid.component.html',
  styleUrls: ['./restaurant-grid.component.scss']
})
export class RestaurantGridComponent implements OnInit {
  keyword: string;
  query: any;
  filter: any;
  places: any[] = [];
  MEDIA_URL = environment.MEDIA_URL;
  defaultPicture = window.location.protocol + '//placehold.it/400x300';

  @Input() restaurantList; // : Restaurant[];
  @Input() center;

  constructor(
    private router: Router,
    private sharedSvc: SharedService,
    private locationSvc: LocationService,
    private restaurantSvc: RestaurantService,
    private rx: NgRedux<Account>
  ) {
    // self.center = JSON.parse(localStorage.getItem('location-' + APP));

    // setup event listener
    // this.sharedServ.getMsg().subscribe(msg => {
    //     if ('OnSearch' === msg.name) {
    //         if (msg.query) {
    //             self.filter = msg.query;
    //             const query = { ...self.filter, ...self.query };
    //             self.doSearchRestaurants(query);
    //         } else {
    //             self.doSearchRestaurants(self.query.keyword);
    //         }
    //     }
    // });
  }

  ngOnInit() {
    const self = this;
    this.getDistanceToRestaurants(this.center).then(rs => {
      for (let i = 0; i < rs.length; i++) {
        self.restaurantList[i].distance = rs[i].distance.value / 1000; // km
      }

      // sort by distance
      self.restaurantList.sort((a: Restaurant, b: Restaurant) => {
        if (a.distance < b.distance) {
          return -1;
        }
        if (a.distance > b.distance) {
          return 1;
        }
        return 0;
      });
    });


  }

  searchByKeyword(keyword: string) {
    // const self = this;
    // this.query = { 'keyword': keyword };
    // const query = { ...self.filter, ...self.query };
    // self.doSearchRestaurants(query);
  }

  searchRestaurant(keyword: string) {
    // let self = this;
    // this.restaurantServ.find().subscribe(
    //   (ps: Restaurant[]) => {
    //       self.restaurantList = ps; // self.toProductGrid(data);
    //       const a = [];
    //       ps.map(restaurant => {
    //           a.push({
    //               lat: restaurant.location.lat,
    //               lng: restaurant.location.lng,
    //               name: restaurant.name
    //           });
    //       });
    //       self.places = a;
    //   },
    //   (err: any) => {
    //       self.restaurantList = [];
    //   }
    // );
  }

  getImageSrc(restaurant: any) {
    if (restaurant.pictures && restaurant.pictures[0] && restaurant.pictures[0].url) {
      return this.sharedSvc.getMediaUrl() + restaurant.pictures[0].url;
    } else {
      return this.defaultPicture;
    }
  }

  toDetail(r: Restaurant) {
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'restaurants'
    });
    this.router.navigate(['restaurants/' + r.id]);
  }

  getFilter(query?: any) {
    const qs = [];
    if (query.categories && query.categories.length > 0) {
      const s = query.categories.join(',');
      qs.push('cats=' + s);
    }

    // if(query.restaurants && query.restaurants.length>0){
    //   let s = query.restaurants.join(',');
    //   qs.push('ms=' + s);
    // }

    // if(query.colors && query.colors.length>0){
    //   let s = query.colors.join(',');
    //   qs.push('colors=' + s);
    // }
    return qs;
  }

  // get distance between current location and restaurant
  getDirectDistance(center: GeoPoint, location: GeoPoint) {
    const lat1 = center.lat;
    const lng1 = center.lng;

    if (location) {
      const lat2 = location.lat;
      const lng2 = location.lng;
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLng = (lng2 - lng1) * (Math.PI / 180);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
        + Math.cos(lat1 * (Math.PI / 180)) * Math.cos((lat2) * (Math.PI / 180))
        * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const d = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return d;
    } else {
      return 0;
    }
  }

  getDistanceToRestaurants(center: GeoPoint): Promise<any>  {
    const self = this;
    const origin: ILatLng = {lat: center.lat, lng: center.lng};
    const destinations: ILatLng[] = [];
    this.restaurantList.map( r => {
      destinations.push({lat: r.location.lat, lng: r.location.lng});
    });

    return new Promise((resolve: any, reject) => {
      self.locationSvc.getDistances(origin, destinations).subscribe(rs => {
        resolve(rs);
      });
    });

  }

  getDistanceString(r: Restaurant) {
    const d = r.distance;
    return d.toFixed(2) + ' km';
  }

  getDeliveryFeeString(r: Restaurant) {
    const d = 1.5 * r.distance;
    return d ? d.toFixed(2) : 0;
  }

  // doSearchRestaurants(query?: any) {
  //     // query --- eg. {}
  //     const self = this;
  //     const qs = self.getFilter(query);
  //     let s = '';
  //     const conditions = [];

  //     if (qs.length > 0) {
  //         conditions.push(qs.join('&'));
  //     }
  //     if (query && query.keyword) {
  //         conditions.push('keyword=' + query.keyword);
  //     }
  //     if (query && query.lat && query.lng) {
  //         conditions.push('lat=' + query.lat + '&lng=' + query.lng);
  //     }

  //     if (conditions.length > 0) {
  //         s = '?' + conditions.join('&');
  //     }

  //     // this.restaurantServ.getNearby(this.center).subscribe(
  //     this.restaurantServ.find().subscribe(
  //         (ps: Restaurant[]) => {
  //             self.restaurantList = ps; // self.toProductGrid(data);
  //             const a = [];
  //             ps.map(restaurant => {
  //                 a.push({
  //                     lat: restaurant.location.lat,
  //                     lng: restaurant.location.lng,
  //                     name: restaurant.name
  //                 });
  //             });
  //             self.places = a;
  //         },
  //         (err: any) => {
  //             self.restaurantList = [];
  //         }
  //     );
  // }
}
