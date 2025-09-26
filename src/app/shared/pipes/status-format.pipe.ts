import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusFormat'
})
export class StatusFormatPipe implements PipeTransform {
  transform(value: string): string {
    switch (value?.toLowerCase()) {
      case 'alive':
        return '🟢 Alive';
      case 'dead':
        return '🔴 Dead';
      case 'unknown':
        return '⚪ Unknown';
      default:
        return value;
    }
  }
}
