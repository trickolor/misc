import type { RectangleNodeProps } from "./nodes/rectangle";
import type { TextNodeProps } from "./nodes/text";
import type { LineNodeProps } from "./nodes/line";

import {
    DEFAULT_CONTENT,
    DEFAULT_FONT,
    DEFAULT_FONT_SIZE,
    DEFAULT_FONT_WEIGHT,
    DEFAULT_LETTER_SPACING,
    DEFAULT_LINE_HEIGHT,
} from "./nodes/text/constants";

import {
    DEFAULT_LINE_LENGTH,
    DEFAULT_STROKE,
    DEFAULT_STROKE_WIDTH,
    MIN_LINE_HIT_HEIGHT,
} from "./nodes/line/constants";

export const TEST_RECTANGLE_NODE: RectangleNodeProps = {
    id: 'test',
    type: 'rectangle',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    fill: '#FFFFFF',
    opacity: 1,
    rotation: 0,
};

export const TEST_TEXT_NODE: TextNodeProps = {
    id: 'test',
    type: 'text',
    x: 0,
    y: 0,
    width: 200,
    height: 48,
    fill: '#FFFFFF',
    opacity: 1,
    rotation: 0,

    content: DEFAULT_CONTENT,
    font: DEFAULT_FONT,
    fontSize: DEFAULT_FONT_SIZE,
    fontWeight: DEFAULT_FONT_WEIGHT,
    lineHeight: DEFAULT_LINE_HEIGHT,
    letterSpacing: DEFAULT_LETTER_SPACING,
};

export const TEST_LINE_NODE: LineNodeProps = {
    id: 'test',
    type: 'line',
    x: 0,
    y: 0,
    width: DEFAULT_LINE_LENGTH,
    height: MIN_LINE_HIT_HEIGHT,
    fill: DEFAULT_STROKE,
    opacity: 1,
    rotation: 0,

    strokeWidth: DEFAULT_STROKE_WIDTH,
};
