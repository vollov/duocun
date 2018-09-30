import { Component, OnInit } from '@angular/core';
import { Restaurant, GeoPoint } from '../../shared/lb-sdk';
import { LocationService } from '../../shared/location/location.service';
import { environment } from '../../../environments/environment';
import { RestaurantService } from '../../restaurant/restaurant.service';
// import { RestaurantGridComponent } from '../../restaurant/restaurant-grid/restaurant-grid.component';

const APP = environment.APP;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  center: GeoPoint = { lat: 43.761539, lng: -79.411079 };
  restaurants;
  places;
  deliveryAddress = '';
  placeholder = 'Delivery Address';

  constructor(
    private locationSvc: LocationService,
    private restaurantSvc: RestaurantService,
  ) { }

  ngOnInit() {
    const self = this;
    const s = localStorage.getItem('location-' + APP);

    if (s) {
      const location = JSON.parse(s);
      self.deliveryAddress = location.street_number + ' ' + location.street_name + ' ' +
        location.sub_locality + ', ' + location.province;
      self.center = { lat: location.lat, lng: location.lng };
      self.doSearchRestaurants(self.center);
    } else {
      this.locationSvc.getCurrentLocation().subscribe(r => {
        self.center = { lat: r.lat, lng: r.lng };
        self.doSearchRestaurants(self.center);
      });
    }
  }

  toDetail() {

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

  doSearchRestaurants(query?: any) {
    // query --- eg. {}
    const self = this;
    const qs = self.getFilter(query);
    let s = '';
    const conditions = [];

    if (qs.length > 0) {
      conditions.push(qs.join('&'));
    }
    if (query && query.keyword) {
      conditions.push('keyword=' + query.keyword);
    }
    if (query && query.lat && query.lng) {
      conditions.push('lat=' + query.lat + '&lng=' + query.lng);
    }

    if (conditions.length > 0) {
      s = '?' + conditions.join('&');
    }

    this.loadRestaurants();
  }

  loadRestaurants() {
    const self = this;
    // this.restaurantServ.getNearby(this.center).subscribe(
    this.restaurantSvc.find().subscribe(
      (ps: Restaurant[]) => {
        self.restaurants = ps; // self.toProductGrid(data);
        const a = [];
        ps.map(restaurant => {
          if (restaurant.location) {
            a.push({
              lat: restaurant.location.lat,
              lng: restaurant.location.lng,
              name: restaurant.name
            });
          }
        });
        self.places = a;
      },
      (err: any) => {
        self.restaurants = [];
      }
    );
  }

  search(e?) {
    const self = this;
    if (e && e.addr) {
      self.locationSvc.set(e.addr);
      self.loadRestaurants();
    } else {
      this.locationSvc.getCurrentLocation().subscribe(r => {
        self.loadRestaurants();
      },
        err => {
          alert('Do you want to turn on your GPS to find the nearest restaurants?');
        });
    }
  }
}
