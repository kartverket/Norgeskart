import { Box, HStack, Text, useKvibContext, VStack } from '@kvib/react';

import {
  FeatureTypeStyle,
  Fill,
  LineSymbolizer,
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

const PointSymbolizerPart = ({
  symbolizer,
  text,
}: {
  symbolizer: PointSymbolizer;
  text?: string;
}) => {
  console.log(symbolizer);
  return <Box>{text}</Box>;
};
const LineSymbolizerPart = ({
  symbolizer,
  text,
}: {
  symbolizer: LineSymbolizer;
  text?: string;
}) => {
  let color;
  let width;
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
    <HStack justify="space-between" align="end" w={'100%'}>
      <Text mr={2}>{text}</Text>
      <svg width="28" height="28">
        <polyline
          points="2,14 7,7 14,21 21,7 26,14"
          fill="none"
          stroke={color}
          strokeWidth={width}
        />
      </svg>
    </HStack>
  );
};
const PolygonSymbolizerPart = ({
  symbolizer,
  text,
}: {
  symbolizer: PolygonSymbolizer | PolygonSymbolizer[];
  text?: string;
}) => {
  const { fill, stroke } = getParamsFromPolygonSymboliser(symbolizer);
  const { color, opacity } = fill
    ? getParamsFromFill(fill)
    : { color: undefined, opacity: 0 };

  const { strokeColor, strokeWidth } = stroke
    ? getParamsFromStroke(stroke)
    : { strokeColor: undefined, strokeWidth: 0 };
  return (
    <HStack justify="space-between" align="end" w={'100%'}>
      <Text mr={2}>{text}</Text>
      <Box
        height={'28px'}
        width={'28px'}
        bgColor={color}
        border={`${strokeWidth}px solid ${strokeColor}`}
        opacity={opacity}
      ></Box>
    </HStack>
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
    <HStack justify="space-between" align="end" w={'100%'}>
      <Text mr={2}>{text}</Text>
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
    </HStack>
  );
};

const RulePart = ({ rule }: { rule: Rule }) => {
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
  return (
    <>
      {Array.isArray(namedLayer.UserStyle) ? (
        namedLayer.UserStyle.map((s) => <UserStylePart style={s} />)
      ) : (
        <UserStylePart style={namedLayer.UserStyle} />
      )}
    </>
  );
};

export const Symbolology = ({
  activeThemeLayers,
  heading,
}: {
  activeThemeLayers: StyledLayerDescriptor;
  heading: string;
}) => {
  return (
    <>
      {Array.isArray(activeThemeLayers.NamedLayer) ? (
        activeThemeLayers.NamedLayer.map((l) => (
          <NamedLayerPart key={heading + l.Name} namedLayer={l} />
        ))
      ) : (
        <NamedLayerPart namedLayer={activeThemeLayers.NamedLayer} />
      )}
    </>
  );
};
