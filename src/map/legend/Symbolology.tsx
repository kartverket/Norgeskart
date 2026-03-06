import { Box, HStack, Text, useKvibContext, VStack } from '@kvib/react';
import { ReactNode } from 'react';
import { ThemeLayerDefinition } from '../../api/themeLayerConfigApi';
import {
  FeatureTypeStyle,
  Fill,
  LineSymbolizer,
  Mark,
  NamedLayer,
  PointSymbolizer,
  PolygonSymbolizer,
  Rule,
  Stroke,
  StyledLayerDescriptor,
  TextSymbolizer,
  UserStyle,
} from '../types/StyledMapDescriptor';

const getParamsFromPolygonSymboliser = (
  symbolizer?: PolygonSymbolizer | PolygonSymbolizer[],
) => {
  if (!symbolizer) {
    return { fill: undefined, stroke: undefined };
  }
  let fill;
  if (Array.isArray(symbolizer)) {
    fill = symbolizer[0].Fill;
  } else {
    fill = symbolizer.Fill;
  }
  let stroke;
  if (Array.isArray(symbolizer)) {
    stroke = symbolizer[1].Stroke;
  } else {
    stroke = symbolizer.Stroke;
  }

  return { fill, stroke };
};

const getParamsFromFill = (fill: Fill) => {
  let color;
  let opacity;
  const svgParams = fill.SvgParameter;
  const cssParams = fill.CssParameter;
  if (svgParams) {
    if (Array.isArray(svgParams)) {
      color = svgParams[0];
      opacity = svgParams[1];
    } else {
      color = svgParams;
    }
  } else if (cssParams) {
    if (Array.isArray(cssParams)) {
      color = cssParams[0];
      opacity = cssParams[1];
    } else {
      color = cssParams;
    }
  }
  return { color, opacity };
};

const getParamsFromStroke = (stroke: Stroke) => {
  let strokeColor;
  let strokeWidth;
  const svgParams = stroke.SvgParameter;
  const cssParams = stroke.CssParameter;
  if (svgParams) {
    strokeColor = svgParams[0];
    strokeWidth = svgParams[1];
  } else if (cssParams) {
    strokeColor = cssParams[0];
    strokeWidth = cssParams[2];
  }
  return { strokeColor, strokeWidth };
};

const SymbolLine = ({
  text,
  children,
}: {
  text?: string;
  children: ReactNode | string;
}) => {
  return (
    <HStack justify="flex-start" align="center" w={'100%'}>
      {children}
      <Text ml={1} fontSize="sm">
        {text}
      </Text>
    </HStack>
  );
};

const MarkSymbol = ({ mark }: { mark: Mark }) => {
  const { color } = getParamsFromFill(mark.Fill!);
  switch (mark.WellKnownName) {
    case 'circle':
      return <circle cx="14" cy="14" r="10" fill={color} />;
    case 'square':
      return <rect x="4" y="4" width="20" height="20" fill={color} />;
    case 'triangle':
      return <polygon points="14,4 24,24 4,24" fill={color} />;
    default:
      return <rect x="4" y="4" width="20" height="20" fill={color} />;
  }
};

const PointSymbolizerPart = ({
  symbolizer,
  text,
}: {
  symbolizer: PointSymbolizer;
  text?: string;
}) => {
  const symbolizers = Array.isArray(symbolizer) ? symbolizer : [symbolizer];
  return (
    <SymbolLine text={text}>
      <svg width="28" height="28">
        {symbolizers.map((symbolizer, i) =>
          symbolizer.Graphic?.Mark ? (
            <MarkSymbol key={i} mark={symbolizer.Graphic.Mark} />
          ) : null
        )}
      </svg>
    </SymbolLine>
  );
};
const LineSymbolizerPart = ({
  symbolizer,
  text,
}: {
  symbolizer: LineSymbolizer;
  text?: string;
}) => {
  console.log('line symbolizer', symbolizer);
  const symbolizers = Array.isArray(symbolizer) ? symbolizer : [symbolizer];

  return (
    <SymbolLine text={text}>
      <svg width="28" height="28">
        {symbolizers.map((symbolizer, i) => {
          let color, width;
          const svgParams = symbolizer.Stroke?.SvgParameter;
          const cssParams = symbolizer.Stroke?.CssParameter;
          if (svgParams) {
            color = svgParams[0];
            width = svgParams[1];
          } else if (cssParams) {
            color = cssParams[0];
            width = cssParams[2];
          }
          return (
            <polyline
              key={i}
              points="2,14 7,7 14,21 21,7 26,14"
              fill="none"
              stroke={color}
              strokeWidth={width}
            />
          );
        })}
      </svg>
    </SymbolLine>
  );
};
const PolygonSymbolizerPart = ({
  symbolizer,
  text,
}: {
  symbolizer: PolygonSymbolizer | PolygonSymbolizer[];
  text?: string;
}) => {
  console.log('polygon symbolizer', symbolizer);
  const { fill, stroke } = getParamsFromPolygonSymboliser(symbolizer);
  console.log('oh hi mark', fill?.GraphicFill);
  const graphicFillMark = fill?.GraphicFill?.Graphic.Mark;

  if (graphicFillMark) {
    return (
      <SymbolLine text={text}>
        <svg width="28" height="28">
          <MarkSymbol mark={graphicFillMark} />
        </svg>
      </SymbolLine>
    );
  }

  const { color, opacity } = fill
    ? getParamsFromFill(fill)
    : { color: undefined, opacity: 0 };

  const { strokeColor, strokeWidth } = stroke
    ? getParamsFromStroke(stroke)
    : { strokeColor: undefined, strokeWidth: 0 };

  return (
    <SymbolLine text={text}>
      <Box
        height={'28px'}
        width={'28px'}
        bgColor={color}
        border={`${strokeWidth}px solid ${strokeColor}`}
        opacity={opacity}
      ></Box>
    </SymbolLine>
  );
};
const TextSymbolizerPart = ({
  symbolizer,
  text,
}: {
  symbolizer: TextSymbolizer;
  text?: string;
}) => {
  const system = useKvibContext();
  const bgColor = system.token('colors.gray.100');

  const { color } = symbolizer.Fill
    ? getParamsFromFill(symbolizer.Fill)
    : { color: 'black' };

  const { color: haloColor, radius } = symbolizer.Halo
    ? {
      color: symbolizer.Halo.Fill.SvgParameter,
      radius: symbolizer.Halo.Radius * 2,
    }
    : { color: undefined };
  return (
    <SymbolLine text={text}>
      <Box
        color={color}
        backgroundColor={bgColor}
        p={1}
        borderRadius={'4px'}
        textShadow={
          haloColor
            ? `${radius}px ${radius}px ${radius}px ${haloColor}`
            : undefined
        }
      >
        {symbolizer.Label}
      </Box>
    </SymbolLine>
  );
};

const RulePart = ({ rule }: { rule: Rule }) => {
  console.log('RulePart: rule', rule);
  return (
    <VStack align={'flex-start'} w={'100%'}>
      {rule.PointSymbolizer && (
        <PointSymbolizerPart
          symbolizer={rule.PointSymbolizer}
          text={rule.Name}
        />
      )}
      {rule.LineSymbolizer && (
        <LineSymbolizerPart symbolizer={rule.LineSymbolizer} text={rule.Name} />
      )}
      {rule.PolygonSymbolizer && (
        <PolygonSymbolizerPart
          symbolizer={rule.PolygonSymbolizer}
          text={rule.Name}
        />
      )}
      {rule.TextSymbolizer && (
        <TextSymbolizerPart symbolizer={rule.TextSymbolizer} text={rule.Name} />
      )}
    </VStack>
  );
};

const FeatureTypeStylePart = ({ fts }: { fts: FeatureTypeStyle }) => {
  return (
    <Box w={'100%'}>
      {Array.isArray(fts.Rule) ? (
        fts.Rule.map((rule) => <RulePart key={rule.Name} rule={rule} />)
      ) : (
        <RulePart rule={fts.Rule} />
      )}
    </Box>
  );
};

const UserStylePart = ({ style }: { style: UserStyle }) => {
  return (
    <HStack justify={'space-between'} w={'100%'}>
      {Array.isArray(style.FeatureTypeStyle) ? (
        style.FeatureTypeStyle.map((fts, index) => (
          <FeatureTypeStylePart key={index} fts={fts} />
        ))
      ) : (
        <FeatureTypeStylePart fts={style.FeatureTypeStyle} />
      )}
    </HStack>
  );
};

const NamedLayerPart = ({ namedLayer }: { namedLayer: NamedLayer }) => {
  const userStyles = Array.isArray(namedLayer.UserStyle)
    ? namedLayer.UserStyle
    : [namedLayer.UserStyle];
  return userStyles.map((s) => <UserStylePart style={s} />);
};

export const Symbolology = ({
  layerDescriptor,
  layerConfig,
  heading,
}: {
  layerDescriptor: StyledLayerDescriptor;
  layerConfig: ThemeLayerDefinition;
  heading: string;
}) => {

  console.log('Symbolology: layerDescriptor', layerDescriptor);
  const descriptors = (
    Array.isArray(layerDescriptor.NamedLayer)
      ? layerDescriptor.NamedLayer
      : [layerDescriptor.NamedLayer]
  ).filter(
    (l) =>
      layerConfig.legendLayerNames == null ||
      layerConfig.legendLayerNames.includes(l.Name),
  );
  console.log('Symbolology: descriptors', descriptors);
  return descriptors.map((l) => (
    <NamedLayerPart key={heading + l.Name} namedLayer={l} />
  ));
};
