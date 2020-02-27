import { Box, BoxProps, Keyboard } from 'grommet';
import * as React from 'react';

export interface IProps {
  slides: React.ComponentType[];
}

interface ITouch {
  at: number;
  x: number;
  y: number;
}

const createTouch = (
  event: React.TouchEvent<HTMLDivElement>,
): ITouch | undefined => {
  if (event.changedTouches.length === 1) {
    const touch = event.changedTouches.item(0);
    if (touch) {
      return {
        at: new Date().getTime(),
        x: touch.pageX,
        y: touch.pageY,
      };
    }
  }
  return undefined;
};

const Viewer: React.FC<IProps> = ({ slides }) => {
  const [current, setCurrent] = React.useState(0);
  const ref = React.useRef<
    React.Component<BoxProps & JSX.IntrinsicElements['div']> & HTMLDivElement
  >(null);
  let timer: any;
  let busy: boolean;

  React.useEffect(() => {
    let touchStart: ITouch | undefined;

    const onTouchStart = (event: any): void => {
      event.preventDefault();
      touchStart = createTouch(event);
    };

    const onTouchMove = (event: any): void => {
      event.preventDefault();
    };

    const onTouchEnd = (event: any): void => {
      if (touchStart) {
        const touchEnd = createTouch(event);
        if (touchEnd) {
          const delta: ITouch = {
            at: touchEnd.at - touchStart.at,
            x: touchEnd.x - touchStart.x,
            y: touchEnd.y - touchStart.y,
          };

          if (Math.abs(delta.y) < 100 && delta.at < 200) {
            if (delta.x > 100) {
              onPrevious();
            } else if (delta.x < -100) {
              onNext();
            }
          }
        }
        touchStart = undefined;
      }
    };

    const onTouchCancel = (event: any): void => {
      touchStart = undefined;
    };

    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchCancel);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchCancel);
    };
  });

  const onPrevious = (): void => {
    setCurrent(current > 0 ? current - 1 : slides.length - 1);
  };

  const onNext = (): void => {
    setCurrent(current < slides.length - 1 ? current + 1 : 0);
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    const { keyCode } = event;
    const current = keyCode - 49;
    if (current >= 0 && current <= slides.length - 1) {
      setCurrent(current);
    }
  };

  const onWheel = (event: any): void => {
    event.preventDefault();
    const deltaX = event.deltaX;
    if (!busy && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        onNext();
      } else if (deltaX < 0) {
        onPrevious();
      }
      busy = true;
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      busy = false;
    }, 50);
  };

  const enterFullscreen = (): void => {
    const viewer: any = ref.current!;
    if (viewer) {
      viewer.webkitRequestFullscreen();
    }
  };

  const exitFullscreen = (): void => {
    const doc: any = document;
    doc.webkitExitFullscreen();
  };

  const Slide: React.ComponentType = slides[current];
  return (
    <Box ref={ref} fill onWheel={onWheel}>
      <Keyboard
        target="document"
        onLeft={onPrevious}
        onRight={onNext}
        onShift={enterFullscreen}
        onEsc={exitFullscreen}
        // onKeyDown={onKeyDown}
      >
        <Slide />
      </Keyboard>
    </Box>
  );
};

export default Viewer;
