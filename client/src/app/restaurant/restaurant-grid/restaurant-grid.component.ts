import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { SharedService } from '../../shared/shared.service';
import { environment } from '../../../environments/environment';
import { IRestaurant } from '../restaurant.model';
import { PageActions } from '../../main/main.actions';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { RestaurantActions } from '../restaurant.actions';
import { IDeliveryTime } from '../../delivery/delivery.model';
import { IMall } from '../../mall/mall.model';
import { DeliveryActions } from '../../delivery/delivery.actions';
import { CartActions } from '../../cart/cart.actions';

@Component({
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
  workers;

  @Input() deliveryTime: IDeliveryTime;
  @Input() malls: IMall[];
  @Input() restaurantList: IRestaurant[];
  @Input() center;

  constructor(
    private router: Router,
    private sharedSvc: SharedService,
    private rx: NgRedux<IAppState>
  ) {
  }

  ngOnInit() {
    const self = this;
    if (self.restaurantList && self.restaurantList.length > 0) {
      // sort by isClosed && distance
      self.restaurantList.sort((a: IRestaurant, b: IRestaurant) => {
        if (!a.isClosed && b.isClosed) {
          return -1;
        } else if (a.isClosed && !b.isClosed) {
          return 1;
        } else if (a.inRange && !b.inRange) {
          return -1;
        } else if (!a.inRange && b.inRange) {
          return 1;
        } else {
          if (a.distance < b.distance) {
            return -1;
          }
          if (a.distance > b.distance) {
            return 1;
          }
          return 0;
        }
      });
    }
  }

  getImageSrc(restaurant: any) {
    if (restaurant.pictures && restaurant.pictures[0] && restaurant.pictures[0].url) {
      return this.sharedSvc.getMediaUrl() + restaurant.pictures[0].url;
    } else {
      return this.defaultPicture;
    }
  }

  toDetail(r: IRestaurant) {
    this.rx.dispatch({ type: PageActions.UPDATE_URL, payload: 'restaurants' });
    this.rx.dispatch({ type: RestaurantActions.UPDATE, payload: r });
    this.rx.dispatch({
      type: DeliveryActions.UPDATE_DESTINATION,
      payload: { destination: r.location, distance: r.distance }
    });

    this.rx.dispatch({
      type: CartActions.UPDATE_DELIVERY,
      payload: {
        merchantId: r.id,
        merchantName: r.name,
        deliveryCost: r.fullDeliveryFee,
        deliveryFee: r.deliveryFee,
        deliveryDiscount: r.fullDeliveryFee
      }
    });
    this.router.navigate(['restaurant/list/' + r.id]);
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

  getDistanceString(r: IRestaurant) {
    return r.distance.toFixed(2) + ' km';
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
