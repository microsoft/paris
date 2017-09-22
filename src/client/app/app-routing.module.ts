import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {EntityComponent} from "./components/entity.component";
import {EntityResolver} from "./entity-resolver";

@NgModule({
  imports: [
    RouterModule.forRoot([
		{
			path: 'entity/:entityPluralName',
			component: EntityComponent,
			resolve: {
				entity: EntityResolver
			}
		}
    ])
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

