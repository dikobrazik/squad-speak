import { useMemo, useReducer } from "react";
import type { ChatMessage } from "@/src/services/DataChannel";

type State = {
  byId: Record<string, ChatMessage>;
  order: string[];
};

const initialState: State = {
  byId: {},
  order: [],
};

function insertSorted(
  order: string[],
  byId: Record<string, ChatMessage>,
  message: ChatMessage,
) {
  const idx = order.findIndex((id) => byId[id].createdAt > message.createdAt);

  if (idx === -1) return [...order, message.id];

  return [...order.slice(0, idx), message.id, ...order.slice(idx)];
}

function messagesReducer(state: State, action: any): State {
  switch (action.type) {
    case "message/add": {
      const m = action.payload;

      // idempotent
      if (state.byId[m.id]) {
        return {
          ...state,
          byId: {
            ...state.byId,
            [m.id]: { ...state.byId[m.id], ...m },
          },
        };
      }

      const byId = { ...state.byId, [m.id]: m };
      const order = insertSorted(state.order, byId, m);

      return { byId, order };
    }

    case "messages/addBatch": {
      const byId = { ...state.byId };
      const order = [...state.order];

      for (const m of action.payload) {
        if (byId[m.id]) {
          byId[m.id] = { ...byId[m.id], ...m };
          continue;
        }
        byId[m.id] = m;
        order.push(m.id);
      }

      order.sort((a, b) => byId[a].createdAt - byId[b].createdAt);

      return { byId, order };
    }

    case "message/update": {
      const m = action.payload;
      if (!state.byId[m.id]) return state;

      return {
        ...state,
        byId: {
          ...state.byId,
          [m.id]: { ...state.byId[m.id], ...m },
        },
      };
    }

    case "message/remove": {
      const { id } = action.payload;
      if (!state.byId[id]) return state;

      const { [id]: _, ...byId } = state.byId;

      return {
        byId,
        order: state.order.filter((mid) => mid !== id),
      };
    }

    case "messages/reset":
      return initialState;

    default:
      return state;
  }
}

export function useMessages() {
  const [state, dispatch] = useReducer(messagesReducer, initialState);

  const actions = useMemo(
    () => ({
      add(message: ChatMessage) {
        dispatch({ type: "message/add", payload: message });
      },

      addBatch(messages: ChatMessage[]) {
        dispatch({
          type: "messages/addBatch",
          payload: messages,
        });
      },

      update(message: ChatMessage) {
        dispatch({
          type: "message/update",
          payload: message,
        });
      },

      remove(id: string) {
        dispatch({
          type: "message/remove",
          payload: { id },
        });
      },

      reset() {
        dispatch({ type: "messages/reset" });
      },
    }),
    [],
  );

  const list = useMemo(
    () => state.order.map((id) => state.byId[id]),
    [state.order, state.byId],
  );

  return {
    messages: list, // готовый массив для рендера
    byId: state.byId, // если нужен доступ по id
    order: state.order,
    ...actions,
  };
}
