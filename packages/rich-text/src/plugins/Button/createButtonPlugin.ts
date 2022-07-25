import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import { HotkeyPlugin, KeyboardHandler } from '@udecode/plate-core';
// import { Button as UdeButton } from '@udecode/plate-button';
import isHotkey from 'is-hotkey';

import { isBlockSelected, isInlineOrText, toggleElement } from '../../helpers/editor';
import { transformUnwrap, transformLift } from '../../helpers/transformers';
import { RichTextEditor, RichTextPlugin } from '../../types';
import { Button } from './Button';
// import { isEmbedElement, isEmptyElement } from './utils';

const buildHeadingEventHandler =
  (type: BLOCKS): KeyboardHandler<RichTextEditor, HotkeyPlugin> =>
  (editor, { options: { hotkey } }) =>
  (event) => {
    if (editor.selection && hotkey && isHotkey(hotkey, event)) {
      const isActive = isBlockSelected(editor, type);
      editor.tracking.onShortcutAction(isActive ? 'remove' : 'insert', { nodeType: type });

      toggleElement(editor, { activeType: type, inactiveType: BLOCKS.PARAGRAPH });
    }
  };

// const buildButtonKeyDownHandler: KeyboardHandler<RichTextEditor, HotkeyPlugin> =
//   (editor, { options: { hotkey } }) =>
//   (event) => {
//     if (editor.selection && hotkey && isHotkey(hotkey, event)) {
//       toggleElement(editor, { activeType: BLOCKS.BUTTON, inactiveType: BLOCKS.BUTTON });
//     }
//   };

export const createButtonPlugin = (): RichTextPlugin => ({
  key: 'ButtonPlugin',
  softBreak: [
    // create a new line with SHIFT+Enter inside a heading
    {
      hotkey: 'shift+enter',
      query: {
        allow: TEXT_CONTAINERS,
      },
    },
  ],
  normalizer: [
    {
      match: {
        type: TEXT_CONTAINERS,
      },
      validChildren: (_, [node]) => isInlineOrText(node),
      transform: {
        [BLOCKS.PARAGRAPH]: transformUnwrap,
        default: transformLift,
      },
    },
  ],
  then: (_editor) => {
    return {
      exitBreak: [
        // Pressing ENTER at the start or end of a heading text inserts a
        // normal paragraph.
        {
          hotkey: 'enter',
          query: {
            allow: TEXT_CONTAINERS,
            end: true,
            start: true,
          },
        },
      ],
    } as Partial<RichTextPlugin>;
  },
  plugins: [
    {
      key: 'button',
      type: 'button',
      isElement: true,
      component: Button,
      options: {
        hotkey: [`mod+alt+b`],
      },
      handlers: {
        onKeyDown: buildHeadingEventHandler(BLOCKS.BUTTON),
      },
      deserializeHtml: {
        rules: [
          {
            validNodeName: 'button'.toUpperCase(),
          },
        ],
      },
    },
  ],
});
