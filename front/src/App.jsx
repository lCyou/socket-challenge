import React, { useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { Column } from "./components/Column";
import { Item } from "./components/Item";
import "./index.css";

export default function App() {
  const [items, setItems] = useState({
    hoge: [
      { id: 1, name: "alice" },
      { id: 2, name: "bob" },
      { id: 3, name: "charlie" },
    ],
    fuga: [
      { id: 4, name: "dave" },
      { id: 5, name: "eve" },
      { id: 6, name: "frank" },
      { id: 7, name: "george" },
    ],
    piyo: [
      { id: 8, name: "hank" },
      { id: 9, name: "ian" },
      { id: 10, name: "jack" },
    ],
  });

  return (
    <DragDropProvider
      onDragOver={(event) => {
        setItems((items) => move(items, event));
      }}
    >
      <div className="Root">
        {Object.entries(items).map(([column, items]) => (
          <Column key={column} id={column}>
            {items.map((item, index) => (
              <Item key={item.id} id={item.id} index={index} column={column}>
                {item.name}
              </Item>
            ))}
          </Column>
        ))}
      </div>
    </DragDropProvider>
  );
}
