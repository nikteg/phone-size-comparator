import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grommet,
  Header,
  RangeInput,
  Text,
  TextInput,
} from "grommet";
import { CreditCard, Search as SearchIcon } from "grommet-icons";
import { dark } from "grommet/themes";
import Fuse from "fuse.js";

function getSize(dimensions: string): { width: number; height: number } {
  const matches = dimensions.match(/(\d+\.?\d*) x (\d+\.?\d*)/);

  if (matches) {
    const [, heightString, widthString] = matches;
    const width = parseFloat(widthString);
    const height = parseFloat(heightString);
    return { width, height };
  }

  return { width: 0, height: 0 };
}

export interface SearchProps {
  fuse: Fuse<any>;
  onSearch: (item: any) => void;
}

export const Search: React.FC<SearchProps> = ({ onSearch, fuse }) => {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const result = fuse.search(query, { limit: 10 });
    setItems(result.map((r) => r.item));
  }, [fuse, query]);

  return (
    <TextInput
      placeholder={"Search phone"}
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      suggestions={items.map((item) => ({
        label: `${item.oem} ${item.model}`,
        value: item,
      }))}
      icon={<SearchIcon />}
      onSelect={({ suggestion: { label, value } }) => {
        onSearch(value);
        setQuery("");
      }}
      size={"small"}
    />
  );
};

export interface ItemProps {
  item: any;
  onRemove: () => void;
  scale: number;
}

export const Item: React.FC<ItemProps> = ({ item, onRemove, scale }) => {
  const { width, height } = getSize(item.body_dimensions);
  const newWidth = width * 4 * scale;
  const newHeight = (height / width) * newWidth;

  return (
    <Box
      border
      width={`${newWidth}px`}
      height={`${newHeight}px`}
      round={"small"}
      margin={"small"}
      background={"white"}
      flex={false}
      justify={"center"}
      align={"center"}
    >
      <Text margin={"small"} size={"small"}>
        {item.oem ? `${item.oem} ${item.model}` : item.model}
      </Text>
      <Button
        onClick={onRemove}
        label={"Remove"}
        size={"small"}
        margin={"xxsmall"}
      />
    </Box>
  );
};

export interface ZoomProps {
  scale: number;
  onChange: (zoom: number) => void;
}

export const ScaleSlider: React.FC<ZoomProps> = ({ scale, onChange }) => {
  return (
    <Box direction={"row"} align={"center"}>
      <RangeInput
        min={0.5}
        max={2}
        step={0.05}
        value={scale}
        onChange={(event: any) => onChange(event.target.value)}
      />
      <Text margin={{ left: "small" }}>{Math.trunc(scale * 100)}%</Text>
    </Box>
  );
};

const creditCard = {
  model: "Credit card",
  body_dimensions: "85.60 x 53.98",
};

export const App: React.FC = () => {
  const [fuse, setFuse] = useState<any>(null);
  const [items, setItems] = useState<any[]>([creditCard]);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    import("./phones.json").then((data: any) => {
      setFuse(new Fuse(data.devices, { keys: ["oem", "model"] }));
    });
  }, []);

  const addItem = (item: any) => {
    setItems([...items, item]);
  };

  const removeItem = (index: number) => () => {
    setItems(items.slice(0, index).concat(items.slice(index + 1)));
  };

  return (
    <Grommet full theme={dark}>
      {fuse ? (
        <>
          <Header pad={{ horizontal: "small", vertical: "xsmall" }}>
            <Box flex>
              <Text size={"large"} margin={"small"}>
                Phone size comparator
              </Text>
            </Box>
            <Box flex direction={"row"} align={"center"}>
              <Search fuse={fuse} onSearch={addItem} />
              <Button
                icon={<CreditCard />}
                onClick={() => addItem(creditCard)}
                title={"Add credit card"}
              />
            </Box>
            <Box flex>
              <ScaleSlider onChange={setScale} scale={scale} />
            </Box>
          </Header>
          <Box pad={"medium"} align={"center"}>
            <Box direction={"row"} flex>
              {items.map((item, index) => (
                <Item
                  scale={scale}
                  key={index}
                  item={item}
                  onRemove={removeItem(index)}
                />
              ))}
            </Box>
            <Text margin={"large"} textAlign={"center"}>
              Add phones by searching above...
              <br />
              Tip: Match the scale with a credit card to get a real world sense
              of how big a phone is.
            </Text>
          </Box>
        </>
      ) : (
        "Loading"
      )}
    </Grommet>
  );
};
