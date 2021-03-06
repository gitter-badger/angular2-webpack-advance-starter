/**
 * Mock location strategy (until provided by @angular)
 * Copied from:
 * 
 * https://github.com/angular/angular/blob/master/modules
 * /@angular/common/testing/mock_location_strategy.ts
 */
import { LocationStrategy } from '@angular/common';
import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core/src/facade/async';

/**
 * A mock implementation of {@link LocationStrategy} that allows tests to fire simulated
 * location events.
 *
 * @stable
 */
@Injectable()
export class MockLocationStrategy extends LocationStrategy {
  internalBaseHref: string = '/';
  internalPath: string = '/';
  internalTitle: string = '';
  urlChanges: string[] = [];
  /** @internal */
  _subject: EventEmitter<any> = new EventEmitter();
  constructor() { super(); }

  simulatePopState(url: string): void {
    this.internalPath = url;
    this._subject.emit(new MockPopStateEvent(this.path()));
  }

  path(includeHash: boolean = false): string { return this.internalPath; }

  prepareExternalUrl(internal: string): string {
    if ((<any>internal).startsWith('/') && (<any>this.internalBaseHref).endsWith('/')) {
      return this.internalBaseHref + internal.substring(1);
    }
    return this.internalBaseHref + internal;
  }

  pushState(ctx: any, title: string, path: string, query: string): void {
    this.internalTitle = title;

    let url = path + (query.length > 0 ? ('?' + query) : '');
    this.internalPath = url;

    let externalUrl = this.prepareExternalUrl(url);
    this.urlChanges.push(externalUrl);
  }

  replaceState(ctx: any, title: string, path: string, query: string): void {
    this.internalTitle = title;

    let url = path + (query.length > 0 ? ('?' + query) : '');
    this.internalPath = url;

    let externalUrl = this.prepareExternalUrl(url);
    this.urlChanges.push('replace: ' + externalUrl);
  }

  onPopState(fn: (value: any) => void): void { this._subject.subscribe({next: fn}); }

  getBaseHref(): string { return this.internalBaseHref; }

  back(): void {
    if (this.urlChanges.length > 0) {
      this.urlChanges.pop();
      let nextUrl = this.urlChanges.length > 0 ? this.urlChanges[this.urlChanges.length - 1] : '';
      this.simulatePopState(nextUrl);
    }
  }

  forward(): void { throw 'not implemented'; }
}

class MockPopStateEvent {
  pop: boolean = true;
  type: string = 'popstate';
  constructor(public newUrl: string) {}
}
