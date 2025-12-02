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

type ProjectionPopoverProps = {
  isToolbar?: boolean;
};

export const ProjectionPopover = (props: ProjectionPopoverProps) => {
  const { t } = useTranslation();
  const iconColor = props.isToolbar ? 'white' : 'black';

  return (
    <PopoverRoot>
      <PopoverTrigger>
        <Icon icon={'info'} color={iconColor} />
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
