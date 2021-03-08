import { TestBed } from '@angular/core/testing';

import { OcrProviderService } from './ocr-provider.service';

describe('OcrProviderService', () => {
  let service: OcrProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OcrProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
