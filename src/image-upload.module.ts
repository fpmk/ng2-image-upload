import { ModuleWithProviders, NgModule } from "@angular/core";
import { ImageUploadComponent } from "./image-upload/image-upload.component";
import { FileDropDirective } from "./file-drop.directive";
import { CommonModule } from "@angular/common";
import { ImageService } from "./image.service";
import { DragulaModule } from 'ng2-dragula';

@NgModule({
  imports: [ CommonModule, DragulaModule.forRoot() ],
  declarations: [
    ImageUploadComponent,
    FileDropDirective
  ],
  exports: [ ImageUploadComponent ]
})
export class ImageUploadModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ImageUploadModule,
      providers: [ ImageService ]
    }
  }
}
