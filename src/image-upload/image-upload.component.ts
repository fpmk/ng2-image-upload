import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Header, ImageService } from '../image.service';
import { DragulaService } from 'ng2-dragula';
import { Observable } from 'rxjs/Observable';

export class FileHolder {
  public serverResponse: any;
  public pending: boolean = false;

  constructor(private src: string, public file: File, public id?: string) {
  }
}

@Component({
  selector: 'image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: [ './image-upload.component.css' ]
})
export class ImageUploadComponent implements OnInit {

  @Input() uploaded: Array<Object>;
  @Input() icandelete: boolean = false;

  @Input() max: number = 100;
  @Input() url: string;
  @Input() headers: Header[];
  @Input() preview: boolean = true;
  @Input() maxFileSize: number;
  @Input() withCredentials: boolean = false;
  @Input() partName: string;

  @Output()
  private isPending: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output()
  private onFileUploadFinish: EventEmitter<FileHolder> = new EventEmitter<FileHolder>();
  @Output()
  private onRemove: EventEmitter<FileHolder> = new EventEmitter<FileHolder>();

  public files: FileHolder[] = [];
  showFileTooLargeMessage: boolean = false;

  public fileCounter: number = 0;
  private pendingFilesCounter: number = 0;

  isFileOver: boolean = false;

  @Input()
  buttonCaption: string = 'Select Images';
  @Input()
  dropBoxMessage: string = 'Drop your images here!';
  @Input()
  fileTooLargeMessage: string;
  @Input('extensions')
  supportedExtensions: string[] = [ 'image/*' ];

  constructor(private imageService: ImageService,
              private dragulaService: DragulaService) {
    dragulaService.setOptions('first-bag', {
      direction: 'horizontal'
    });
  }

  ngOnInit() {
    this.imageService.setUrl(this.url);
    if (!this.fileTooLargeMessage) {
      this.fileTooLargeMessage = 'An image was too large and was not uploaded.' + (this.maxFileSize
          ? (' The maximum file size is ' + this.maxFileSize / 1024) + 'KiB.'
          : '');
    }
    if (this.supportedExtensions) {
      this.supportedExtensions = this.supportedExtensions.map((ext) => 'image/' + ext);
    }
    if (typeof this.uploaded !== 'undefined')
      if (this.uploaded.length > 0)
        for (let i = 0; i < this.uploaded.length; i++) {
          this.imageService.convertFileToDataURLviaFileReader(this.uploaded[ i ][ 'imageUrl' ],
            this.uploaded[ i ][ 'id' ],
            this.headers).subscribe(
            response => {
              let fileHolder: FileHolder = new FileHolder(response.image,
                new File([ response.image ], 'file.jpg'),
                response.id);
              this.files.push(fileHolder);
              this.max--;
            }
          );
        }
  }

  fileChange(files: FileList) {
    let remainingSlots = this.countRemainingSlots();
    let filesToUploadNum = files.length > remainingSlots ? remainingSlots : files.length;

    if (this.url && filesToUploadNum != 0) {
      this.isPending.emit(true);
    }

    this.fileCounter += filesToUploadNum;
    this.showFileTooLargeMessage = false;
    this.uploadFiles(files, filesToUploadNum);
  }

  deleteAll() {
    this.files = [];
    this.fileCounter = 0;
  }

  private uploadFiles(files: FileList, filesToUploadNum: number) {
    for (let i = 0; i < filesToUploadNum; i++) {
      let file = files[ i ];

      if (this.maxFileSize && file.size > this.maxFileSize) {
        this.showFileTooLargeMessage = true;
        continue;
      }

      let img = document.createElement('img');
      img.src = window.URL.createObjectURL(file);

      let reader = new FileReader();
      reader.addEventListener('load', (event: any) => {
        let fileHolder: FileHolder = new FileHolder(event.target.result, file);

        fileHolder.serverResponse = `good boy: ${i}`;

        this.uploadSingleFile(fileHolder).subscribe(data => {
          if (data.result === 'ok') {
            fileHolder.id = data.response.id;
          }
        });

        this.files.push(fileHolder);

      }, false);

      reader.readAsDataURL(file);
    }
  }

  private uploadSingleFile(fileHolder: FileHolder) {
    return Observable.create(observer => {
      if (this.url) {
        this.pendingFilesCounter++;
        fileHolder.pending = true;

        this.imageService.postImage(fileHolder.file, this.headers).subscribe(response => {
          fileHolder.serverResponse = response;
          this.onFileUploadFinish.emit(fileHolder);
          fileHolder.pending = false;
          if (--this.pendingFilesCounter == 0) {
            this.isPending.emit(false);
          }
          observer.next({ 'result': 'ok', 'response': JSON.parse(response) });
          observer.complete();
        });

      } else {
        this.onFileUploadFinish.emit(fileHolder);
        observer.next({ 'result': 'error' });
        observer.complete();
      }
    });
  }

  private deleteFile(file: FileHolder): void {
    this.imageService.deleteImage(this.url, file.id, this.headers)
        .subscribe(res => {
          this.onRemove.emit(file);
          let index = this.files.indexOf(file);
          this.files.splice(index, 1);
          this.fileCounter--;
        });
  }

  fileOver(isOver) {
    this.isFileOver = isOver;
  }

  private countRemainingSlots() {
    return this.max - this.fileCounter;
  }

  get value(): any[] {
    return this.files;
  }
}
