import { useState, useEffect } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { DragOverEvent, DragEndEvent } from "@dnd-kit/core"; // ここを変更
import { move } from "@dnd-kit/helpers";
import { Column } from "./components/Column.tsx";
import { Item } from "./components/Item.tsx";

import useSWR from "swr";

import { Box, Button, CircularProgress, Typography, Container } from '@mui/material';

interface ItemData {
  id: string;
  name: string;
}

interface ColumnData {
  [columnId: string]: ItemData[];
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function App() {
  const { data, error, isLoading, mutate } = useSWR<ColumnData>("http://localhost:3000/items", fetcher, {
    refreshInterval: 1000,
    revalidateOnFocus: false,
  });

  const [itemObject, setItemObject] = useState<ColumnData | undefined>();

  useEffect(() => {
    if (data) {
      setItemObject(data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading items...</Typography>
      </Container>
    );
  }

  if (!data || Object.keys(data).length === 0 || !itemObject ) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading items...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">Error loading items: {error.message}</Typography>
      </Container>
    );
  }

  const handleRefresh = () => {
    console.log("Refreshing data...");
    mutate();
  };

  return (
    <Container>
      <Button variant="contained" onClick={handleRefresh} sx={{ my: 2 }}>Refresh</Button>
      <DragDropProvider
        onDragOver={(event: DragOverEvent) => {
          const { operation } = event;
          console.log(operation)
          setItemObject((prevItemObject) => prevItemObject ? move(prevItemObject, event) : undefined);
          }
        }
        onDragEnd={(event: DragEndEvent) => {
          const { operation, canceled } = event;
          const sortable = operation.source.sortable;
          if (itemObject) {
            const groupValue = Object.entries(itemObject).filter(([key]) => key == sortable.group);
            const initialGroupValue = Object.entries(itemObject).filter(([key]) => key == sortable.initialGroup);
            console.log(
              operation.target,
              sortable.id,
              groupValue,
              initialGroupValue,
              canceled ? "canceled" : "completed"
            );
          }
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
          {Object.entries(itemObject).map(([column, itemList]) => (
            <Column key={column} id={column}>
              {Array.isArray(itemList)
                ? itemList.map((item, index) => (
                    <Item key={item.id} id={item.id} index={index} column={column}>
                      {item.name}
                    </Item>
                  ))
                : null}
            </Column>
          ))}
        </Box>
      </DragDropProvider>
    </Container>
  );
}