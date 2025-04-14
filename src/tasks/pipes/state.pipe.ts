import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { states } from '../constants/states';
import { State } from '../interfaces/state-param';

@Injectable()
export class StateValidationPipe implements PipeTransform {
  transform(value: State) {
    if (!states.includes(value)) {
      throw new BadRequestException(
        `Invalid state parameter: ${value}. Valid states are: ${states.join(', ')}`,
      );
    }

    return value;
  }
}
