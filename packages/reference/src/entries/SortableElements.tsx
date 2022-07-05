console.log('LINKED REFERENCE 2');
import React, { useState, useEffect } from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

import { ReferenceEditorProps } from '../common/ReferenceEditor';
import { ContentType, ReferenceValue } from '../types';
import { FetchingWrappedEntryCard } from './WrappedEntryCard/FetchingWrappedEntryCard';



const styles = {
  containter: css({
    position: 'relative',
  }),
  item: css({
    marginBottom: tokens.spacingM,
  }),
};

type SortableLinkListProps = ReferenceEditorProps & {
  items: ReferenceValue[];
  setValue: (value: ReferenceValue[]) => void;
  isDisabled: boolean;
  allContentTypes: ContentType[];
  onMove: (oldIndex: number, newIndex: number) => void;
};

const DragHandle = (props: { drag: React.ReactElement }) => {
  const SortableDragHandle = SortableHandle(() => props.drag);
  return <SortableDragHandle />;
};

const SortableLink = SortableElement((props: { children: React.ReactElement }) => (
  <div className={styles.item}>{props.children}</div>
));

const SdkWrapper = ({
  generateSdk,
  spaceId,
  children,
}: Pick<ReferenceEditorProps, 'generateSdk'> & {
  spaceId: string;
  children: (sdk: FieldExtensionSDK) => React.ReactNode;
}) => {
  const [sdk, setSdk] = useState<FieldExtensionSDK>();

  useEffect(() => {
    if (!generateSdk) {
      return;
    }
    generateSdk({ spaceId }).then(setSdk);
  }, [setSdk, generateSdk, spaceId]);

  if (!sdk) {
    return null;
  }

  return <>{children(sdk)}</>;
};
export const SortableLinkList = SortableContainer((props: SortableLinkListProps) => {
  const spaceId = window.localStorage.get('resource_space_id') || 'spaceA';
  props.items = [
    {
      sys: {
        type: 'Link',
        linkType: 'Entry',
        id: window.localStorage.get('resource_entry_id') || 'entryA',
      },
    },
  ];
  const lastIndex = props.items.length - 1;
  return (
    <div className={styles.containter}>
      {props.items.map((item, index) => (
        <SortableLink disabled={props.isDisabled} key={`${item.sys.id}-${index}`} index={index}>
          <SdkWrapper
            generateSdk={props.generateSdk || (() => Promise.resolve(props.sdk))}
            spaceId={spaceId}>
            {(sdk: FieldExtensionSDK) => {
              return (
                <FetchingWrappedEntryCard
                  {...props}
                  sdk={sdk}
                  key={`${item.sys.id}-${index}`}
                  index={index}
                  allContentTypes={props.allContentTypes}
                  isDisabled={props.isDisabled}
                  entryId={item.sys.id}
                  onRemove={() => {
                    props.setValue(
                      props.items.filter((_value, i) => {
                        return i !== index;
                      })
                    );
                  }}
                  onMoveTop={index !== 0 ? () => props.onMove(index, 0) : undefined}
                  onMoveBottom={
                    index !== lastIndex ? () => props.onMove(index, lastIndex) : undefined
                  }
                  renderDragHandle={props.isDisabled ? undefined : DragHandle}
                />
              );
            }}
          </SdkWrapper>
        </SortableLink>
      ))}
    </div>
  );
});
