import { convertSegmentsToString } from '../../editor/base/utils/parsesegments';
import { convertStringToSegments } from '../../editor/base/utils/editorToSegement';

type DynamicallyAddedParameterProps = {
    icon: string;
    title: string;
    value: ValueSegment[];
    onTitleChange: (title: string) => void;
    onValueChange: (valueSegments: ValueSegment[]) => void;
}

export const deserialize = (valueSegments: ValueSegment[]) => {
  const tokenMap = new Map();
  const jsonString = convertSegmentsToString(valueSegments, tokenMap);

  const schema = JSON.parse(jsonString);
  const tokenMapPerOutputValue = {};

  // TODO(WIFUN): right place for 'outputValueMap'?
  Object.entries(schema.outputValueMap || {}).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      tokenMapPerOutputValue[key] = convertStringToSegments(value, true, tokenMap);
    }
  });

  return {
    schema,
    tokenMapPerOutputValue
  };
}

export const getDynamicallyAddedParameterProps = (schema, tokenMapPerOutputValue, onTitleChange, onValueChange) => {
  const dynamicallyAddedParameterProps: DynamicallyAddedParameterProps[] = [];
  Object.entries(schema.properties || {}).forEach(([schemaKey, config]) => {
    if (config) {

      const valueAsString = schema.outputValueMap?.[schemaKey] || '';
      const valueSegments = convertStringToSegments(valueAsString, true, tokenMapPerOutputValue[schemaKey]);

      dynamicallyAddedParameterProps.push({
        icon: getIconForDynamicallyAddedParameterType(config['x-ms-content-hint']),
        title: config.title,
        value: valueSegments,
        onTitleChange,
        onValueChange
      })
    }
  });

  return dynamicallyAddedParameterProps;
}

export const serialize = (schema, tokenMapPerOutputValue) => {
  
}