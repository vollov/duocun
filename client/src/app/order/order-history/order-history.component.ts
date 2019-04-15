import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../account/account.service';
import { OrderService } from '../../order/order.service';
import { SharedService } from '../../shared/shared.service';
import { Order } from '../order.model';
import { SocketService } from '../../shared/socket.service';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { PageActions } from '../../main/main.actions';
import { OrderActions } from '../order.actions';
import { CartActions } from '../../cart/cart.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {

  account;
  restaurant;
  orders = [];

  constructor(
    private accountSvc: AccountService,
    private orderSvc: OrderService,
    private sharedSvc: SharedService,
    private socketSvc: SocketService,
    private rx: NgRedux<IAppState>,
    private router: Router
  ) {
    this.rx.dispatch({
      type: PageActions.UPDATE_URL,
      payload: 'order-history'
    });
  }

  ngOnInit() {
    const self = this;
    this.accountSvc.getCurrent().subscribe(account => {
      self.account = account;
      if (account && account.id) {
        self.reload(account.id);
      } else {
        // should never be here.
        self.orders = [];
      }
    });

    // this.socket.connect(this.authSvc.getToken());
    this.socketSvc.on('updateOrders', x => {
      // self.onFilterOrders(this.selectedRange);
      if (x.clientId === self.account.id) {
        const index = self.orders.findIndex(i => i.id === x.id);
        if (index !== -1) {
          self.orders[index] = x;
        } else {
          self.orders.push(x);
        }
        self.orders.sort((a: Order, b: Order) => {
          if (this.sharedSvc.compareDateTime(a.created, b.created)) {
            return -1;
          } else {
            return 1;
          }
        });
      }
    });
  }

  reload(clientId) {
    const self = this;
    self.orderSvc.find({ where: { clientId: clientId } }).subscribe(orders => {
      orders.sort((a: Order, b: Order) => {
        if (this.sharedSvc.compareDateTime(a.created, b.created)) {
          return -1;
        } else {
          return 1;
        }
      });
      self.orders = orders;
    });
  }

  canChange(order: Order) {
    const deliverDate = this.sharedSvc.getDate(order.delivered);
    const now = this.sharedSvc.getDate(new Date());
    const allowDateTime = deliverDate.set({ hour: 9, minute: 30, second: 0, millisecond: 0 });
    return allowDateTime.isAfter(now);
  }

  changeOrder(order: Order) {
    this.rx.dispatch({ type: OrderActions.UPDATE, payload: order });
    this.rx.dispatch({ type: CartActions.UPDATE_BY_MERCHANT, payload: order.items });

    this.router.navigate(['restaurant/list/' + order.merchantId]);
  }

  onSelect(c) {
    // this.select.emit({ order: c });
  }

  toDateTimeString(s) {
    return s ? this.sharedSvc.toDateTimeString(s) : '';
  }

  // takeOrder(order) {
  //   const self = this;
  //   order.workerStatus = 'process';
  //   this.orderSvc.replace(order).subscribe(x => {
  //     // self.afterSave.emit({name: 'OnUpdateOrder'});
  //     self.reload(self.account.id);
  //   });
  // }

  // sendForDeliver(order) {
  //   const self = this;
  //   order.workerStatus = 'done';
  //   this.orderSvc.replace(order).subscribe(x => {
  //     // self.afterSave.emit({name: 'OnUpdateOrder'});
  //     self.reload(self.account.id);
  //   });
  // }
}
