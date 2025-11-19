import {
    createListCollection,
    SelectContent,
    SelectItem,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { availableScales, scaleAtom } from '../map/atoms';



export const ScaleSelector = () => {
    const [scale, setScale] = useAtom(scaleAtom);

    const scaleCollection = availableScales.map((s) => ({
        value: String(s),
        label: `Målestokk 1 : ${s.toLocaleString('no-NO')}`,
    }));
    return (
        <SelectRoot
            width="200px"
            size="sm"
            value={[String(scale)]}
            collection={createListCollection({ items: scaleCollection })}
            defaultValue={[String(scale)]}
        >
            <SelectTrigger>
                <SelectValueText
                    placeholder={`Målestokk 1 : ${scale}`}
                ></SelectValueText>
            </SelectTrigger>
            <SelectContent>
                {scaleCollection.map((item) => (
                    <SelectItem
                        key={item.value}
                        item={item.value}
                        onClick={() => setScale(Number(item.value))}
                    >
                        {item.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </SelectRoot>
    );
};
