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
  template: `
    <div class="image-upload"
       fileDrop
       [accept]="['image/*']"
       (isFileOver)="fileOver($event)"
       (fileDrop)="fileChange($event)"
       [ngClass]="{'file-is-over': isFileOver}"
  >
    <div class="file-upload hr-inline-group">
      <div class="drag-box-message">{{dropBoxMessage}}</div>
      <label class="upload-button">
        <span>{{buttonCaption}}</span>
        <input
          type="file"
          accept="image/*"
          multiple (change)="fileChange(input.files)"
          #input>
      </label>
    </div>
  
    <div *ngIf="preview" class="image-container hr-inline-group" [dragula]='"first-bag"' [dragulaModel]='files'>
      <div
        class="image"
        *ngFor="let file of files"
        [ngStyle]="{'background-image': 'url('+ file.src +')'}"
      >
        <div *ngIf="file.pending" class="loading-overlay">
          <div class="spinningCircle"></div>
        </div>
        <div *ngIf="!file.pending" class="x-mark" (click)="deleteFile(file)">
          <span class="close"></span>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [
    `
      .image-upload {
        --common-radius: 3px;
        --active-color: #33CC99;
        position: relative;
        border-radius: var(--common-radius);
        border: #d0d0d0 dashed 1px;
        font-family: sans-serif;
      }
      
      .file-is-over {
        border-color: var(--active-color);
        border-style: solid;
      }
      
      .hr-inline-group:after {
        display: table;
        clear: both;
        content: "";
      }
      
      .file-upload {
        padding: 16px;
        background-color: #f8f8f8;
      }
      
      .drag-box-message {
        float: left;
        display: inline-block;
        margin-left: 12px;
        padding-top: 14px;
        color: #9b9b9b;
        font-weight: 600;
      }
      label.upload-button input[type=file] {
        display: none;
        position: fixed;
        top: -99999px;
      }
      .upload-button {
        cursor: pointer;
        background-color: var(--active-color);
        padding: 10px;
        color: white;
        font-size: 1.25em;
        font-weight: 500;
        text-transform: uppercase;
        display: inline-block;
        float: left;
      
        -webkit-box-shadow: 2px 2px 4px 0px rgba(148, 148, 148, 0.6);
        -moz-box-shadow: 2px 2px 4px 0px rgba(148, 148, 148, 0.6);
        box-shadow: 2px 2px 4px 0px rgba(148, 148, 148, 0.6);
      }
      .upload-button:active span{
        position: relative;
        display: block;
        top: 1px;
      }
      
      .image-container {
        background-color: #fdfdfd;
        padding: 0 10px 0 10px;
      }
      
      .image {
        cursor: move; /* fallback if grab cursor is unsupported */
        cursor: grab;
        border: 1px solid #fdfdfd;
        display: inline-block;
        margin: 6px;
        width: 86px;
        height: 86px;
        background: center center no-repeat;
        background-size: contain;
        position: relative;
      }
      
      .x-mark {
        width: 20px;
        height: 20px;
        text-align: center;
        cursor: pointer;
        border-radius: 50%;
        background-color: black;
        opacity: .7;
        color: white;
        position: absolute;
        left: 0;
        right: 0;
        margin-left: auto;
        margin-right: auto;
        top: 50%;
        -webkit-transform: translateY(-50%);
        -moz-transform: translateY(-50%);
        -ms-transform: translateY(-50%);
        -o-transform: translateY(-50%);
        transform: translateY(-50%);
      }
      
      .close {
        width: 20px;
        height: 20px;
        opacity: .7;
        position: relative;
        padding-right: 3px;
      }
      
      .x-mark:hover .close {
        opacity: 1;
      }
      
      .close:before, .close:after {
        border-radius: 2px;
        position: absolute;
        content: '';
        height: 16px;
        width: 2px;
        top: 2px;
        background-color: #FFFFFF;
      }
      
      .close:before {
        transform: rotate(45deg);
      }
      
      .close:after {
        transform: rotate(-45deg);
      }
      
      .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background-color: black;
        opacity: .7;
      }
      
      .spinningCircle {
        height: 30px;
        width: 30px;
        margin: auto;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        border-radius: 50%;
        border: 3px solid rgba(255, 255, 255, 0);
        border-top: 3px solid white;
        border-right: 3px solid white;
        -webkit-animation: spinner 2s infinite cubic-bezier(0.085, 0.625, 0.855, 0.360);
        animation: spinner 2s infinite cubic-bezier(0.085, 0.625, 0.855, 0.360);
      }
      @-webkit-keyframes spinner {
        0% {
          -webkit-transform: rotate(0deg);
          transform: rotate(0deg);
        }
        100% {
          -webkit-transform: rotate(360deg);
          transform: rotate(360deg);
        }
      }
      
      @keyframes spinner {
        0% {
          -webkit-transform: rotate(0deg);
          transform: rotate(0deg);
        }
        100% {
          -webkit-transform: rotate(360deg);
          transform: rotate(360deg);
      
        }
      }
      
      .gu-mirror {
        cursor: grabbing !important;
        cursor: -moz-grabbing !important;
        cursor: -webkit-grabbing !important;
        position: fixed !important;
        margin: 0 !important;
        z-index: 9999 !important;
        opacity: .8;
        -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=80)";
        filter: alpha(opacity=80)
      }
      
      .gu-hide {
        display: none !important
      }
      
      .gu-unselectable {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important
      }
      
      .gu-transit {
        opacity: .2;
        -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=20)";
        filter: alpha(opacity=20)
      }
    `
  ]
  // templateUrl: './image-upload.component.html',
  // styleUrls: [ './image-upload.component.css' ]
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

  public deleteFile(file: FileHolder): void {
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
