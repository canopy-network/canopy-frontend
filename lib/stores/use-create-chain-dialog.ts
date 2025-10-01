import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface CreateChainDialogStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
}

export const useCreateChainDialog = create<CreateChainDialogStore>()(
  devtools(
    (set) => ({
      isOpen: false,
      open: () => set({ isOpen: true }, false, "open"),
      close: () => set({ isOpen: false }, false, "close"),
      setOpen: (open: boolean) => set({ isOpen: open }, false, "setOpen"),
    }),
    { name: "CreateChainDialog" }
  )
);
