import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { SharedModule } from '../shared/shared.module';
import { OrderService } from './order.service';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { OrderRoutingModule } from './order-routing.module';
import { RestaurantService } from '../restaurant/restaurant.service';
import { OrderFormPageComponent } from './order-form-page/order-form-page.component';
import { AccountService } from '../account/account.service';
import { MatDialogModule } from '../../../node_modules/@angular/material';
import { RemoveOrderDialogComponent } from './remove-order-dialog/remove-order-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    // NgbModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatSnackBarModule,
    MatDialogModule,
    OrderRoutingModule,
    SharedModule
  ],
  exports: [
  ],
  providers: [
    OrderService,
    RestaurantService,
    AccountService
  ],
  declarations: [
    OrderHistoryComponent,
    OrderFormPageComponent,
    RemoveOrderDialogComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  entryComponents: [RemoveOrderDialogComponent]
})
export class OrderModule { }
