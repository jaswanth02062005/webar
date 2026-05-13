import { forwardRef } from "react";

const BodyTracker = forwardRef((props, ref) => {
  return (
    <video
      ref={ref}
      className="absolute top-0 left-0 w-full h-full object-cover z-0 scale-x-[-1]"
      autoPlay
      playsInline
    />
  );
});

export default BodyTracker;
