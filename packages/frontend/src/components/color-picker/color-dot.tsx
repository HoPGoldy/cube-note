import { FC } from "react";
import { MARK_COLORS_MAP } from "./constants";

interface ColorDotProps {
  color: string;
  className?: string;
}

export const ColorDot: FC<ColorDotProps> = (props) => {
  const getColorValue = () => {
    if (props.color in MARK_COLORS_MAP) {
      return MARK_COLORS_MAP[props.color];
    }

    return props.color;
  };

  return (
    <div
      className={`flex-shrink-0 w-3 h-3 rounded ${props.className || ""}`}
      style={{ backgroundColor: getColorValue() }}
    />
  );
};
