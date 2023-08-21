import type { DynamicallyAddedParameterProps, DynamicallyAddedParameterTypeType } from '../../dynamicallyaddedparameter2';
import { DynamicallyAddedParameter, DynamicallyAddedParameterType } from '../../dynamicallyaddedparameter2';
import type { ValueSegment } from '../../editor';
import type { BasePlugins, ChangeHandler, ChangeState, GetTokenPickerHandler } from '../../editor/base';
import { getMenuItemsForDynamicAddedParameters } from '../helper';
import { KeyCodes } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';
import { ValidationErrorCode, ValidationException } from '@microsoft/utils-logic-apps';
import React from 'react';
import { useIntl } from 'react-intl';
import { generateDynamicParameterKey, getIconForDynamicallyAddedParameterType } from '../../dynamicallyaddedparameter2/helper';
import constants from '../../constants';
import { StringEditor } from '../../editor/string';
import type { TokenPickerButtonEditorProps } from '../../editor/base/plugins/tokenpickerbutton';

// TODO(WIFUN): fix imports

export enum FloatingActionMenuKind {
  inputs = 'inputs',
  outputs = 'ouputs'
}

type FloatingActionMenuItem = {
  type: DynamicallyAddedParameterTypeType;
  icon: string;
  label: string;
};

type DynamicallyAddedParameterDateConfig = DynamicallyAddedParameterBaseConfig & {
  format: string;
};

type DynamicallyAddedParameterEmailConfig = DynamicallyAddedParameterBaseConfig & {
  format: string;
};

type DynamicallyAddedParameterFileConfig = DynamicallyAddedParameterBaseConfig & {
  properties: {
    name: {
      type: string;
    };
    contentBytes: {
      type: string;
      format: string;
    };
  };
};

type DynamicallyAddedParameterBaseConfig = {
  type: string;
  title: string;
  'x-ms-content-hint': DynamicallyAddedParameterTypeType;
  'x-ms-dynamically-added': boolean;
};

type DynamicallyAddedParameterConfig = DynamicallyAddedParameterBaseConfig | DynamicallyAddedParameterDateConfig | DynamicallyAddedParameterEmailConfig | DynamicallyAddedParameterFileConfig;

type FloatingActionMenuOutputViewModel = {
  type: string;
  properties: Record<string, DynamicallyAddedParameterConfig>;
  additionalProperties: {
    outputValueMap: Record<string, ValueSegment[]>;
  }
};

type FloatingActionMenuOutputsProps = {
  supportedTypes: string[];
  initialValue: ValueSegment[];
  onChange?: ChangeHandler;
  editorViewModel: FloatingActionMenuOutputViewModel;
  BasePlugins: BasePlugins;
  tokenPickerButtonProps: TokenPickerButtonEditorProps | undefined;
  getTokenPicker: GetTokenPickerHandler;
}

export const FloatingActionMenuOutputs = (props: FloatingActionMenuOutputsProps): JSX.Element => {
  const intl = useIntl();

  const [expanded, { toggle: toggleExpanded }] = useBoolean(false);

  if (!props.supportedTypes?.length) {
    throw new ValidationException(ValidationErrorCode.INVALID_PARAMETERS, 'supportedTypes are necessary.');
  }
  const menuItems = getMenuItemsForDynamicAddedParameters(props.supportedTypes);

  // Set an empty schema object in the value so that the object structure is what Flow-RP expects.
  // if (props.initialValue.length > 0 && !props.initialValue[0].value) {
  //   const { onChange } = props;
  //   if (onChange) {
  //     const value = getEmptySchemaValueSegmentForInitialization(!!props.useStaticInputs);
  //     onChange({ value });
  //   }
  // }

  const dynamicParameterProps: DynamicallyAddedParameterProps[] = Object.entries(props.editorViewModel.properties)
  .filter(([_key, config]) => {
    return config['x-ms-dynamically-added'];
  })
  .map(([key, config]) => {
    return {
      schemaKey: key,
      icon: getIconForDynamicallyAddedParameterType(config['x-ms-content-hint']),
      title: config.title,
      onTitleChange: onDynamicallyAddedParameterTitleChange,
      onDelete: onDynamicallyAddedParameterDelete,
      onRenderValueField
    }
  });

  const onDynamicallyAddedParameterTitleChange = (schemaKey: string, newValue: string) => {
    const { onChange } = props;
    if (onChange) {
      const viewModel = {
        ...props.editorViewModel
      };
      viewModel.properties[schemaKey].title = newValue;
      onChange({ value: props.initialValue, viewModel });
    }
  };

  const onDynamicallyAddedParameterDelete = (schemaKey: string) => {
    const { onChange } = props;
    if (onChange) {
      const viewModel = {
        ...props.editorViewModel
      };
      delete viewModel.properties[schemaKey];
      delete viewModel.additionalProperties.outputValueMap[schemaKey];

      onChange({ value: props.initialValue, viewModel });
    }
  };

  const onRenderValueField = (schemaKey: string) => {
    const placeholder = intl.formatMessage({ defaultMessage: 'Enter a value to respond', description: 'Placeholder for output value field' });
    const onDynamicallyAddedParameterValueChange = (schemaKey: string, newValue: ValueSegment[]) => {
      const { onChange } = props;
      if (onChange) {
        const viewModel = {
          ...props.editorViewModel
        };
        viewModel.additionalProperties.outputValueMap[schemaKey] = newValue;
        onChange({ value: props.initialValue, viewModel });
      }
    };

    return (
      <StringEditor
          className="msla-setting-token-editor-container"
          placeholder={placeholder}
          BasePlugins={props.BasePlugins}
          readonly={false}
          initialValue={props.editorViewModel.additionalProperties.outputValueMap[schemaKey]}
          tokenPickerButtonProps={props.tokenPickerButtonProps}
          // editorBlur={onValueChange}
          getTokenPicker={props.getTokenPicker}
          onChange={(newState: ChangeState) => onDynamicallyAddedParameterValueChange(schemaKey, newState.value)}
          dataAutomationId={`msla-setting-token-editor-floatingActionMenuOutputs-${schemaKey}`}
        />
    );
  }

  const toggleExpandedOnKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const { keyCode } = e;

    if (keyCode === KeyCodes.enter || keyCode === KeyCodes.space) {
      e.preventDefault();
      e.stopPropagation();
      toggleExpanded();
    }
  };

  const renderMenuButton = (): JSX.Element => {
    const collapsedTitle = intl.formatMessage({ defaultMessage: 'Add an output', description: 'Button to add a dynamically added parameter' });

    return (
      <div role="button" className="msla-floating-action-menu" onClick={toggleExpanded} onKeyDown={toggleExpandedOnKeyDown} tabIndex={0}>
        <span className="msla-floating-action-menu-plus-icon">{'+'}</span>
        <span className="msla-floating-action-menu-title">{collapsedTitle}</span>
      </div>
    );
  };

  const renderMenuItemsHeader = (): JSX.Element => {
    const closeErrorButtonAriaLabel = intl.formatMessage({
      defaultMessage: 'Close',
      description: 'Close button aria label',
    });
    const expandedTitle = intl.formatMessage({
      defaultMessage: 'Choose the type of output',
      description: 'Button to choose data type of the dynamically added parameter',
    });

    return (
      <div>
        <span className="msla-floating-action-menu-items-title">{expandedTitle}</span>
        <span
          role="button"
          aria-label={closeErrorButtonAriaLabel}
          className="msla-floating-action-menu-items-close"
          onClick={toggleExpanded}
          onKeyDown={toggleExpandedOnKeyDown}
          tabIndex={0}
        >
          {'x'}
        </span>
      </div>
    );
  };

  const renderMenuItem = (menuItem: FloatingActionMenuItem): JSX.Element => {
    const itemStyle = {
      background: `url('${menuItem.icon}') no-repeat center`,
    };

    const handleMenuItemSelected = (item: FloatingActionMenuItem) => {
      toggleExpanded();
  
      const { onChange } = props;
        if (onChange) {
          const viewModel = {
            ...props.editorViewModel
          };
  
          const schemaKey = generateDynamicParameterKey(Object.keys(props.editorViewModel.properties), item.type);
  
          let format, fileProperties;
          let type = '';
          switch (item.type) {
            case DynamicallyAddedParameterType.Date:
            case DynamicallyAddedParameterType.Email:
              type = constants.SWAGGER.TYPE.STRING;
              format = item.type.toLowerCase();
              break;
            case DynamicallyAddedParameterType.Text:
              type = constants.SWAGGER.TYPE.STRING;
              break;
            case DynamicallyAddedParameterType.File:
              type = constants.SWAGGER.TYPE.OBJECT;
              fileProperties = {
                contentBytes: { type: constants.SWAGGER.TYPE.STRING, format: constants.SWAGGER.FORMAT.BYTE },
                name: { type: constants.SWAGGER.TYPE.STRING },
              };
              break;
            case DynamicallyAddedParameterType.Boolean:
              type = constants.SWAGGER.TYPE.BOOLEAN;
              break;
            case DynamicallyAddedParameterType.Number:
              type = constants.SWAGGER.TYPE.NUMBER;
              break;
          }
          viewModel.properties[schemaKey] = {
            format,
            title: '',
            type,
            properties: fileProperties,
            'x-ms-content-hint': item.type,
            'x-ms-dynamically-added': true,
          };
  
          onChange({ value: props.initialValue, viewModel });
        }
    };

    const handleMenuItemSelectedOnKeyDown = (e: React.KeyboardEvent<HTMLElement>, item: FloatingActionMenuItem) => {
      const { keyCode } = e;

      if (keyCode === KeyCodes.enter || keyCode === KeyCodes.space) {
        e.preventDefault();
        e.stopPropagation();
        handleMenuItemSelected(item);
      }
    };

    if (menuItems.length === 1) {
      return (
        <div
          role="button"
          aria-label={menuItem.label}
          tabIndex={0}
          className="msla-floating-action-menu-item-vertical-container"
          onClick={() => handleMenuItemSelected(menuItem)}
          onKeyDown={(e: React.KeyboardEvent<HTMLElement>): void => handleMenuItemSelectedOnKeyDown(e, menuItem)}
        >
          <div className="msla-menu-item-logo" style={itemStyle} />
          <span className="msla-vertical-menu-item-label">{menuItem.label}</span>
        </div>
      );
    } else {
      return (
        <div key={menuItem.type} className="msla-floating-action-menu-item-horizontal-container">
          <div
            role="button"
            aria-label={menuItem.label}
            tabIndex={0}
            className="msla-menu-item-logo"
            style={itemStyle}
            onClick={() => handleMenuItemSelected(menuItem)}
            onKeyDown={(e: React.KeyboardEvent<HTMLElement>): void => handleMenuItemSelectedOnKeyDown(e, menuItem)}
          />
          <span className="msla-horizontal-menu-item-label">{menuItem.label}</span>
        </div>
      );
    }
  };

  const renderMenuItems = (): JSX.Element => {
    return (
      <div className="msla-floating-action-menu-items-container">
        {renderMenuItemsHeader()}
        <div className="msla-floating-action-menu-items">
          {menuItems.map((item: FloatingActionMenuItem) => {
            return renderMenuItem(item);
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="msla-dynamic-added-params-container">
        {dynamicParameterProps.map((props) =>
          <DynamicallyAddedParameter {...props} key={props.schemaKey} />
        )}
      </div>
      <div className="msla-floating-action-menu-container">
        {expanded ? renderMenuItems() : renderMenuButton()}
      </div>
    </>
  );
};
