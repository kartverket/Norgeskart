import {
  Heading,
  Icon,
  PopoverArrow,
  PopoverBody,
  PopoverCloseTrigger,
  PopoverContent,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
  Text,
} from '@kvib/react';
import { useTranslation } from 'react-i18next';

export const ProjectionPopover = () => {
  const { t } = useTranslation();
  return (
    <PopoverRoot>
      <PopoverTrigger color="white">
        <Icon icon={'info'} />
      </PopoverTrigger>

      <PopoverContent>
        <PopoverCloseTrigger />
        <PopoverArrow />
        <PopoverBody>
          <PopoverTitle>
            <Heading size="md">
              {t('map.settings.layers.projection.popover.title')}
            </Heading>
          </PopoverTitle>
          <Text>{t('map.settings.layers.projection.popover.body')}</Text>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
  return <div>ProjectionPopover</div>;
};
