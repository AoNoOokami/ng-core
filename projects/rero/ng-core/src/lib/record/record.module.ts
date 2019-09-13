import { NgModule } from '@angular/core';

import { RecordRoutingModule } from './record-routing.module';
import { RecordSearchComponent } from './search/record-search.component';
import { RecordSearchResultComponent } from './search/result/record-search-result.component';
import { RecordSearchResultDirective } from './search/result/record-search-result.directive';
import { RecordSearchAggregationComponent } from './search/aggregation/aggregation.component';
import { JsonComponent } from './search/result/item/json.component';
import { SharedModule } from '../shared.module';


@NgModule({
  declarations: [
    RecordSearchComponent,
    RecordSearchResultComponent,
    RecordSearchResultDirective,
    RecordSearchAggregationComponent,
    JsonComponent
  ],
  imports: [
    SharedModule,
    RecordRoutingModule
  ],
  exports: [
    RecordSearchComponent
  ],
  entryComponents: [
    JsonComponent
  ]
})
export class RecordModule { }