import * as React from 'react';

import tokens from '@contentful/f36-tokens';
import { BLOCKS } from '@contentful/rich-text-types';
import { css } from 'emotion';
import { RenderElementProps } from 'slate-react';

const styles = {
  [BLOCKS.BUTTON]: css`
    line-height: ${tokens.lineHeightDefault};
    margin-bottom: 1.5em;
  `,
};

export function Button(props: RenderElementProps) {
  return (
    <div {...props.attributes} className={styles[BLOCKS.BUTTON]}>
      {props.children}
    </div>
  );
}
