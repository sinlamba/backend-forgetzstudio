import { CreateMediaContainerProps } from '../../mediapost/types';
import { TiktokCreateVideoProps } from '../types/resource';

export class TiktokGlobalMapper {
  static fromGlobal(
    props: CreateMediaContainerProps,
    accessToken: string,
  ): TiktokCreateVideoProps {
    return {
      accessToken,
      videoUrl: props.videoUrl,
      title: props.caption,
    };
  }
}