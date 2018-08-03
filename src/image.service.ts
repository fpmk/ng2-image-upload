import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Header {
  header: string;
  value: string;
}

@Injectable()
export class ImageService {
  private url: string;

  constructor(private http: HttpClient) {
  }

  public setUrl(url: string) {
    this.url = url;
  }

  deleteEmit: EventEmitter<number> = new EventEmitter();

  public postImage(image: File, headers?: Header[]) {
    this.checkUrl();
    return Observable.create(observer => {
      let formData: FormData = new FormData();
      let xhr: XMLHttpRequest = new XMLHttpRequest();

      formData.append('image', image);

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            observer.next(xhr.response);
            observer.complete();
          } else {
            observer.error(xhr.response);
          }
        }
      };

      xhr.open('POST', this.url, true);

      if (headers)
        for (let header of headers)
          xhr.setRequestHeader(header.header, header.value);

      xhr.send(formData);
    });
  }

  public deleteImage(url: string, id: string, headers?: Header[]): Observable<Response> {
    this.checkUrl();
    let hs: HttpHeaders = new HttpHeaders();
    for (let header of headers) {
      hs.append(header.header, header.value);
    }
    return this.http.delete<Response>(url, { params: { id: id }, headers: hs });
  }

  public convertFileToDataURLviaFileReader(url, id?: string, headers?: Header[]) {
    return Observable.create(observer => {
      let xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onreadystatechange = () => {
        let reader = new FileReader();
        reader.onloadend = () => {
          observer.next({ 'image': reader.result, id: id });
          observer.complete();
        };
        if (xhr.response != null) {
          reader.readAsDataURL(xhr.response);
        }
      };
      xhr.open('GET', url);

      if (headers)
        for (let header of headers)
          xhr.setRequestHeader(header.header, header.value);

      xhr.send();
    });
  }

  private checkUrl() {
    if (!this.url) {
      throw new Error('Url is not set! Please use setUrl(url) method before doing queries');
    }
  }

}
