import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {TagModel} from "../@model/tag.model";

@Component({
	selector: "tag",
	template: `
		<span class="tag" [style.background-color]="tag.color">{{tag.name}}</span>
	`,
	styles: [`
		.tag{
			display: inline-block;
			border: solid 1px #999;
			margin-right: 5px;
			font-size: 12px;
			font-weight: 600;
			padding: 2px 8px;
			border-radius: 3px;
		}
	`],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagComponent{
	@Input() tag:TagModel;
}
