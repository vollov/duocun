import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommerceModule } from '../commerce/commerce.module';
import { ProductFilterComponent } from './product-filter/product-filter.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductGridComponent } from './product-grid/product-grid.component';
import { OrderModule } from '../order/order.module';
// import { ImageUploadModule } from 'angular2-image-upload';
import { CategoryFormComponent } from './category-form/category-form.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { ImageUploaderModule } from '../image-uploader/image-uploader.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CommerceModule,
    SharedModule,
    OrderModule,
    // ImageUploadModule.forRoot(),
    ImageUploaderModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [ProductFormComponent, ProductListComponent, ProductGridComponent, ProductFilterComponent,
    CategoryFormComponent,
    CategoryListComponent],
  exports: [ProductFormComponent, ProductListComponent, ProductGridComponent, ProductFilterComponent,
    CategoryFormComponent,
    CategoryListComponent
  ]
})
export class ProductModule { }
