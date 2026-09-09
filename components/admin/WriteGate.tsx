"use client";

import { createContext, useContext } from "react";

const WriteContext = createContext(true);

export function WriteProvider({ writable, children }: { writable: boolean; children: React.ReactNode }) {
  return <WriteContext.Provider value={writable}>{children}</WriteContext.Provider>;
}

export function useCanWrite() {
  return useContext(WriteContext);
}

export function WriteFieldset({ children }: { children: React.ReactNode }) {
  const writable = useCanWrite();
  return (
    <fieldset disabled={!writable} style={{ display: "contents" }}>
      {children}
    </fieldset>
  );
}
