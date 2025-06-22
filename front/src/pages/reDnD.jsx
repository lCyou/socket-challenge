import React, { useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { Column } from "../components/Column";
import { Item } from "../components/Item";
import "../index.css";
import DropArea from "../components/Droppable";

export default function DndContainer() {
    return (
        <div className="DndContainer">
            <h1>Drag and Drop Example</h1>
            <p>This is a simple drag and drop example using React DnD.</p>
            <DnD />
            <></>
        </div>
    );
}

const DnD = () => {
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
        pico: [
          { id: 11, name: "karen" },
          { id: 12, name: "lisa" },
          { id: 13, name: "mike" },
        ],
        foo: [
          { id: 14, name: "nina" },
          { id: 15, name: "oliver" },
          { id: 16, name: "paul" },
        ],
        bar: [
          { id: 17, name: "quinn" },
          { id: 18, name: "rachel" },
          { id: 19, name: "sara" },
        ],
        baz: [
          { id: 20, name: "tom" },
          { id: 21, name: "uma" },
          { id: 22, name: "vicky" },
        ],
        qux: [
          { id: 23, name: "will" },
          { id: 24, name: "xena" },
          { id: 25, name: "yara" },
        ],
        quux: [
          { id: 26, name: "zack" },
          { id: 27, name: "aaron" },
          { id: 28, name: "bella" },
        ],
        quuux: [
          { id: 29, name: "cathy" },
          { id: 30, name: "dylan" },
          { id: 31, name: "ella" },
        ],

      });

    return (
        <div className="DnD">
            <DragDropProvider
                // onDragOver={(event) => {
                //     // setItems((items) => move(items, event));
                // }}
                onDragStart={(event) => {
                    const { operation } = event;
                    console.log(
                        operation.source,
                        operation.target,
                    );
                }}
                onDragEnd={(event ) => {
                    const { operation, canceled } = event;
                    console.log(
                        operation.source,
                        operation.target,
                        canceled ? "canceled" : "completed"
                    );
                    setItems((items) => move(items, event));
                }}
            >
                <div className="Root">
                    {Object.entries(items).map(([column, items]) => {
                        // console.log("column", column, items);
                        return (
                            <DropArea key={column.id} id={column}>
                                {items.map((item, index) => (
                                    <Item key={item.id} id={item.name} index={index} column={column}>
                                        {item.name}
                                    </Item>
                                ))}
                            </DropArea>
                        )
                    })}
                </div>
            </DragDropProvider>
        </div>
    );
}