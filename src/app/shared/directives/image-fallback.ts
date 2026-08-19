import { Directive } from '@angular/core';

@Directive({
  selector: '[appImageFallback]',
  standalone: false
})
export class ImageFallback {

  constructor() { }

}
