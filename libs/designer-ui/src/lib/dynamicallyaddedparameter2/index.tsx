import type { IContextualMenuProps } from '@fluentui/react';
import { DirectionalHint, IconButton, TextField, TooltipHost } from '@fluentui/react';
import React from 'react';
import { useIntl } from 'react-intl';

export const DynamicallyAddedParameterType = {
  Text: 'TEXT',
  File: 'FILE',
  Email: 'EMAIL',
  Boolean: 'BOOLEAN',
  Number: 'NUMBER',
  Date: 'DATE',
} as const;
export type DynamicallyAddedParameterTypeType = (typeof DynamicallyAddedParameterType)[keyof typeof DynamicallyAddedParameterType];

export interface DynamicallyAddedParameterProps {
  schemaKey: string;
  icon: string;
  title: string;
  onTitleChange: (schemaKey: string, newValue: string) => void;
  onDelete: (schemaKey: string) => void;
  onRenderValueField: (schemaKey: string) => JSX.Element;
}

export const DynamicallyAddedParameter = (props: DynamicallyAddedParameterProps): JSX.Element => {
  const intl = useIntl();

  const renderMenuButton = (): JSX.Element => {
    const menuButtonTitle = intl.formatMessage({
      defaultMessage: 'Menu',
      description: 'Open dynamically added parameter options menu',
    });

    const deleteText = intl.formatMessage({
      defaultMessage: 'Delete',
      description: 'Delete dynamic parameter corresponding to this row',
    });

    const menuProps: IContextualMenuProps = {
      shouldFocusOnMount: true,
      items: [
        {
          iconProps: { iconName: 'Delete' },
          key: 'dynamicallyaddedparameter_menu_delete',
          text: deleteText,
          onClick: (ev?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
            ev?.preventDefault();
            props.onDelete(props.schemaKey);
            return true;
          },
        },
      ],
      gapSpace: 2,
      directionalHint: DirectionalHint.leftBottomEdge,
    };

    return (
      <TooltipHost content={menuButtonTitle}>
        <IconButton
          className="msla-button msla-card-header-menu-button"
          iconProps={{ iconName: 'CollapseMenu' }}
          title={menuButtonTitle}
          aria-label={menuButtonTitle}
          menuProps={menuProps}
        />
      </TooltipHost>
    );
  };

  const renderDynamicParameterContainer = (): JSX.Element => {
    const iconStyle = {
      background: `url('${props.icon}') no-repeat center`,
      backgroundSize: 'contain',
    };

    const onTitleChange = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
      e.preventDefault();
      props.onTitleChange(props.schemaKey, newValue || '');
    };

    return (
      <div className="msla-dynamic-added-param-header">
        <div className="msla-dynamic-added-param-icon" style={iconStyle}></div>
        <div className="msla-dynamic-added-param-inputs-container">
          {/* TODO(wifun): handle duplicate names, empty title validation */}
          <TextField className="msla-dynamic-added-param-title" value={props.title} onChange={onTitleChange} />
          {/* TODO(wifun): pick a new classname */}
          <div className="msla-dynamic-added-param-description">
            {props.onRenderValueField(props.schemaKey)}
          </div>
        </div>
        <div className="msla-dynamic-add-param-menu-container">{renderMenuButton()}</div>
      </div>
    );
  };

  return (
    <div className="msla-dynamic-added-param-container">
      {renderDynamicParameterContainer()}
      <div className="msla-dynamic-added-param-bottom-divider" />
    </div>
  );
};
