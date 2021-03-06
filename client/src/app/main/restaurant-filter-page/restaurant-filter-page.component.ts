import { Component, OnInit, OnDestroy } from '@angular/core';
import { IDeliveryTime, IDelivery } from '../../delivery/delivery.model';
import { Subject } from '../../../../node_modules/rxjs';
import { Router } from '../../../../node_modules/@angular/router';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { PageActions } from '../main.actions';
import { takeUntil, take } from '../../../../node_modules/rxjs/operators';
import { ILocation, IPlace } from '../../location/location.model';
import { MallService } from '../../mall/mall.service';
import { AccountService } from '../../account/account.service';
import { LocationService } from '../../location/location.service';
import { SharedService } from '../../shared/shared.service';
import { RangeService } from '../../range/range.service';
import { IRangeAction } from '../../range/range.reducer';
import { RangeActions } from '../../range/range.actions';
import { IDeliveryAction } from '../../delivery/delivery.reducer';
import { DeliveryActions } from '../../delivery/delivery.actions';
import { IRange } from '../../range/range.model';

@Component({
  selector: 'app-restaurant-filter-page',
  templateUrl: './restaurant-filter-page.component.html',
  styleUrls: ['./restaurant-filter-page.component.scss']
})
export class RestaurantFilterPageComponent implements OnInit, OnDestroy {

  deliveryTime: IDeliveryTime = { text: '', from: null, to: null };
  deliveryDiscount = 2;
  orderDeadline = { h: 9, m: 30 };

  location: ILocation;
  places: IPlace[] = [];
  inRange = false;
  onDestroy$ = new Subject<any>();
  today;
  overdue = false;
  deliveryAddress;
  compareRanges: IRange[];
  availableRanges: IRange[];
  account;
  mapZoom = 14;
  rangeMap = false;
  mapCenter;

  constructor(
    private router: Router,
    private accountSvc: AccountService,
    private mallSvc: MallService,
    private rangeSvc: RangeService,
    private locationSvc: LocationService,
    private sharedSvc: SharedService,
    private rx: NgRedux<IAppState>
  ) {
    const self = this;
    const today = this.sharedSvc.getTodayString();
    this.today = { type: 'lunch today', text: '今天午餐', date: today, startTime: '11:45', endTime: '13:30' };
    this.overdue = this.sharedSvc.isOverdue(this.orderDeadline.h, this.orderDeadline.m);

    this.accountSvc.getCurrent().pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(account => {
      self.account = account;
    });
  }

  ngOnInit() {
    const self = this;
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'restaurant-filter'
    });

    this.rx.select('delivery').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((d: IDelivery) => {
      if (d && d.origin) {
        self.location = d.origin;
        self.deliveryAddress = self.locationSvc.getAddrString(d.origin);

        self.rangeSvc.find().pipe(takeUntil(self.onDestroy$)).subscribe(ranges => {
          const rs = self.rangeSvc.getAvailableRanges({ lat: d.origin.lat, lng: d.origin.lng }, ranges);
          self.inRange = (rs && rs.length > 0) ? true : false;
          self.availableRanges = rs;
          if (self.inRange) {
            self.compareRanges = [];
            self.mapZoom = 14;
            self.rangeMap = false;
            self.mapCenter = d.origin;
          } else {
            self.compareRanges = ranges;
            self.mapZoom = 9;
            self.rangeMap = true;

            const farNorth = { lat: 44.2653618, lng: -79.4191007 };
            self.mapCenter = {
              lat: (d.origin.lat + farNorth.lat) / 2,
              lng: (d.origin.lng + farNorth.lng) / 2
            };
          }
        });
      }

      if (d && d.fromTime) {
        self.deliveryTime = { from: d.fromTime, to: d.toTime };
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onSelectDeliveryTime(e: IDeliveryTime) {
    const self = this;
    const r = self.location;
    if (e) {
      this.deliveryTime = e;
      this.rx.dispatch<IDeliveryAction>({
        type: DeliveryActions.UPDATE_TIME_AND_RANGES,
        payload: { fromTime: e.from, toTime: e.to, availableRanges: self.availableRanges }
      });
      if (self.account) {
        const query = { where: { userId: self.account.id, placeId: r.placeId } };
        const lh = {
          userId: self.account.id, accountName: self.account.username, type: 'history',
          placeId: r.placeId, location: r, created: new Date()
        };

        // save location history
        self.locationSvc.saveIfNot(query, lh).pipe(
          takeUntil(this.onDestroy$)
        ).subscribe(() => {

        });
      }
      this.router.navigate(['restaurant/list']);
    }
  }

  onAddressInputFocus(e?: any) {
    const self = this;
    this.places = [];
    if (this.account && this.account.id) {
      this.locationSvc.getHistoryLocations(this.account.id).pipe(
        takeUntil(this.onDestroy$)
      ).subscribe(a => {
        self.places = a;
      });
    }
  }

  onSelectPlace(e) {
    const r: ILocation = e.location;
    this.places = [];
    if (r) {
      this.rx.dispatch<IDeliveryAction>({ type: DeliveryActions.UPDATE_ORIGIN, payload: { origin: r } });
      this.deliveryAddress = e.address; // set address text to input
    }
  }

  onAddressChange(e) {
    const self = this;
    this.places = [];
    this.locationSvc.reqPlaces(e.input).pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((ps: IPlace[]) => {
      if (ps && ps.length > 0) {
        for (const p of ps) {
          p.type = 'suggest';
          self.places.push(p); // without lat lng
        }
      }
    });
  }

  onAddressClear(e) {
    this.deliveryAddress = '';
    this.places = [];
    this.rx.dispatch({
      type: DeliveryActions.UPDATE_ORIGIN,
      payload: { origin: null }
    });
    this.onAddressInputFocus({ input: '' });
  }

  // useCurrentLocation() {
  //   const self = this;
  //   self.places = [];
  //   this.locationSvc.getCurrentLocation().then(r => {
  //     self.deliveryAddress = self.locationSvc.getAddrString(r); // set address text to input

  //     self.rx.dispatch<ILocationAction>({
  //       type: LocationActions.UPDATE,
  //       payload: r
  //     });
  //   },
  //     err => {
  //       console.log(err);
  //     });
  // }

  showLocationList() {
    return this.places && this.places.length > 0;
  }

  changeAddress() {
    this.router.navigate(['contact/address-form'], { queryParams: { fromPage: 'restaurant-filter' } });
  }

  onBack(e) {
    // this.deliveryAddress = '';
    this.places = [];
  }
}
