import { Box, HStack, VStack } from '@kvib/react';

import {
  FeatureTypeStyle,
  LineSymbolizer,
  NamedLayer,
  PointSymbolizer,
  PolygonSymbolizer,
  Rule,
  StyledLayerDescriptor,
  TextSymbolizer,
  UserStyle,
} from '../types/StyledMapDescriptor';

const PointSymbolizerPart = ({
  symbolizer,
}: {
  symbolizer: PointSymbolizer;
}) => {
  console.log(symbolizer);
  return <Box>Point Symbolizer</Box>;
};
const LineSymbolizerPart = ({ symbolizer }: { symbolizer: LineSymbolizer }) => {
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
    <HStack>
      <Box>Line</Box>
      <Box
        height={'28px'}
        width={'28px'}
        bg={'transparent'}
        borderWidth={width}
        borderColor={color}
      ></Box>
    </HStack>
  );
};
const PolygonSymbolizerPart = ({
  symbolizer,
}: {
  symbolizer: PolygonSymbolizer;
}) => {
  let color;
  let opacity;
  const svgParams = symbolizer.Fill?.SvgParameter;
  const cssParams = symbolizer.Fill?.CssParameter;
  if (svgParams) {
    color = svgParams[0];
    opacity = svgParams[1];
  } else if (cssParams) {
    color = cssParams[0];
    opacity = cssParams[1];
  }

  return (
    <HStack>
      <Box>Polygon</Box>
      <Box
        height={'28px'}
        width={'28px'}
        bgColor={color}
        opacity={opacity}
      ></Box>
    </HStack>
  );
};
const TextSymbolizerPart = ({ symbolizer }: { symbolizer: TextSymbolizer }) => {
  console.log(symbolizer);
  return <Box>Text</Box>;
};

const RulePart = ({ rule }: { rule: Rule }) => {
  return (
    <VStack align={'flex-start'}>
      <Box>
        {rule.PointSymbolizer && (
          <PointSymbolizerPart symbolizer={rule.PointSymbolizer} />
        )}
        {rule.LineSymbolizer && (
          <LineSymbolizerPart symbolizer={rule.LineSymbolizer} />
        )}
        {rule.PolygonSymbolizer && (
          <PolygonSymbolizerPart symbolizer={rule.PolygonSymbolizer} />
        )}
        {rule.TextSymbolizer && (
          <TextSymbolizerPart symbolizer={rule.TextSymbolizer} />
        )}
      </Box>
    </VStack>
  );
};

const FeatureTypeStylePart = ({ fts }: { fts: FeatureTypeStyle }) => {
  return (
    <Box>
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
    <HStack justify={'space-between'}>
      <Box>{style.Name}</Box>
      <Box>
        {Array.isArray(style.FeatureTypeStyle) ? (
          style.FeatureTypeStyle.map((fts, index) => (
            <FeatureTypeStylePart key={index} fts={fts} />
          ))
        ) : (
          <FeatureTypeStylePart fts={style.FeatureTypeStyle} />
        )}
      </Box>
    </HStack>
  );
};

const NamedLayerPart = ({ namedLayer }: { namedLayer: NamedLayer }) => {
  return (
    <HStack key={namedLayer.Name} justifyContent={'space-between'}>
      <Box>{namedLayer.Name} </Box>
      {Array.isArray(namedLayer.UserStyle) ? (
        namedLayer.UserStyle.map((s) => <UserStylePart style={s} />)
      ) : (
        <UserStylePart style={namedLayer.UserStyle} />
      )}
    </HStack>
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
