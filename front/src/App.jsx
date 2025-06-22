import React, { useState, useEffect } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { Column } from "./components/Column";
import { Item } from "./components/Item";
import "./index.css";

import useSWR from "swr";


const fetcher = (url) => fetch(url).then(res => res.json());

export default function App() {
  const { data, error, isLoading, mutate } = useSWR("http://localhost:3000/items", fetcher, {
    refreshInterval: 1000, // Refresh every second
    revalidateOnFocus: false, // Disable revalidation on focus
  });

  const [itemObject, setItemObject] = useState();

  useEffect(() => {
    if (data) {
      setItemObject(data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div>
        <div>Loading items...</div>
        <pre>data: {JSON.stringify(data, null, 2)}</pre>
        <pre>isLoading: {JSON.stringify(isLoading)}</pre>
      </div>
    );
  }else{
    // console.log("itemObject", itemObject);
  }

  if (!data || Object.keys(data).length === 0 || !itemObject ) {
    return (
      <div>
        <div>Loading items...</div>
        <pre>data: {JSON.stringify(data, null, 2)}</pre>
      </div>
    );// Show loading state while items are being initialized
  }

  if (error) {
    return <div>Error loading items: {error.message}</div>; // Handle error state
  }

  const handleRefresh = () => {
    console.log("Refreshing data...");
    mutate(); // Trigger a revalidation of the data
  };

  return (
    <>
      <button onClick={() => handleRefresh()}>refresh</button>
      <DragDropProvider
        onDragOver={(event) => {
          const { operation } = event;
          console.log(operation)
          // ここで入れ替えないとColumnの子要素がないとかでエラーが出る
          setItemObject((itemObject) => move(itemObject, event));
          }
        }
        onDragEnd={(event) => {
          const { operation, canceled } = event;
          const sortable = operation.source.sortable;
          const groupValue = Object.entries(itemObject).filter(([key]) => key == sortable.group);
          const initialGroupValue = Object.entries(itemObject).filter(([key]) => key == sortable.initialGroup);
          console.log(
            operation.target,
            sortable.id,
            // items.getvalue()
            groupValue,
            initialGroupValue,
            canceled ? "canceled" : "completed"
          );
          // setItemObject((itemObject) => move(itemObject, event));
        }}
      >
        <div className="Root">
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
        </div>
      </DragDropProvider>
    </>
  );
}
