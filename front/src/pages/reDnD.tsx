import { useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { DragStartEvent, DragEndEvent } from "@dnd-kit/core"; // ここを変更
import { move } from "@dnd-kit/helpers";
// import { Column } from "../components/Column.tsx"; // 削除
import { Item } from "../components/Item.tsx";
import DropArea from "../components/Droppable.tsx";

import { Container, Box, Typography } from '@mui/material';

interface ItemData {
  id: number;
  name: string;
}

interface ColumnData {
  [columnId: string]: ItemData[];
}

export default function DndContainer() {
    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                Drag and Drop Example
            </Typography>
            <Typography variant="body1" paragraph>
                This is a simple drag and drop example using React DnD.
            </Typography>
            <DnD />
        </Container>
    );
}

const DnD: React.FC = () => {
      const [items, setItems] = useState<ColumnData>({
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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            <DragDropProvider
                onDragStart={(event: DragStartEvent) => {
                    const { operation } = event;
                    console.log(
                        operation.source,
                        operation.target,
                    );
                }}
                onDragEnd={(event: DragEndEvent) => {
                    const { operation, canceled } = event;
                    console.log(
                        operation.source,
                        operation.target,
                        canceled ? "canceled" : "completed"
                    );
                    setItems((prevItems) => move(prevItems, event));
                }}
            >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                    {Object.entries(items).map(([column, itemList]) => {
                        return (
                            <DropArea key={column} id={column}>
                                {itemList.map((item, index) => (
                                    <Item key={item.id} id={item.id.toString()} index={index} column={column}>
                                        {item.name}
                                    </Item>
                                ))}
                            </DropArea>
                        )
                    })}
                </Box>
            </DragDropProvider>
        </Box>
    );
}