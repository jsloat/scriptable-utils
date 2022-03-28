import { Stream } from './streamUtils';

type Connect<Returns, StreamedProps> = {
  (component: (props: StreamedProps) => Returns): () => Returns;
  <OwnProps>(component: (props: OwnProps & StreamedProps) => Returns): (
    ownProps: OwnProps
  ) => Returns;
};

export const getConnect =
  <Returns, StreamedProps>(
    stream: Stream<StreamedProps>
  ): Connect<Returns, StreamedProps> =>
  (component: (props: any & StreamedProps) => Returns) =>
  (ownProps: any = {}) =>
    component({
      ...ownProps,
      ...stream.getData(),
    });
