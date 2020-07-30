import React, { useEffect, useState } from "react";
import { Box, Button, Grommet, Header, Main, Text, TextInput } from "grommet";
import { Close, CreditCard, Search as SearchIcon } from "grommet-icons";
import { dark } from "grommet/themes";
import Fuse from "fuse.js";

import DATA from "./data.json";

function getSize(dimensions: string): { width: number; height: number } {
  const matches = dimensions.match(/(\d+\.?\d*) x (\d+\.?\d*)/);

  if (matches) {
    const [, widthString, heightString] = matches;
    const width = parseFloat(widthString);
    const height = parseFloat(heightString);
    return { width, height };
  }

  return { width: 0, height: 0 };
}

const fuse = new Fuse(DATA.data, {
  keys: ["device_name"],
});

export interface SearchProps {
  onSearch: (item: any) => void;
}

export const Search: React.FC<SearchProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const result = fuse.search(query);
    setItems(result.map((r) => r.item));
  }, [query]);

  return (
    <TextInput
      placeholder={"Search phone"}
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      suggestions={items.map((item) => ({
        label: item.device_name,
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

export interface PhoneProps {
  phone: any;
  color: string;
  onRemove: () => void;
}

export const Phone: React.FC<PhoneProps> = ({ phone, onRemove, color }) => {
  const { width, height } = getSize(phone.detail.body.dimensions);
  const newHeight = String((width / height) * 200);

  return (
    <Box
      align={"center"}
      margin={"small"}
      border
      width={"200px"}
      height={`${newHeight}px`}
      round={"small"}
      background={color}
      pad={"small"}
    >
      <Button
        onClick={onRemove}
        icon={<Close />}
        alignSelf={"end"}
        title={"Remove"}
      />
      <img
        alt={phone.device_name}
        src={phone.image_url}
        style={{ maxWidth: "100%" }}
      />
      <Text margin={"small"} size={"small"}>
        {phone.device_name}
      </Text>
      <Text size={"xsmall"}>
        {width} mm &times; {height} mm
      </Text>
    </Box>
  );
};

const visaCard = {
  device_name: "Credit card",
  image_url: `${process.env.PUBLIC_URL}/visa-card.png`,
  detail: {
    body: {
      dimensions: "85.60 x 53.98",
    },
  },
};

const initialData = [visaCard, ...DATA.data];

export const App: React.FC = () => {
  const [items, setItems] = useState<any[]>(initialData);

  const addItem = (item: any) => {
    setItems([...items, item]);
  };

  const removeItem = (index: number) => () => {
    setItems(items.slice(0, index).concat(items.slice(index + 1)));
  };

  return (
    <Grommet full theme={dark}>
      <Header pad={{ horizontal: "small", vertical: "xsmall" }}>
        <Box flex>
          <Text size={"large"} margin={"small"}>
            Phone size comparator
          </Text>
        </Box>
        <Box flex direction={"row"} align={"center"}>
          <Search onSearch={addItem} />
          <Button
            icon={<CreditCard />}
            onClick={() => addItem(visaCard)}
            title={"Add credit card"}
          />
        </Box>
        <Box flex />
      </Header>
      <Main pad={"medium"} fill align={"center"}>
        <Text margin={"large"}>Add phones by searching above...</Text>
        <Box direction={"row"} flex>
          {items.map((item, index) => (
            <Phone
              key={index}
              phone={item}
              onRemove={removeItem(index)}
              color={`hsla(${(index * 20) % 360}deg, 100%, 50%, 0.4)`}
            />
          ))}
        </Box>
      </Main>
    </Grommet>
  );
};
